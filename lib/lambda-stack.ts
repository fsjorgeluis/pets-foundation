import {
	Stack,
	aws_lambda as lambda,
	aws_sns_subscriptions as subscription,
	aws_ssm as ssm,
	aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ILambdaStackProps } from '../src/interfaces';
import { lambdaFunctions } from '../src/data';

export class LambdaStack extends Stack {
	public readonly petsFoundation: Record<string, any> = {};

	constructor(scope: Construct, id: string, props: ILambdaStackProps) {
		super(scope, id, props);

		const {
			dynamoStack: { petsFoundationTable },
			s3Stack: { petsFoundationBucket },
			snsStack: { petsFoundationSNS },
		} = props;

		/* Get parameterName from the SSM Parameter Store. */
		const baseLayerArn = ssm.StringParameter.fromStringParameterName(
			this,
			'BaseLayerArn',
			`base-layer-${props.stage}`
		);

		/* Get layer Arn to share between lambdas. */
		const sharedLayer = lambda.LayerVersion.fromLayerVersionArn(
			this,
			'SharedLayer',
			baseLayerArn.stringValue
		);

		/* Returns an array of lambda objects. */
		const lambdas = lambdaFunctions(sharedLayer);

		/* Creating a lambda function for each lambda in the lambdaFunctions array. */
		for (let index = 0; index < lambdas.length; index++) {
			const lambdaDefinition = lambdas[index];
			const newLambda = new lambda.Function(this, lambdaDefinition.id, {
				runtime: lambda.Runtime.NODEJS_16_X,
				handler: `${lambdaDefinition.name}.handler`,
				code: lambda.Code.fromAsset(`./src/lambdas/${lambdaDefinition.src}`),
				layers: lambdaDefinition.layers || [],
				description: lambdaDefinition.description,
				environment: {
					TABLE_NAME: petsFoundationTable.tableName,
					PRIMARY_KEY: 'PK',
					SORT_KEY: 'SK',
					BUCKET_NAME: petsFoundationBucket.bucketName,
					SNS_TOPIC_ARN: petsFoundationSNS.topicArn,
				},
			});

			assignPermission({
				newLambda,
				permission: lambdaDefinition.permission,
				canPublish: lambdaDefinition.canPublish,
			});
			this.petsFoundation[lambdaDefinition.action] = newLambda;
		}

		/* Instantiate lambda to manage email sending */
		this.petsFoundation['sendEmail'] = new lambda.Function(
			this,
			'PetsFoundationEmailManager',
			{
				runtime: lambda.Runtime.NODEJS_16_X,
				handler: 'send-email.handler',
				code: lambda.Code.fromAsset('./src/lambdas/emails'),
				layers: [sharedLayer],
				description: 'Send Email Lambda',
				environment: {
					EMAIL_USER: props.emailUser || '',
					EMAIL_PASSWORD: props.emailPassword || '',
					EMAIL_FROM: props.emailFrom || '',
					EMAIL_TO: props.emailTo || '',
				},
			}
		);

		/* Add permissions to send mail */
		this.petsFoundation['sendEmail'].addToRolePolicy(
			new iam.PolicyStatement({
				effect: iam.Effect.ALLOW,
				actions: [
					'ses:SendEmail',
					'ses:SendRawEmail',
					'ses:SendTemplatedEmail',
				],
				resources: [
					`arn:aws:ses:${props.env?.region}:${
						Stack.of(this).account
					}:identity/${props.emailFrom}`,
				],
			})
		);

		/* Subscribing the SNS topic to the lambda functions. */
		petsFoundationSNS.addSubscription(
			new subscription.LambdaSubscription(this.petsFoundation.sendEmail)
		);

		/**
		 * Takes a lambda function, permission string and boolean, and grants
		 * appropriate permissions to Dynamo, S3 bucket and SNS topic
		 * @param lambdaFunction - lambda function to grant permissions to.
		 * @param {string} permission - permission string to grant.
		 * @param {boolean} canPublish - boolean to determine if lambda
		 * function can publish to SNS topic.
		 */
		function assignPermission({
			newLambda,
			permission,
			canPublish,
		}: {
			newLambda: lambda.Function;
			permission: string;
			canPublish: boolean;
		}) {
			switch (permission) {
				case 'write':
					petsFoundationTable.grantWriteData(newLambda);
					petsFoundationBucket.grantPut(newLambda);
					break;
				case 'read':
					petsFoundationTable.grantReadData(newLambda);
					petsFoundationBucket.grantPut(newLambda);
					break;
				case 'read-write':
					if (canPublish) {
						petsFoundationSNS.grantPublish(newLambda);
					}
					petsFoundationTable.grantReadWriteData(newLambda);
					petsFoundationBucket.grantPut(newLambda);
					break;
				default:
					break;
			}
		}
	}
}
