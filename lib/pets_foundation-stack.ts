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
		const findAll = new lambda.Function(this, 'findAllFoundations', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'find-all.handler',
			code: lambda.Code.fromAsset('./src/lambdas'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		// Assign IAM role to Lambda function
		dynamoFoundationTable.grantReadData(findAll);

		// API Gateway stack
		const api = new apigw.RestApi(this, 'PetsFoundationAPI', {
			restApiName: 'PetsFoundationAPI',
			description: 'Pets Foundation API',
			deployOptions: {
				stageName: 'dev',
			},
		});

		const rootAPI = api.root.addResource('foundations');
		const findAllEndpoint = new apigw.LambdaIntegration(findAll);

		rootAPI.addMethod('GET', findAllEndpoint);

		// Little security
		// const plan = api.addUsagePlan('UsagePlan', {
		// 	name: 'EASY',
		// 	throttle: {
		// 		rateLimit: 20,
		// 		burstLimit: 2,
		// 	},
		// });
		// const key = api.addApiKey('ApiKey');
		// plan.addApiKey(key);
	}
}
