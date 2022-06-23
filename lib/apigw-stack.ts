import {
	Stack,
	aws_apigateway as apigw,
	aws_lambda as lambda,
	Duration,
	Arn,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IApiGwStackProps } from '../src/interfaces';

export class ApiGwStack extends Stack {
	constructor(scope: Construct, id: string, props: IApiGwStackProps) {
		super(scope, id, props);

		const {
			lambdaStack: { petsFoundation },
		} = props;

		const ALLOWED_HEADERS = [
			'Content-Type',
			'X-Amz-Date',
			'X-Amz-Security-Token',
			'Authorization',
			'authorizationToken',
			'X-Api-Key',
			'X-Requested-With',
			'Accept',
			'Access-Control-Allow-Methods',
			'Access-Control-Allow-Origin',
			'Access-Control-Allow-Headers',
		];

		/* Mock integration that will be used to handle CORS requests. */
		const standardCorsMockIntegration = new apigw.MockIntegration({
			integrationResponses: [
				{
					statusCode: '200',
					responseParameters: {
						'method.response.header.Access-Control-Allow-Headers': `'${ALLOWED_HEADERS.join(
							','
						)}'`,
						'method.response.header.Access-Control-Allow-Origin': "'*'",
						'method.response.header.Access-Control-Allow-Credentials':
							"'false'",
						'method.response.header.Access-Control-Allow-Methods':
							"'OPTIONS,GET,PUT,PATCH,POST,DELETE'",
					},
				},
			],
			passthroughBehavior: apigw.PassthroughBehavior.NEVER,
			requestTemplates: {
				'application/json': '{"statusCode": 200}',
			},
		});

		/* Methods tha will be used in options to handle CORS requests. */
		const optionsMethodResponse = {
			statusCode: '200',
			responseModels: {
				'application/json': apigw.Model.EMPTY_MODEL,
			},
			responseParameters: {
				'method.response.header.Access-Control-Allow-Headers': true,
				'method.response.header.Access-Control-Allow-Methods': true,
				'method.response.header.Access-Control-Allow-Credentials': true,
				'method.response.header.Access-Control-Allow-Origin': true,
			},
		};

		/**
		 * Getting the lambda function from the lambda stack avoiding circular 	* dependency.
		 */
		const GetAuthLambda = lambda.Function.fromFunctionArn(
			this,
			'CustomAuthorizer',
			petsFoundation.authorize.functionArn
		);

		/* Creating a new authorizer for the API Gateway. */
		const auth = new apigw.TokenAuthorizer(this, 'TokenAuthorizer', {
			identitySource: apigw.IdentitySource.header('authorizationToken'),
			handler: GetAuthLambda,
			authorizerName: `CustomAuthorizer-${props.stage}`,
			resultsCacheTtl: Duration.seconds(0),
		});

		/* Creating a new API Gateway. */
		const api = new apigw.RestApi(this, 'PetsFoundationAPI', {
			restApiName: `PetsFoundationAPI-${props.stage}`,
			description: 'Pets Foundation API',
			deployOptions: {
				stageName: props.stage,
			},
		});

		/* Giving permission to API Gateway to invoke the lambda function. */
		new lambda.CfnPermission(this, 'CustomAuthorizerPermission', {
			action: 'lambda:InvokeFunction',
			principal: 'apigateway.amazonaws.com',
			functionName: GetAuthLambda.functionArn,
			sourceArn: Arn.format(
				{
					service: 'execute-api',
					resource: api.restApiId,
					resourceName: 'authorizers/*',
				},
				this
			),
		});

		/* Creating a foundation validation model for the API Gateway. */
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

		/* Creating a pets validation model for the API Gateway. */
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

		/* Resources. */
		const foundationResource = api.root.addResource('foundations');
		const petResource = api.root.addResource('pets');
		const petByIdResource = petResource.addResource('{petId}');
		const adoptPetByIdResource = petByIdResource.addResource('adopt');

		/* Foundation integrations */
		const createFoundationEndpoint = new apigw.LambdaIntegration(
			petsFoundation.createFoundation
		);
		const findAllFoundationEndpoint = new apigw.LambdaIntegration(
			petsFoundation.findAllFoundations
		);

		/* Pet integrations */
		const createPetEndpoint = new apigw.LambdaIntegration(
			petsFoundation.addPet
		);
		const findAllPetsEndpoint = new apigw.LambdaIntegration(
			petsFoundation.findAllPets
		);
		const findOnePetEndpoint = new apigw.LambdaIntegration(
			petsFoundation.findOnePet
		);
		const updatePetEndpoint = new apigw.LambdaIntegration(
			petsFoundation.updatePet
		);
		const deletePetEndpoint = new apigw.LambdaIntegration(
			petsFoundation.removePet
		);
		const adoptPetEndpoint = new apigw.LambdaIntegration(
			petsFoundation.adoptPet
		);

		/* Methods, some with validation model. */
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
			authorizationType: apigw.AuthorizationType.CUSTOM,
			authorizer: auth,
		});
		foundationResource.addMethod('GET', findAllFoundationEndpoint, {
			authorizationType: apigw.AuthorizationType.CUSTOM,
			authorizer: auth,
		});
		foundationResource.addMethod('OPTIONS', standardCorsMockIntegration, {
			authorizationType: apigw.AuthorizationType.NONE,
			methodResponses: [optionsMethodResponse],
		});

		petResource.addMethod('POST', createPetEndpoint, {
			requestValidator: new apigw.RequestValidator(this, 'PetBodyValidator', {
				restApi: api,
				requestValidatorName: 'petBodyValidator',
				validateRequestBody: true,
			}),
			requestModels: {
				'application/json': petModel,
			},
			authorizationType: apigw.AuthorizationType.CUSTOM,
			authorizer: auth,
		});
		petResource.addMethod('GET', findAllPetsEndpoint, {
			authorizationType: apigw.AuthorizationType.CUSTOM,
			authorizer: auth,
		});
		petResource.addMethod('OPTIONS', standardCorsMockIntegration, {
			authorizationType: apigw.AuthorizationType.NONE,
			methodResponses: [optionsMethodResponse],
		});

		petByIdResource.addMethod('GET', findOnePetEndpoint, {
			authorizationType: apigw.AuthorizationType.CUSTOM,
			authorizer: auth,
		});
		petByIdResource.addMethod('PATCH', updatePetEndpoint, {
			authorizationType: apigw.AuthorizationType.CUSTOM,
			authorizer: auth,
		});
		petByIdResource.addMethod('DELETE', deletePetEndpoint, {
			authorizationType: apigw.AuthorizationType.CUSTOM,
			authorizer: auth,
		});
		petByIdResource.addMethod('OPTIONS', standardCorsMockIntegration, {
			authorizationType: apigw.AuthorizationType.NONE,
			methodResponses: [optionsMethodResponse],
		});

		adoptPetByIdResource.addMethod('PATCH', adoptPetEndpoint, {
			authorizationType: apigw.AuthorizationType.CUSTOM,
			authorizer: auth,
		});
		adoptPetByIdResource.addMethod('OPTIONS', standardCorsMockIntegration, {
			authorizationType: apigw.AuthorizationType.NONE,
			methodResponses: [optionsMethodResponse],
		});
	}
}
