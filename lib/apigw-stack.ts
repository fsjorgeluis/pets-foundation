import {
	Stack,
	aws_apigateway as apigw,
	aws_lambda as lambda,
	Duration,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ILambdaStackProps } from '../src/interfaces';

export class ApiGwStack extends Stack {
	constructor(scope: Construct, id: string, props: ILambdaStackProps) {
		super(scope, id, props);

		const { lambdaStack } = props;

		// Get authorizer lambda function through avoiding circular dependency
		const GetAuthFunction = lambda.Function.fromFunctionArn(
			this,
			'CustomAuthorizer',
			lambdaStack.petsFoundation.authorize.functionArn
		);

		// Authorizer definition for API Gateway
		const auth = new apigw.TokenAuthorizer(this, 'TokenAuthorizer', {
			identitySource: apigw.IdentitySource.header('authorizationToken'),
			handler: GetAuthFunction,
			resultsCacheTtl: Duration.seconds(0),
		});

		// API Gateway stack
		const api = new apigw.RestApi(this, 'PetsFoundationAPI', {
			restApiName: `PetsFoundationAPI-${props.stage}`,
			description: 'Pets Foundation API',
			deployOptions: {
				stageName: props.stage,
			},
			defaultMethodOptions: {
				authorizer: auth,
			},
		});

		// API validation models
		const foundationModel = new apigw.Model(this, 'FoundationModelValidator', {
			restApi: api,
			contentType: 'application/json',
			description: 'Validate body request on foundation creation',
			modelName: 'foundationModelCDK',
			schema: {
				type: apigw.JsonSchemaType.OBJECT,
				required: ['foundationName'],
				properties: {
					foundationName: { type: apigw.JsonSchemaType.STRING },
					foundationAddress: { type: apigw.JsonSchemaType.STRING },
				},
			},
		});

		const petModel = new apigw.Model(this, 'PetModelValidator', {
			restApi: api,
			contentType: 'application/json',
			description: 'Validate body request on pet creation',
			modelName: 'petModelCDK',
			schema: {
				type: apigw.JsonSchemaType.OBJECT,
				required: ['petName', 'petBreed', 'petType'],
				properties: {
					petName: { type: apigw.JsonSchemaType.STRING },
					petAge: { type: apigw.JsonSchemaType.NUMBER },
					petBreed: { type: apigw.JsonSchemaType.STRING },
					petType: { type: apigw.JsonSchemaType.STRING },
				},
			},
		});

		// Foundation resources
		const foundationResource = api.root.addResource('foundations');
		const createFoundationEndpoint = new apigw.LambdaIntegration(
			lambdaStack.petsFoundation.createFoundation
		);
		const findAllFoundationEndpoint = new apigw.LambdaIntegration(
			lambdaStack.petsFoundation.findAllFoundations
		);
		// Pets resources
		const petResource = api.root.addResource('pets');
		const petByIdResource = petResource.addResource('{petId}');
		const adoptPetByIdResource = petByIdResource.addResource('adopt');

		const createPetEndpoint = new apigw.LambdaIntegration(
			lambdaStack.petsFoundation.addPet
		);
		const findAllPetsEndpoint = new apigw.LambdaIntegration(
			lambdaStack.petsFoundation.findAllPets
		);
		const findOnePetEndpoint = new apigw.LambdaIntegration(
			lambdaStack.petsFoundation.findOnePet
		);
		const updatePetEndpoint = new apigw.LambdaIntegration(
			lambdaStack.petsFoundation.updatePet
		);
		const deletePetEndpoint = new apigw.LambdaIntegration(
			lambdaStack.petsFoundation.removePet
		);
		const adoptPetEndpoint = new apigw.LambdaIntegration(
			lambdaStack.petsFoundation.adoptPet
		);

		// Foundation methods
		foundationResource.addMethod('POST', createFoundationEndpoint, {
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

		foundationResource.addMethod('GET', findAllFoundationEndpoint);

		// Pets methods
		petResource.addMethod('POST', createPetEndpoint, {
			requestValidator: new apigw.RequestValidator(this, 'PetBodyValidator', {
				restApi: api,
				requestValidatorName: 'petBodyValidator',
				validateRequestBody: true,
			}),
			requestModels: {
				'application/json': petModel,
			},
		});

		petResource.addMethod('GET', findAllPetsEndpoint);
		petByIdResource.addMethod('GET', findOnePetEndpoint);
		petByIdResource.addMethod('PATCH', updatePetEndpoint);
		adoptPetByIdResource.addMethod('PATCH', adoptPetEndpoint);
		petByIdResource.addMethod('DELETE', deletePetEndpoint);

		// Little security for API Gateway based on api key
		// const plan = api.addUsagePlan('UsagePlan', {
		// 	name: 'EASY',
		// 	throttle: {
		// 		rateLimit: 20,
		// 		burstLimit: 2,
		// 	},
		// });

		// const key = api.addApiKey('ApiKey');
		// plan.addApiKey(key);

		// Outputs
		// new CfnOutput(this, 'OutputApiEndpoint', {
		// 	exportName: `api-url-${props.stage}`,
		// 	value: api.url,
		// });
	}
}
