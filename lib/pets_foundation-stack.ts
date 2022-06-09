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

		// DynamoDB stack for foundation
		const dynamoFoundationTable = new dynamodb.Table(this, 'FoundationTable', {
			partitionKey: {
				name: 'foundationId',
				type: dynamodb.AttributeType.STRING,
			},
			tableName: 'FoundationTable',
		});

		// DynamoDB stack for pets
		const dynamoPetsTable = new dynamodb.Table(this, 'PetsTable', {
			partitionKey: {
				name: 'petId',
				type: dynamodb.AttributeType.STRING,
			},
			tableName: 'PetsTable',
		});

		// Lambda stack for foundation
		const findAllFoundations = new lambda.Function(this, 'findAllFoundations', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'findAll-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas/foundations'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		const createFoundation = new lambda.Function(this, 'createFoundation', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'create-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas/foundations'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		const findOneFoundation = new lambda.Function(this, 'findOneFoundation', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'findOne-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas/foundations'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		const updateFoundation = new lambda.Function(this, 'updateFoundation', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'update-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas/foundations'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		const deleteFoundation = new lambda.Function(this, 'deleteFoundation', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'delete-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas/foundations'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		// Lambda stack for pets
		const createPet = new lambda.Function(this, 'createPet', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'create-pet.handler',
			code: lambda.Code.fromAsset('./src/lambdas/pets'),
			environment: {
				TABLE_NAME: dynamoPetsTable.tableName,
				PRIMARY_KEY: 'petId',
			},
		});

		const findAllPets = new lambda.Function(this, 'findAllPets', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'findAll-pet.handler',
			code: lambda.Code.fromAsset('./src/lambdas/pets'),
			environment: {
				TABLE_NAME: dynamoPetsTable.tableName,
				PRIMARY_KEY: 'petId',
			},
		});

		const findOnePet = new lambda.Function(this, 'findOnePet', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'findOne-pet.handler',
			code: lambda.Code.fromAsset('./src/lambdas/pets'),
			environment: {
				TABLE_NAME: dynamoPetsTable.tableName,
				PRIMARY_KEY: 'petId',
			},
		});

		const deletePet = new lambda.Function(this, 'deletePet', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'delete-pet.handler',
			code: lambda.Code.fromAsset('./src/lambdas/pets'),
			environment: {
				TABLE_NAME: dynamoPetsTable.tableName,
				PRIMARY_KEY: 'petId',
			},
		});

		// Assign IAM role to Lambda foundation function
		dynamoFoundationTable.grantWriteData(createFoundation);
		dynamoFoundationTable.grantReadData(findAllFoundations);
		dynamoFoundationTable.grantReadData(findOneFoundation);
		dynamoFoundationTable.grantReadWriteData(updateFoundation);
		dynamoFoundationTable.grantReadWriteData(deleteFoundation);

		// Assign IAM role to lambda pets function
		dynamoPetsTable.grantWriteData(createPet);
		dynamoPetsTable.grantReadData(findAllPets);
		dynamoPetsTable.grantReadData(findOnePet);
		dynamoPetsTable.grantReadWriteData(deletePet);

		// API Gateway stack
		const api = new apigw.RestApi(this, 'PetsFoundationAPI', {
			restApiName: 'PetsFoundationAPI',
			description: 'Pets Foundation API',
			deployOptions: {
				stageName: 'dev',
			},
		});

		// Foundation resources
		const foundationsRootResource = api.root.addResource('foundations');

		const createFoundationEndpoint = new apigw.LambdaIntegration(
			createFoundation
		);

		const findAllFoundationEndpoint = new apigw.LambdaIntegration(
			findAllFoundations
		);

		foundationsRootResource.addMethod('POST', createFoundationEndpoint);
		foundationsRootResource.addMethod('GET', findAllFoundationEndpoint);

		const foundationByIdResource =
			foundationsRootResource.addResource('{foundationId}');

		const findOneFoundationEndpoint = new apigw.LambdaIntegration(
			findOneFoundation
		);

		const updateFoundationEndpoint = new apigw.LambdaIntegration(
			updateFoundation
		);

		const deleteFoundationEndpoint = new apigw.LambdaIntegration(
			deleteFoundation
		);

		foundationByIdResource.addMethod('GET', findOneFoundationEndpoint);
		foundationByIdResource.addMethod('PUT', updateFoundationEndpoint);
		foundationByIdResource.addMethod('DELETE', deleteFoundationEndpoint);

		// Pets resources
		const petsRootResource = api.root.addResource('pets');

		const createPetEndpoint = new apigw.LambdaIntegration(createPet);

		const findAllPetsEndpoint = new apigw.LambdaIntegration(findAllPets);

		petsRootResource.addMethod('POST', createPetEndpoint);
		petsRootResource.addMethod('GET', findAllPetsEndpoint);

		const petByIdResource = petsRootResource.addResource('{petId}');

		const findOnePetEndpoint = new apigw.LambdaIntegration(findOnePet);

		const deletePetEndpoint = new apigw.LambdaIntegration(deletePet);

		petByIdResource.addMethod('GET', findOnePetEndpoint);
		petByIdResource.addMethod('DELETE', deletePetEndpoint);

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
