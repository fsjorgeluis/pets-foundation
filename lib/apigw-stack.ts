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

		const { lambdaStack } = props;

		/**
		 * Getting the lambda function from the lambda stack avoiding circular 	* dependency.
		 */
		const GetAuthLambda = lambda.Function.fromFunctionArn(
			this,
			'CustomAuthorizer',
			lambdaStack.petsFoundation.authorize.functionArn
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
			defaultMethodOptions: {
				authorizer: auth,
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

		/* Foundation resources. */
		const foundationResource = api.root.addResource('foundations');
		const createFoundationEndpoint = new apigw.LambdaIntegration(
			lambdaStack.petsFoundation.createFoundation
		);
		const findAllFoundationEndpoint = new apigw.LambdaIntegration(
			lambdaStack.petsFoundation.findAllFoundations
		);
		/* Pets resources. */
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

		/* Adding a method to the resource. */
		/* Foundation methods. */
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

		/* Pets methods. */
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

		// Outputs
		// new CfnOutput(this, 'OutputApiEndpoint', {
		// 	exportName: `api-url-${props.stage}`,
		// 	value: api.url,
		// });
	}
}
