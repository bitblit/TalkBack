#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
var cdk = require("aws-cdk-lib");
var aws_iam_1 = require("aws-cdk-lib/aws-iam");
var path_1 = require("path");
var epsilon_1 = require("@bitblit/epsilon");
var paratrade_graphql_spec_1 = require("@bitblit/paratrade-graphql-spec");
var app = new cdk.App();
var envUSA = { account: '104623921864', region: 'us-east-1' };
var epsilonApiStackProps = {
    webMemorySizeMb: 384,
    backgroundMemorySizeMb: 3000,
    webTimeoutSeconds: 20,
    backgroundTimeoutSeconds: 900,
    env: envUSA,
    extraEnvironmentalVars: {
        Extra_01: 'c',
    },
    webLambdaPingMinutes: 2,
    dockerFileFolder: path_1.default.join(__dirname, '..', '..', '..'),
    dockerFileName: 'lambda-dockerfile',
    lambdaSecurityGroupIds: ['02a89b66b0a3cb4ae'],
    vpcSubnetIds: ['05967afadca940b99'],
    vpcId: 'vpc-04025729ae680df73',
    batchInstancesEc2KeyPairName: 'ErigirCommonKey',
    additionalPolicyStatements: [
        new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: ['s3:*'],
            resources: [
                'arn:aws:s3:::paratrade-data/*',
                'arn:aws:s3:::paratrade-real-estate-site/*',
                'arn:aws:s3:::paratrade-site/*',
                'arn:aws:s3:::paratrade-data',
                'arn:aws:s3:::paratrade-real-estate-site',
                'arn:aws:s3:::paratrade-site',
            ],
        }),
        new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: ['dynamodb:*'],
            resources: ['arn:aws:dynamodb:us-east-1:104623921864:table/*'],
        }),
        new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: ['kms:Encrypt', 'kms:Decrypt'],
            resources: ['arn:aws:kms:us-east-1:104623921864:key/*'],
        }),
        new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: ['ssm:GetParameter'],
            resources: ['arn:aws:ssm:us-east-1:104623921864:parameter/ParatradeConfiguration'],
        }),
        new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: ['rds-db:connect'],
            resources: ['arn:aws:rds-db:us-east-1:104623921864:dbuser:db-NQK3SIYRBWHYWDIAADEATAX2U4/paratrade_prod_user'],
        }),
    ],
    /* If you don't specify 'env', this stack will be environment-agnostic.
     * Account/Region-dependent features and context lookups will not work,
     * but a single synthesized template can be deployed anywhere. */
    /* Uncomment the next line to specialize this stack for the AWS Account
     * and Region that are implied by the current CLI configuration. */
    // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    /* Uncomment the next line if you know exactly what Account and Region you
     * want to deploy the stack to. */
    // env: { account: '123456789012', region: 'us-east-1' },
    /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
};
var epsilonApiStack = new epsilon_1.EpsilonApiStack(app, 'ParatradeApi', epsilonApiStackProps);
var epsilonWebsiteStackProps = {
    env: envUSA,
    targetBucketName: paratrade_graphql_spec_1.ParatradeSharedConstants.PARATRADE_WEBSITE_BUCKET,
    cloudFrontDomainNames: ['para.trade'],
    cloudFrontHttpsCertificateArn: 'arn:aws:acm:us-east-1:104623921864:certificate/6613f8ac-c2aa-43a4-9cc4-39eeb82e53c0',
    apiDomainName: epsilonApiStack.apiDomain,
    pathsToAssets: ['../website/dist'],
    route53Handling: epsilon_1.EpsilonWebsiteStackPropsRoute53Handling.Update,
    simpleAdditionalMappings: [{ bucketName: paratrade_graphql_spec_1.ParatradeSharedConstants.PARATRADE_DATA_BUCKET, pathPattern: 'data/*' }],
};
new epsilon_1.EpsilonWebsiteStack(app, 'ParatradeWebsite', epsilonWebsiteStackProps);
