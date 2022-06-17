import { Stack, aws_s3 as s3, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IMultiStackProps } from '../src/interfaces';

export class S3Stack extends Stack {
	public readonly petFoundationBucket: s3.Bucket;

	constructor(scope: Construct, id: string, props?: IMultiStackProps) {
		super(scope, id, props);

		// Resource definitions
		this.petFoundationBucket = new s3.Bucket(this, 'PetFoundationBucket', {
			versioned: false,
			bucketName: props?.name,
			publicReadAccess: false,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			removalPolicy: RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});
	}
}
