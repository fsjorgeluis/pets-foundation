import { StackProps } from 'aws-cdk-lib';

export interface IMultiStackProps extends StackProps {
	stage?: string;
}
