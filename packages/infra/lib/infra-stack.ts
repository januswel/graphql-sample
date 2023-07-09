import * as cdk from "aws-cdk-lib";
import {
  aws_ec2 as Ec2,
  aws_rds as Rds,
  aws_iam as Iam,
  aws_lambda as Lambda,
  aws_lambda_nodejs as LambdaNodejs,
  aws_apigateway as ApiGateway,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const VPC_CIDR = "10.0.0.0/16";
    const postgresVersion = Rds.AuroraPostgresEngineVersion.VER_15_2;
    const databaseUsername = "postgres";
    const databaseCredentials =
      Rds.Credentials.fromGeneratedSecret(databaseUsername);
    const databasePort = 5432;
    const databaseParameter = {
      "pgaudit.log": "all",
      "pgaudit.role": "rds_pgaudit",
      shared_preload_libraries: "pgaudit",
      timezone: "Asia/Tokyo",
    };

    const vpc = new Ec2.Vpc(this, "Vpc", {
      ipAddresses: Ec2.IpAddresses.cidr(VPC_CIDR),
      maxAzs: 3,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: "Private",
          subnetType: Ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    new Ec2.InterfaceVpcEndpoint(this, "SecretsManagerVpcEndpoint", {
      vpc,
      service: Ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: vpc.selectSubnets({
        subnetType: Ec2.SubnetType.PRIVATE_ISOLATED,
      }),
    });

    const appSecurityGroup = new Ec2.SecurityGroup(this, "AppSecurityGroup", {
      vpc,
      securityGroupName: "AppSecurityGroup",
      description: "Allow inbound traffic to the app",
      allowAllOutbound: true,
    });

    const databaseSecurityGroup = new Ec2.SecurityGroup(
      this,
      "DatabaseSecurityGroup",
      {
        vpc,
        securityGroupName: "DatabaseSecurityGroup",
        description: "Allow inbound traffic to the database",
        allowAllOutbound: true,
      }
    );
    databaseSecurityGroup.addIngressRule(
      Ec2.Peer.securityGroupId(appSecurityGroup.securityGroupId),
      Ec2.Port.tcp(databasePort),
      "Allow inbound traffic from the app"
    );

    const databaseClusterParameterGroup = new Rds.ParameterGroup(
      this,
      "DatabaseClusterParameterGroup",
      {
        engine: Rds.DatabaseClusterEngine.auroraPostgres({
          version: Rds.AuroraPostgresEngineVersion.VER_15_2,
        }),
        parameters: databaseParameter,
      }
    );

    const subnetGroup = new Rds.SubnetGroup(this, "SubnetGroup", {
      vpc,
      subnetGroupName: "SubnetGroup",
      description: "Subnet group",
      vpcSubnets: {
        onePerAz: true,
        subnetType: Ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    const serverlessDatabaseCluster = new Rds.DatabaseCluster(
      this,
      "ServerlessCluster",
      {
        engine: Rds.DatabaseClusterEngine.auroraPostgres({
          version: postgresVersion,
        }),
        vpc,
        subnetGroup,
        parameterGroup: databaseClusterParameterGroup,
        securityGroups: [databaseSecurityGroup],
        credentials: databaseCredentials,
        clusterIdentifier: "serverless-cluster",
        serverlessV2MaxCapacity: 2,
        serverlessV2MinCapacity: 1,
        writer: Rds.ClusterInstance.serverlessV2("writer", {
          scaleWithWriter: true,
        }),
        readers: [
          Rds.ClusterInstance.serverlessV2("reader1", {
            scaleWithWriter: true,
          }),
          Rds.ClusterInstance.serverlessV2("reader2"),
        ],
      }
    );

    const appIamPolicy = new Iam.ManagedPolicy(this, "AppIamPolicy", {
      managedPolicyName: "AppIamPolicy",
      statements: [
        new Iam.PolicyStatement({
          effect: Iam.Effect.ALLOW,
          actions: ["secretsmanager:GetSecretValue"],
          resources: [serverlessDatabaseCluster.secret?.secretArn!],
        }),
      ],
    });

    const appIamRole = new Iam.Role(this, "AppIamRole", {
      assumedBy: new Iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "AppIamRole",
      managedPolicies: [
        Iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        Iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
        appIamPolicy,
      ],
    });

    const lambda = new LambdaNodejs.NodejsFunction(this, "AppLambdaFunction", {
      functionName: "AppLambdaFunction",
      runtime: Lambda.Runtime.NODEJS_18_X,
      entry: "src/index.ts",
      handler: "handler",
      timeout: cdk.Duration.seconds(15),
      role: appIamRole,
      securityGroups: [appSecurityGroup],
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: Ec2.SubnetType.PRIVATE_ISOLATED,
      }),
      environment: {
        SECRET_ID: serverlessDatabaseCluster.secret?.secretArn!,
      },
      bundling: {
        target: "node18",
        minify: true,
        sourceMap: true,
        environment: {
          NODE_OPTIONS: "--enable-source-maps",
        },
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

    const api = new ApiGateway.RestApi(this, "Api", {
      restApiName: "Api",
      description: "Api",
    });
    api.root.addMethod("POST", new ApiGateway.LambdaIntegration(lambda));
    api.root.addMethod("GET", new ApiGateway.LambdaIntegration(lambda));
  }
}
