import { Stack, aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IDynamoLambdaLayerProps } from '../src/interfaces';
import { lambdaFunctions } from '../src/data';

export class LambdaStack extends Stack {
	public readonly petsFoundation: Record<string, any> = {};

	constructor(scope: Construct, id: string, props: IDynamoLambdaLayerProps) {
		super(scope, id, props);

		const {
			layerStack,
			dynamoStack: { petFoundationTable },
			s3Stack: { petFoundationBucket },
		} = props;

		// Get array to start instantiating lambdas
		const lambdas = lambdaFunctions(layerStack);

		for (let index = 0; index < lambdas.length; index++) {
			const lambdaDef = lambdas[index];
			const lambdaFunction = new lambda.Function(this, lambdaDef.id, {
				runtime: lambda.Runtime.NODEJS_16_X,
				handler: `${lambdaDef.name}.handler`,
				code: lambda.Code.fromAsset(`./src/lambdas/${lambdaDef.src}`),
				layers: lambdaDef.layers || [],
				description: lambdaDef.description,
				environment: {
					TABLE_NAME: petFoundationTable.tableName,
					PRIMARY_KEY: 'PK',
					SORT_KEY: 'SK',
					BUCKET_NAME: petFoundationBucket.bucketName,
				},
			});

			assignPermission(lambdaFunction, lambdaDef.permission);
			this.petsFoundation[lambdaDef.action] = lambdaFunction;
		}

		// Lambda authorizer instance
		// this.petsFoundation['auth'] = new lambda.Function(this, 'Authorizer', {
		// 	runtime: lambda.Runtime.NODEJS_16_X,
		// 	handler: 'authorizer.handler',
		// 	code: lambda.Code.fromAsset('./src/lambdas/authorizer'),
		// 	description: 'Authorizer for Pets Foundation API',
		// });

		function assignPermission(
			lambdaFunction: lambda.Function,
			permission: string
		) {
			switch (permission) {
				case 'write':
					petFoundationTable.grantWriteData(lambdaFunction);
					petFoundationBucket.grantPut(lambdaFunction);
					break;
				case 'read':
					petFoundationTable.grantReadData(lambdaFunction);
					petFoundationBucket.grantPut(lambdaFunction);
					break;
				case 'read-write':
					petFoundationTable.grantReadWriteData(lambdaFunction);
					petFoundationBucket.grantPut(lambdaFunction);
					break;
				default:
					break;
			}
		}
	}
}
