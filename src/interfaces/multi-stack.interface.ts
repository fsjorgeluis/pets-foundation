import { StackProps } from 'aws-cdk-lib';
import { DynamoStack } from '../../lib/dynamo-stack';
import { LayerStack } from '../../lib/layer-stack';
import { LambdaStack } from '../../lib/lambda-stack';
import { S3Stack } from '../../lib/s3-stack';
import { SNSStack } from '../../lib/sns-stack';

export interface IMultiStackProps {
	stage: string;
	name: string;
	emailUser?: string;
	emailPassword?: string;
	emailFrom?: string;
	emailTo?: string;
}

export interface ILayerStackProps
	extends IMultiStackProps,
		Omit<StackProps, 'description'> {
	description: string;
}

export interface ILambdaStackProps extends IMultiStackProps, StackProps {
	layerStack: LayerStack;
	dynamoStack: DynamoStack;
	s3Stack: S3Stack;
	snsStack: SNSStack;
}

export interface IApiGwStackProps extends IMultiStackProps, StackProps {
	lambdaStack: LambdaStack;
}

export interface IS3StackProps
	extends Omit<IMultiStackProps, 'name'>,
		StackProps {
	bucketName: string;
}

export interface ISNSStackProps
	extends Omit<IMultiStackProps, 'name'>,
		StackProps {
	topicName: string;
}
