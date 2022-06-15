#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { DynamoStack } from '../lib/dynamo-stack';
import { LayerStack } from '../lib/layer-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { ApiGwStack } from '../lib/apigw-stack';
// import { PetsFoundationStack } from '../lib/pets_foundation-stack';

const app = new cdk.App();
const appPrefix = 'pets-foundation';
const stage: string = app.node.tryGetContext('stage') || 'dev';
const sharedProps = {
	env: { account: '159688459304', region: 'us-east-1' },
	stage: stage,
};
if (!['dev', 'prod'].includes(stage)) {
	throw new Error(`Unknown environment: ${stage}`);
}

const dynamoStack = new DynamoStack(app, 'DynamoStack', {
	...sharedProps,
	name: `${appPrefix}-dynamo-${stage}`,
});

const layerStack = new LayerStack(app, 'LayerStack', {
	...sharedProps,
	name: `${appPrefix}-layer-${stage}`,
});

const lambdaStack = new LambdaStack(app, 'LambdaStack', {
	...sharedProps,
	name: `${appPrefix}-lambda-${stage}`,
	dynamoStack: dynamoStack,
	layerStack: layerStack,
});

new ApiGwStack(app, 'ApiStack', {
	...sharedProps,
	name: `${appPrefix}-api-${stage}`,
	lambdaStack: lambdaStack,
});

// new PetsFoundationStack(app, 'PetsFoundationStack', {
// 	env: { account: '159688459304', region: 'us-east-1' },
// });
