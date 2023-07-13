import * as cdk from "aws-cdk-lib";
import { aws_ec2 as Ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";

interface BastionStackProps extends cdk.StackProps {
  readonly vpc: Ec2.IVpc;
  readonly bastionSecurityGroup: Ec2.SecurityGroup;
}
export class BastionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BastionStackProps) {
    super(scope, id, props);

    const { vpc } = props;
    const subnets = vpc.selectSubnets({
      subnetType: Ec2.SubnetType.PRIVATE_ISOLATED,
    });

    new Ec2.InterfaceVpcEndpoint(this, "EC2MessagesVpcEndpoint", {
      vpc,
      subnets,
      service: Ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
    });
    new Ec2.InterfaceVpcEndpoint(this, "SSMVpcEndpoint", {
      vpc,
      subnets,
      service: Ec2.InterfaceVpcEndpointAwsService.SSM,
    });
    new Ec2.InterfaceVpcEndpoint(this, "SSMMessagesVpcEndpoint", {
      vpc,
      subnets,
      service: Ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
    });
    new Ec2.InterfaceVpcEndpoint(this, "CloudWatchLogsVpcEndpoint", {
      vpc,
      subnets,
      service: Ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });

    new Ec2.Instance(this, "BastionHost", {
      instanceName: "BastionHost",
      machineImage: Ec2.MachineImage.latestAmazonLinux2(),
      instanceType: new Ec2.InstanceType("t3.nano"),
      vpc,
      vpcSubnets: subnets,
      securityGroup: props.bastionSecurityGroup,
      ssmSessionPermissions: true,
    });
  }
}
