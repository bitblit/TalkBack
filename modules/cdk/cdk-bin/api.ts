#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DockerImageCode, DockerImageFunction, FunctionUrl, FunctionUrlAuthType, HttpMethod, Function } from 'aws-cdk-lib/aws-lambda';

import { Skill } from 'cdk-alexa-skill';

const app = new cdk.App();
const envUSA = { account: '104623921864', region: 'us-east-1' };


const skillBackendLambdaFunction = new Function(this, 'Function', {
  /// ...
});

const skill = new Skill(app, 'Skill', {
  endpointLambdaFunction: skillBackendLambdaFunction, // @aws-cdk/aws-lambda.IFunction object containing backend code for the Alexa Skill
  skillPackagePath: 'src/skill-package', // path to your skill package
  alexaVendorId: 'M3INYB190HXV56', // vendor ID of Alexa Developer account
  lwaClientId: 'XXXXXXXXXX', // client ID of LWA Security Profile
  lwaClientSecret: cdk.SecretValue.secretsManager('lwa-client-secret'), // @aws-cdk/core.SecretValue object containing client secret of LWA Security Profile
  lwaRefreshToken: cdk.SecretValue.secretsManager('lwa-refresh-token') // @aws-cdk/core.SecretValue object containing refresh token of LWA Security Profile
});