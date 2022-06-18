import {
	Stack,
	aws_dynamodb as dynamodb,
	RemovalPolicy,
	StackProps,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IMultiStackProps } from '../src/interfaces';

export class DynamoStack extends Stack {
	public readonly petsFoundationTable: dynamodb.Table;

	constructor(
		scope: Construct,
		id: string,
		custom: IMultiStackProps,
		props?: StackProps
	) {
		super(scope, id, props);

		this.petsFoundationTable = new dynamodb.Table(this, 'PetFoundation', {
			partitionKey: {
				name: 'PK',
				type: dynamodb.AttributeType.STRING,
			},
			sortKey: {
				name: 'SK',
				type: dynamodb.AttributeType.STRING,
			},
			tableName: `PetsFoundation-${custom.stage}`,
			removalPolicy: RemovalPolicy.DESTROY,
		});
	}
}
