#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import path from 'path';
import {
  EpsilonApiStack,
  EpsilonApiStackProps,
  EpsilonWebsiteStack,
  EpsilonWebsiteStackProps,
  EpsilonWebsiteStackPropsRoute53Handling,
} from '@bitblit/epsilon';
import { ParatradeSharedConstants } from '@bitblit/paratrade-graphql-spec';

const app = new cdk.App();
const envUSA = { account: '104623921864', region: 'us-east-1' };

const epsilonApiStackProps: EpsilonApiStackProps = {
  webMemorySizeMb: 384,
  backgroundMemorySizeMb: 3000,

  webTimeoutSeconds: 20,
  backgroundTimeoutSeconds: 900,

  env: envUSA,
  extraEnvironmentalVars: {
    Extra_01: 'c',
  },
  webLambdaPingMinutes: 2,
  dockerFileFolder: path.join(__dirname, '..', '..', '..'),
  dockerFileName: 'lambda-dockerfile',
  lambdaSecurityGroupIds: ['02a89b66b0a3cb4ae'], // Lambda-all-outbound-no-inbound
  vpcSubnetIds: ['05967afadca940b99'], // us-east-1a
  vpcId: 'vpc-04025729ae680df73',
  batchInstancesEc2KeyPairName: 'ErigirCommonKey',
  additionalPolicyStatements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
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
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:*'],
      resources: ['arn:aws:dynamodb:us-east-1:104623921864:table/*'],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['kms:Encrypt', 'kms:Decrypt'],
      resources: ['arn:aws:kms:us-east-1:104623921864:key/*'],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ssm:GetParameter'],
      resources: ['arn:aws:ssm:us-east-1:104623921864:parameter/ParatradeConfiguration'],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
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

const epsilonApiStack: EpsilonApiStack = new EpsilonApiStack(app, 'ParatradeApi', epsilonApiStackProps);

const epsilonWebsiteStackProps: EpsilonWebsiteStackProps = {
  env: envUSA,
  targetBucketName: ParatradeSharedConstants.PARATRADE_WEBSITE_BUCKET, //'paratrade-website-prod',
  cloudFrontDomainNames: ['para.trade'],
  cloudFrontHttpsCertificateArn: 'arn:aws:acm:us-east-1:104623921864:certificate/6613f8ac-c2aa-43a4-9cc4-39eeb82e53c0',
  apiDomainName: epsilonApiStack.apiDomain,
  pathsToAssets: ['../website/dist'],
  route53Handling: EpsilonWebsiteStackPropsRoute53Handling.Update,
  simpleAdditionalMappings: [{ bucketName: ParatradeSharedConstants.PARATRADE_DATA_BUCKET, pathPattern: 'data/*' }],
};

new EpsilonWebsiteStack(app, 'ParatradeWebsite', epsilonWebsiteStackProps);
