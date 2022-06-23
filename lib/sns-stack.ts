import { aws_sns as sns, Stack, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ISNSStackProps } from '../src/interfaces';

export class SNSStack extends Stack {
	public readonly petsFoundationSNS: sns.Topic;

	constructor(scope: Construct, id: string, props: ISNSStackProps) {
		super(scope, id, props);

		this.petsFoundationSNS = new sns.Topic(this, 'AdoptionNotification', {
			topicName: props.topicName,
			displayName: 'pets-adoption-topic',
		});

		// Outputs
		// new CfnOutput(this, 'OutputSNSTopicARN', {
		// 	exportName: `sns-topic-${props.stage}`,
		// 	value: this.petsFoundationSNS.topicArn,
		// 	description: 'SNS Topic ARN',
		// });
	}
}
