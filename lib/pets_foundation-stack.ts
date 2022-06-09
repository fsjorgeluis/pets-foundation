import {
	Stack,
	StackProps,
	aws_dynamodb as dynamodb,
	aws_lambda as lambda,
	aws_apigateway as apigw,
} from 'aws-cdk-lib';
import { JsonSchemaType } from 'aws-cdk-lib/aws-apigateway';
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
		const findAllFoundations = new lambda.Function(this, 'FindAllFoundations', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'findAll-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas/foundations'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		const createFoundation = new lambda.Function(this, 'CreateFoundation', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'create-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas/foundations'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		const findOneFoundation = new lambda.Function(this, 'FindOneFoundation', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'findOne-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas/foundations'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		const updateFoundation = new lambda.Function(this, 'UpdateFoundation', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'update-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas/foundations'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		const deleteFoundation = new lambda.Function(this, 'DeleteFoundation', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'delete-foundation.handler',
			code: lambda.Code.fromAsset('./src/lambdas/foundations'),
			environment: {
				TABLE_NAME: dynamoFoundationTable.tableName,
				PRIMARY_KEY: 'foundationId',
			},
		});

		// Lambda stack for pets
		const createPet = new lambda.Function(this, 'CreatePet', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'create-pet.handler',
			code: lambda.Code.fromAsset('./src/lambdas/pets'),
			environment: {
				TABLE_NAME: dynamoPetsTable.tableName,
				PRIMARY_KEY: 'petId',
				// FK_FOUNDATION_ID: 'foundationId',
			},
		});

		const findAllPets = new lambda.Function(this, 'FindAllPets', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'findAll-pet.handler',
			code: lambda.Code.fromAsset('./src/lambdas/pets'),
			environment: {
				TABLE_NAME: dynamoPetsTable.tableName,
				PRIMARY_KEY: 'petId',
			},
		});

		const findOnePet = new lambda.Function(this, 'FindOnePet', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'findOne-pet.handler',
			code: lambda.Code.fromAsset('./src/lambdas/pets'),
			environment: {
				TABLE_NAME: dynamoPetsTable.tableName,
				PRIMARY_KEY: 'petId',
			},
		});

		const updatePet = new lambda.Function(this, 'UpdatePet', {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: 'update-pet.handler',
			code: lambda.Code.fromAsset('./src/lambdas/pets'),
			environment: {
				TABLE_NAME: dynamoPetsTable.tableName,
				PRIMARY_KEY: 'petId',
			},
		});

		const deletePet = new lambda.Function(this, 'DeletePet', {
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
		dynamoPetsTable.grantReadWriteData(updatePet);
		dynamoPetsTable.grantReadWriteData(deletePet);

		// API Gateway stack
		const api = new apigw.RestApi(this, 'PetsFoundationAPI', {
			restApiName: 'PetsFoundationAPI',
			description: 'Pets Foundation API',
			deployOptions: {
				stageName: 'dev',
			},
		});

		const foundationModel = new apigw.Model(this, 'FoundationModelValidator', {
			restApi: api,
			contentType: 'application/json',
			description: 'Validate body request on foundation creation',
			modelName: 'foundationModelCDK',
			schema: {
				type: JsonSchemaType.OBJECT,
				required: ['foundationName'],
				properties: {
					foundationName: { type: JsonSchemaType.STRING },
					foundationAddress: { type: JsonSchemaType.STRING },
				},
			},
		});

		const petModel = new apigw.Model(this, 'PetModelValidator', {
			restApi: api,
			contentType: 'application/json',
			description: 'Validate body request on pet creation',
			modelName: 'petModelCDK',
			schema: {
				type: JsonSchemaType.OBJECT,
				required: ['petName', 'petBreed', 'petType'],
				properties: {
					petName: { type: JsonSchemaType.STRING },
					petAge: { type: JsonSchemaType.NUMBER },
					petBreed: { type: JsonSchemaType.STRING },
					petType: { type: JsonSchemaType.STRING },
				},
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

		foundationsRootResource.addMethod('POST', createFoundationEndpoint, {
			requestValidator: new apigw.RequestValidator(
				this,
				'FoundationBodyValidator',
				{
					restApi: api,
					requestValidatorName: 'foundationBodyValidator',
					validateRequestBody: true,
				}
			),
			requestModels: {
				'application/json': foundationModel,
			},
		});
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

		petsRootResource.addMethod('POST', createPetEndpoint, {
			requestValidator: new apigw.RequestValidator(this, 'PetBodyValidator', {
				restApi: api,
				requestValidatorName: 'petBodyValidator',
				validateRequestBody: true,
			}),
			requestModels: {
				'application/json': petModel,
			},
		});
		petsRootResource.addMethod('GET', findAllPetsEndpoint);

		const petByIdResource = petsRootResource.addResource('{petId}');

		const findOnePetEndpoint = new apigw.LambdaIntegration(findOnePet);

		const updatePetEndpoint = new apigw.LambdaIntegration(updatePet);

		const deletePetEndpoint = new apigw.LambdaIntegration(deletePet);

		petByIdResource.addMethod('GET', findOnePetEndpoint);
		petByIdResource.addMethod('PATCH', updatePetEndpoint);
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
