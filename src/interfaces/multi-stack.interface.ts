import { StackProps } from 'aws-cdk-lib';
import { DynamoStack } from '../../lib/dynamo-stack';
import { LayerStack } from '../../lib/layer-stack';
import { LambdaStack } from '../../lib/lambda-stack';

export interface IMultiStackProps extends StackProps {
	stage: string;
	name: string;
}

export interface IDynamoLambdaLayerProps extends IMultiStackProps {
	dynamoStack: DynamoStack;
	layerStack: LayerStack;
}

export interface ILambdaStackProps extends IMultiStackProps {
	lambdaStack: LambdaStack;
}
