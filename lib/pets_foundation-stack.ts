import {
	Stack,
	StackProps,
	aws_dynamodb as dynamodb,
	aws_lambda as lambda,
	aws_apigateway as apigw,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PetsFoundationStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		// The code that defines your stack goes here

		// example resource
		// const queue = new sqs.Queue(this, 'PetsFoundationQueue', {
		//   visibilityTimeout: cdk.Duration.seconds(300)
		// });

		// DynamoDB stack
		const dynamoFoundationTable = new dynamodb.Table(this, 'FoundationTable', {
			partitionKey: {
				name: 'foundationId',
				type: dynamodb.AttributeType.STRING,
			},
			tableName: 'FoundationTable',
		});

		// Lambda stack
		const findAllFoundations = new lambda.Function(this, 'findAllFoundations', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'findAll-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		const createFoundation = new lambda.Function(this, 'createFoundations', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'create-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		const findOneFoundation = new lambda.Function(this, 'findOneFoundation', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'findOne-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		const deleteFoundation = new lambda.Function(this, 'deleteFoundation', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'delete-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		// Assign IAM role to Lambda function
		dynamoFoundationTable.grantWriteData(createFoundation);
		dynamoFoundationTable.grantReadData(findAllFoundations);
		dynamoFoundationTable.grantReadData(findOneFoundation);
		dynamoFoundationTable.grantReadWriteData(deleteFoundation);

		// API Gateway stack
		const api = new apigw.RestApi(this, 'PetsFoundationAPI', {
			restApiName: 'PetsFoundationAPI',
			description: 'Pets Foundation API',
			deployOptions: {
				stageName: 'dev',
			},
		});

		const foundationsRootResource = api.root.addResource('foundations');

		const findAllFoundationEndpoint = new apigw.LambdaIntegration(
			findAllFoundations
		);

		const createFoundationEndpoint = new apigw.LambdaIntegration(
			createFoundation
		);

		foundationsRootResource.addMethod('POST', createFoundationEndpoint);
		foundationsRootResource.addMethod('GET', findAllFoundationEndpoint);

		const foundationByIdResource =
			foundationsRootResource.addResource('{foundationId}');

		const findOneFoundationEndpoint = new apigw.LambdaIntegration(
			findOneFoundation
		);
		const deleteFoundationEndpoint = new apigw.LambdaIntegration(
			deleteFoundation
		);

		foundationByIdResource.addMethod('GET', findOneFoundationEndpoint);
		foundationByIdResource.addMethod('DELETE', deleteFoundationEndpoint);

		// Little security
		const plan = api.addUsagePlan('UsagePlan', {
			name: 'EASY',
			throttle: {
				rateLimit: 20,
				burstLimit: 2,
			},
		});
		const key = api.addApiKey('ApiKey');
		plan.addApiKey(key);
	}
}
