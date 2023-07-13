#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InfraStack } from "../lib/infra-stack";
import { BastionStack } from "../lib/bastion-stack";

const app = new cdk.App();
const infra = new InfraStack(app, "InfraStack", {});

new BastionStack(app, "BastionStack", {
  vpc: infra.vpc,
  bastionSecurityGroup: infra.bastionSecurityGroup,
});
