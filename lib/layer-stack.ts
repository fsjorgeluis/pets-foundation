import {
	Stack,
	aws_lambda as lambda,
	aws_ssm as ssm,
	CfnOutput,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ILayerStackProps } from '../src/interfaces';

export class LayerStack extends Stack {
	constructor(scope: Construct, id: string, props?: ILayerStackProps) {
		super(scope, id, props);

		const lambdaLayer = new lambda.LayerVersion(this, 'PetsFoundationLayer', {
			compatibleRuntimes: [
				lambda.Runtime.NODEJS_14_X,
				lambda.Runtime.NODEJS_16_X,
			],
			code: lambda.Code.fromAsset('./src/layers'),
			description: 'Pet Foundation helpers Layer',
		});

		/* Save SSM Parameters */
		new ssm.StringParameter(this, 'VersionArn', {
			parameterName: `base-layer-${props?.stage}`,
			stringValue: lambdaLayer.layerVersionArn,
			description: 'SSM Base Layer Version Arn',
			type: ssm.ParameterType.STRING,
			tier: ssm.ParameterTier.STANDARD,
			// simpleName: true,
		});

		// new CfnOutput(this, 'LayerVersionSSM', {
		// 	exportName: 'LayerVersionSSM',
		// 	value: ssmLayer.parameterName,
		// });
	}
}
