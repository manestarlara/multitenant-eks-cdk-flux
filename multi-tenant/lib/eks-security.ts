import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";

export class EksSecurity extends cdk.Stack {
    public readonly eksRole: string
    public readonly eksSecurityGroupID: string

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const eksRole = new cdk.aws_iam.Role(this, 'eksRole', {
            assumedBy: new cdk.aws_iam.CompositePrincipal(
            new cdk.aws_iam.ServicePrincipal('ec2.amazonaws.com'),
            new cdk.aws_iam.ServicePrincipal('eks.amazonaws.com'),
            new cdk.aws_iam.ServicePrincipal('cloudformation.amazonaws.com')
            ),
            managedPolicies: [
                cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy'),
                cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'),
                cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'),
            ],
        });
        this.eksRole = eksRole.roleArn;

        const eksSecurityGroup = new cdk.aws_ec2.SecurityGroup(this, 'eksSecurityGroup', {
            vpc: cdk.aws_ec2.Vpc.fromLookup(this, 'VPC', {vpcId: 'Your VPC ID'}),
            description: 'Security group for Amazon EKS cluster',
            allowAllOutbound: true,
        });
        this.eksSecurityGroupID = eksSecurityGroup.securityGroupId

        eksSecurityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcp(22), 'Allow SSH access');
        eksSecurityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcp(80), 'Allow HTTP access');
        eksSecurityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcp(443), 'Allow HTTPS access');
        eksSecurityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcp(6443), 'Allow Kubernetes API access');
        eksSecurityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcp(2379), 'Allow etcd server client API');
        eksSecurityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcpRange(10250, 10252), 'Allow kubelet API');
        eksSecurityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.udpRange(6783, 6784), 'Allow Calico');
    };
}
