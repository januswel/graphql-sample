import * as cdk from "aws-cdk-lib";
import {
  aws_apigateway as ApiGateway,
  aws_ec2 as Ec2,
  aws_iam as Iam,
  aws_lambda as Lambda,
  aws_lambda_nodejs as LambdaNodejs,
  aws_rds as Rds,
  aws_secretsmanager as SecretsManager,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class InfraStack extends cdk.Stack {
  public readonly vpc: Ec2.IVpc;
  public readonly bastionSecurityGroup: Ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const VPC_CIDR = "10.0.0.0/16";
    const DATABASE_VERSION = Rds.AuroraPostgresEngineVersion.VER_15_2;
    const DATABASE_USERNAME = "postgres";
    const DATABASE_PORT = 5432;
    const DATABASE_PARAMETERS = {
      "pgaudit.log": "all",
      "pgaudit.role": "rds_pgaudit",
      shared_preload_libraries: "pgaudit",
      timezone: "Asia/Tokyo",
    };
    const SECRET_EXCLUDE_CHARACTERS = "!\"#$%&'()*+,/:;<=>?@[\\]^`{|}.-_~";

    const databaseSecret = new SecretsManager.Secret(this, "DatabaseSecret", {
      secretName: "DatabaseSecret",
      generateSecretString: {
        excludeCharacters: SECRET_EXCLUDE_CHARACTERS,
        excludePunctuation: true,
        generateStringKey: "password",
        includeSpace: false,
        passwordLength: 32,
        requireEachIncludedType: true,
        secretStringTemplate: JSON.stringify({
          username: DATABASE_USERNAME,
        }),
      },
    });

    const vpc = new Ec2.Vpc(this, "ApolloServerVPC", {
      ipAddresses: Ec2.IpAddresses.cidr(VPC_CIDR),
      maxAzs: 3,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: "PrivateIsolated",
          subnetType: Ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });
    this.vpc = vpc;
    this.exportValue(vpc.vpcId);
    const subnets = vpc.selectSubnets({
      subnetType: Ec2.SubnetType.PRIVATE_ISOLATED,
    });

    new Ec2.InterfaceVpcEndpoint(this, "SecretsManagerVpcEndpoint", {
      vpc,
      subnets,
      service: Ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
    });

    const apolloServerSecurityGroup = new Ec2.SecurityGroup(
      this,
      "ApolloServerSecurityGroup",
      {
        vpc,
        securityGroupName: "ApolloServerSecurityGroup",
        description: "Allow outbound traffic from the Apollo Server",
        allowAllOutbound: true,
      }
    );
    const secretRotatorSecurityGroupt = new Ec2.SecurityGroup(
      this,
      "SecretRotatorSecurityGroup",
      {
        vpc,
        securityGroupName: "SecretRotatorSecurityGroup",
        description: "Allow outbound traffic from the secret rotator",
        allowAllOutbound: true,
      }
    );
    const bastionSecurityGroup = new Ec2.SecurityGroup(
      this,
      "BastionSecurityGroup",
      {
        vpc,
        securityGroupName: "BastionSecurityGroup",
        allowAllOutbound: true,
      }
    );
    this.bastionSecurityGroup = bastionSecurityGroup;
    this.exportValue(bastionSecurityGroup.securityGroupId);
    const databaseSecurityGroup = new Ec2.SecurityGroup(
      this,
      "DatabaseSecurityGroup",
      {
        vpc,
        securityGroupName: "DatabaseSecurityGroup",
        description: "Allow outbound traffic from the database",
        allowAllOutbound: true,
      }
    );
    databaseSecurityGroup.addIngressRule(
      Ec2.Peer.securityGroupId(apolloServerSecurityGroup.securityGroupId),
      Ec2.Port.tcp(DATABASE_PORT),
      "Allow inbound traffic from the Apollo Server"
    );
    databaseSecurityGroup.addIngressRule(
      Ec2.Peer.securityGroupId(secretRotatorSecurityGroupt.securityGroupId),
      Ec2.Port.tcp(DATABASE_PORT),
      "Allow inbound traffic from the secret rotator"
    );
    databaseSecurityGroup.addIngressRule(
      bastionSecurityGroup,
      Ec2.Port.tcp(5432),
      "Allow PostgreSQL access from bastion"
    );

    const databaseClusterParameterGroup = new Rds.ParameterGroup(
      this,
      "DatabaseClusterParameterGroup",
      {
        engine: Rds.DatabaseClusterEngine.auroraPostgres({
          version: DATABASE_VERSION,
        }),
        parameters: DATABASE_PARAMETERS,
      }
    );

    const subnetGroup = new Rds.SubnetGroup(this, "IsolatedSubnetGroup", {
      vpc,
      subnetGroupName: "IsolatedSubnetGroup",
      description: "Isolated Subnet group",
      vpcSubnets: {
        onePerAz: true,
        subnetType: Ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    const auroraServerlessDatabaseCluster = new Rds.DatabaseCluster(
      this,
      "AuroraServerlessCluster",
      {
        clusterIdentifier: "AuroraServerlessCluster",
        engine: Rds.DatabaseClusterEngine.auroraPostgres({
          version: DATABASE_VERSION,
        }),
        credentials: Rds.Credentials.fromSecret(databaseSecret),
        parameterGroup: databaseClusterParameterGroup,
        serverlessV2MaxCapacity: 1,
        serverlessV2MinCapacity: 0.5,
        writer: Rds.ClusterInstance.serverlessV2("writer", {
          scaleWithWriter: true,
        }),
        readers: [
          Rds.ClusterInstance.serverlessV2("reader1", {
            scaleWithWriter: true,
          }),
          Rds.ClusterInstance.serverlessV2("reader2"),
        ],
        vpc,
        subnetGroup,
        securityGroups: [databaseSecurityGroup],
      }
    );
    auroraServerlessDatabaseCluster.addRotationSingleUser({
      automaticallyAfter: cdk.Duration.days(3),
      excludeCharacters: SECRET_EXCLUDE_CHARACTERS,
      securityGroup: secretRotatorSecurityGroupt,
      vpcSubnets: subnets,
    });

    const apolloServerIamPolicy = new Iam.ManagedPolicy(
      this,
      "ApolloServerIamPolicy",
      {
        managedPolicyName: "ApolloServerIamPolicy",
        statements: [
          new Iam.PolicyStatement({
            effect: Iam.Effect.ALLOW,
            actions: ["secretsmanager:GetSecretValue"],
            resources: [auroraServerlessDatabaseCluster.secret?.secretArn!],
          }),
        ],
      }
    );

    const apolloServerIamRole = new Iam.Role(this, "ApolloServerIamRole", {
      assumedBy: new Iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "ApolloServerIamRole",
      managedPolicies: [
        Iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        Iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
        apolloServerIamPolicy,
      ],
    });

    const lambda = new LambdaNodejs.NodejsFunction(this, "Lambda", {
      functionName: "ApolloServer",
      runtime: Lambda.Runtime.NODEJS_18_X,
      entry: "src/index.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(10),
      environment: {
        SECRET_ID: auroraServerlessDatabaseCluster.secret?.secretArn!,
      },
      role: apolloServerIamRole,
      vpc,
      vpcSubnets: subnets,
      securityGroups: [apolloServerSecurityGroup],
      bundling: {
        target: "node18",
        minify: true,
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [];
          },
          beforeInstall(inputDir: string, outputDir: string): string[] {
            return [];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [
              `mkdir -p ${outputDir}/graphql`,
              `cp ${inputDir}/packages/server/graphql/schema.graphql ${outputDir}/graphql`,
              `cp ${inputDir}/packages/server/prisma/schema.prisma ${outputDir}`,
              `cp ${inputDir}/node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node ${outputDir}`,
            ];
          },
        },
      },
    });

    const apiGateway = new ApiGateway.RestApi(this, "ApiGateway", {
      restApiName: "ApolloServer",
    });
    apiGateway.root.addMethod("POST", new ApiGateway.LambdaIntegration(lambda));
    apiGateway.root.addMethod("GET", new ApiGateway.LambdaIntegration(lambda));
  }
}
