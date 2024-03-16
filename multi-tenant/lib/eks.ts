import * as cdk from 'aws-cdk-lib';
import {readFileSync} from 'fs';
import {Construct} from "constructs";
import {KubectlLayer} from 'aws-cdk-lib/lambda-layer-kubectl';

interface EksStackProps extends cdk.StackProps {
    targetSecurityGroupID: string
    targetRoleArn: string
}

//const VpcID = 'vpc-0f8a463d3c84ab974'

export class EksStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: EksStackProps) {
        super(scope, id, props);

        const vpc = cdk.aws_ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
            vpcId: 'vpc-0f8a463d3c84ab974',
            privateSubnetIds: ['subnet-058b88b8168ced8d5'],
            publicSubnetIds: ['subnet-0661a443325cbfd09'],
            availabilityZones: ['eu-central-1']
        })
        const role = cdk.aws_iam.Role.fromRoleArn(this, 'Role', props.targetRoleArn)

         new cdk.aws_eks.Cluster(this, 'eksCluster', {
            version: cdk.aws_eks.KubernetesVersion.V1_29,
            kubectlLayer: new KubectlLayer(this, 'KubeCTL'),
            defaultCapacity: 0,
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
                keyName: 'TeamC_Key',
                userData: cdk.Fn.base64(userData)
            }
        });
    }
}


