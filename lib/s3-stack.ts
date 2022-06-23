import { Stack, aws_s3 as s3, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IS3StackProps } from '../src/interfaces';

export class S3Stack extends Stack {
	public readonly petsFoundationBucket: s3.Bucket;

	constructor(scope: Construct, id: string, props?: IS3StackProps) {
		super(scope, id, props);

		this.petsFoundationBucket = new s3.Bucket(this, 'PetsFoundationBucket', {
			versioned: false,
			bucketName: props?.bucketName,
			publicReadAccess: false,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			removalPolicy: RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});
	}
}
