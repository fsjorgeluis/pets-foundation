#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import 'dotenv/config';

import { DynamoStack } from '../lib/dynamo-stack';
import { LayerStack } from '../lib/layer-stack';
import { S3Stack } from '../lib/s3-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { ApiGwStack } from '../lib/apigw-stack';
import { SNSStack } from '../lib/sns-stack';

const app = new cdk.App();
const appPrefix = 'pets-foundation';
const stage: string = app.node.tryGetContext('stage') || 'dev';
const sharedProps = {
	env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
};
if (!['dev', 'prod'].includes(stage)) {
	throw new Error(`Unknown environment: ${stage}`);
}

const dynamoStack = new DynamoStack(
	app,
	'DynamoStack',
	{
		stage: stage,
		name: `${appPrefix}-dynamo-${stage}`,
	},
	{
		...sharedProps,
		description: 'DynamoDB stack',
	}
);

const layerStack = new LayerStack(app, 'LayerStack', {
	...sharedProps,
	name: `${appPrefix}-layer-${stage}`,
	stage: stage,
	description: 'Layers for Pets Foundation API',
});

const s3Stack = new S3Stack(app, 'S3Stack', {
	...sharedProps,
	bucketName: `${appPrefix}-${process.env.AWS_BUCKET_NAME}-${stage}`,
	stage: stage,
	description: 'Pets Foundation S3 Bucket',
});

const snsStack = new SNSStack(app, 'SNSStack', {
	...sharedProps,
	topicName: `${appPrefix}-sns-topic-${stage}`,
	stage: stage,
	description: 'Pets Foundation SNS',
});

const lambdaStack = new LambdaStack(app, 'LambdaStack', {
	...sharedProps,
	name: `${appPrefix}-lambda-${stage}`,
	stage: stage,
	description: 'Pets Foundation Lambda Functions',
	layerStack: layerStack,
	dynamoStack: dynamoStack,
	s3Stack: s3Stack,
	snsStack: snsStack,

	emailUser: process.env.EMAIL_USER,
	emailPassword: process.env.EMAIL_PASSWORD,
	emailFrom: process.env.EMAIL_FROM,
	emailTo: process.env.EMAIL_TO,
});

new ApiGwStack(app, 'ApiStack', {
	...sharedProps,
	name: `${appPrefix}-api-${stage}`,
	stage: stage,
	lambdaStack: lambdaStack,
	description: 'Pets Foundation API',
});
