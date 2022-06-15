import { Stack, aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IMultiStackProps } from '../src/interfaces/multi-stack.interface';

export class DynamoStack extends Stack {
	public readonly petFoundationTable: dynamodb.Table;

	constructor(scope: Construct, id: string, props?: IMultiStackProps) {
		super(scope, id, props);

		this.petFoundationTable = new dynamodb.Table(this, 'PetFoundation', {
			partitionKey: {
				name: 'PK',
				type: dynamodb.AttributeType.STRING,
			},
			sortKey: {
				name: 'SK',
				type: dynamodb.AttributeType.STRING,
			},
			tableName: `PetsFoundation-${props?.stage}`,
		});
	}
}
