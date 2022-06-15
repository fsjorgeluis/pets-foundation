import { Stack, aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IMultiStackProps } from '../src/interfaces/multi-stack.interface';

export class LayerStack extends Stack {
	public readonly petFoundationLayer: lambda.LayerVersion;

	constructor(scope: Construct, id: string, props: IMultiStackProps) {
		super(scope, id, props);

		this.petFoundationLayer = new lambda.LayerVersion(
			this,
			'PetFoundationLayer',
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
