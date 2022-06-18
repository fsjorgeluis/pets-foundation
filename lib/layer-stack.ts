import { Stack, aws_lambda as lambda, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ILayerStackProps } from '../src/interfaces';

export class LayerStack extends Stack {
	public readonly petsFoundationLayer: lambda.LayerVersion;

	constructor(scope: Construct, id: string, props?: ILayerStackProps) {
		super(scope, id, props);

		this.petsFoundationLayer = new lambda.LayerVersion(
			this,
			'PetsFoundationLayer',
			{
				compatibleRuntimes: [
					lambda.Runtime.NODEJS_14_X,
					lambda.Runtime.NODEJS_16_X,
				],
				code: lambda.Code.fromAsset('./src/layers'),
				description: 'Pet Foundation helpers Layer',
			}
		);
	}
}
