#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from "aws-cdk-lib";
import {EksSecurity} from "../lib/eks-security";
import {EksStack} from "../lib/eks";

const env = { account: '050572347738', region: 'eu-central-1' }

const app = new cdk.App();

const eksSecurity = new EksSecurity(app, 'eksSecurity', {
    env: env,
});

new EksStack(app, 'eksStack', {
    targetRoleArn: eksSecurity.eksRole,
    targetSecurityGroupID: eksSecurity.eksSecurityGroupID,
    env: env,
});

