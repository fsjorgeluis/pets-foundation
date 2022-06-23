import {
	CorsHttpMethod,
	HttpApi,
	HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import {
	HttpLambdaAuthorizer,
	HttpLambdaResponseType,
} from '@aws-cdk/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { aws_lambda as lambda, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IApiGwStackProps } from '../src/interfaces/multi-stack.interface';

export class ApiGwStack extends Stack {
	constructor(scope: Construct, id: string, props: IApiGwStackProps) {
		super(scope, id, props);

		const {
			lambdaStack: { petsFoundation },
		} = props;

		const httpApi = new HttpApi(this, 'PetsFoundationAPI', {
			description: 'Pets Foundation API',
			corsPreflight: {
				allowHeaders: [
					'Content-Type',
					'X-Amz-Date',
					'Authorization',
					'auhtorizationTokne',
					'X-Api-Key',
				],
				allowMethods: [
					CorsHttpMethod.OPTIONS,
					CorsHttpMethod.GET,
					CorsHttpMethod.POST,
					CorsHttpMethod.PUT,
					CorsHttpMethod.PATCH,
					CorsHttpMethod.DELETE,
				],
				// allowCredentials: true,
				allowOrigins: ['*'],
			},
		});

		httpApi.addRoutes({
			path: '/foundations',
			methods: [HttpMethod.POST],
			integration: new HttpLambdaIntegration(
				`create-foundation-integration-${props.stage}`,
				petsFoundation.createFoundation
			),
		});

		httpApi.addRoutes({
			path: '/foundations',
			methods: [HttpMethod.GET],
			integration: new HttpLambdaIntegration(
				`get-foundations-integration-${props.stage}`,
				petsFoundation.findAllFoundations
			),
		});

		httpApi.addRoutes({
			path: '/pets',
			methods: [HttpMethod.POST],
			integration: new HttpLambdaIntegration(
				`post-pets-integration-${props.stage}`,
				petsFoundation.addPet
			),
		});
	}
}
