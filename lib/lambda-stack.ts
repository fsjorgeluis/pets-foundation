import { Stack, aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ILambdaStackProps } from '../src/interfaces';
import { lambdaFunctions } from '../src/data';

export class LambdaStack extends Stack {
	public readonly petsFoundation: Record<string, any> = {};

	constructor(scope: Construct, id: string, props: ILambdaStackProps) {
		super(scope, id, props);

		const {
			layerStack,
			dynamoStack: { petFoundationTable },
			s3Stack: { petFoundationBucket },
		} = props;

		/* A function that returns an array of lambda objects. */
		const lambdas = lambdaFunctions(layerStack);

		/* Creating a lambda function for each lambda in the lambdaFunctions array. */
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

		/**
		 * This function takes a lambda and a string permission and assigns
		 * the appropriate permissions to the DynamoDB table and S3 bucket
		 * based on the string permission.
		 * @param lambdaFunction - The lambda function that you want to grant
		 * permissions to.
		 * @param {string} permission - string permission to be granted.
		 */
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
