import * as cdk from 'aws-cdk-lib';
import {readFileSync} from 'fs';
import {Construct} from "constructs";
import {KubectlLayer} from 'aws-cdk-lib/lambda-layer-kubectl';

interface EksStackProps extends cdk.StackProps {
    targetSecurityGroupID: string
    targetRoleArn: string
}

export class EksStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: EksStackProps) {
        super(scope, id, props);

        const vpc = cdk.aws_ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
            vpcId: 'Your VPC ID',
            privateSubnetIds: ['Your Private Subnet IDs'],
            publicSubnetIds: ['Your Public Subnet IDs'],
            availabilityZones: ['Your preferred Availability Zone']
        })
        const role = cdk.aws_iam.Role.fromRoleArn(this, 'Role', props.targetRoleArn)

        new cdk.aws_eks.Cluster(this, 'eksCluster', {
            version: cdk.aws_eks.KubernetesVersion.V1_29,
            defaultCapacity: 0,
            kubectlLayer: new KubectlLayer(this, 'KubeCTL'),
            clusterName: 'eksCluster',
            vpc: vpc,
            role: role,
        });

        const userData = readFileSync('./lib/userData.sh', 'utf-8');

        new cdk.aws_ec2.CfnLaunchTemplate(this, 'eksLaunchTemplate', {
            launchTemplateName: 'eksLaunchTemplate',
            launchTemplateData: {
                instanceType: 't2.medium',
                securityGroupIds: [props.targetSecurityGroupID],
                keyName: 'Your EC2 KeyPair Name',
                userData: cdk.Fn.base64(userData)
            }
        });
    }
}


