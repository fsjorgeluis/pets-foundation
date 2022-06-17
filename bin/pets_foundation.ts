#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import 'dotenv/config';

import { DynamoStack } from '../lib/dynamo-stack';
import { LayerStack } from '../lib/layer-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { ApiGwStack } from '../lib/apigw-stack';
import { S3Stack } from '../lib/s3-stack';

const app = new cdk.App();
const appPrefix = 'pets-foundation';
const stage: string = app.node.tryGetContext('stage') || 'dev';
const sharedProps = {
	env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
	stage: stage,
};
if (!['dev', 'prod'].includes(stage)) {
	throw new Error(`Unknown environment: ${stage}`);
}

const dynamoStack = new DynamoStack(app, 'DynamoStack', {
	...sharedProps,
	name: `${appPrefix}-dynamo-${stage}`,
	description: 'DynamoDB stack',
});

const layerStack = new LayerStack(app, 'LayerStack', {
	...sharedProps,
	name: `${appPrefix}-layer-${stage}`,
	description: 'Layers for Pets Foundation API',
});

const s3Stack = new S3Stack(app, 'S3Stack', {
	...sharedProps,
	name: `${appPrefix}-s3-${stage}`,
	description: 'Pets Foundation S3 Bucket',
});

const lambdaStack = new LambdaStack(app, 'LambdaStack', {
	...sharedProps,
	name: `${appPrefix}-lambda-${stage}`,
	description: 'Pets Foundation Lambda Functions',
	dynamoStack: dynamoStack,
	layerStack: layerStack,
	s3Stack: s3Stack,
});

new ApiGwStack(app, 'ApiStack', {
	...sharedProps,
	name: `${appPrefix}-api-${stage}`,
	lambdaStack: lambdaStack,
	description: 'Pets Foundation API',
});
