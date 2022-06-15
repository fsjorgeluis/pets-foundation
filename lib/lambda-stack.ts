import { Stack, aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { IDynamoLambdaLayerProps } from '../src/interfaces/multi-stack.interface';

export class LambdaStack extends Stack {
	public readonly petsFoundation: Record<string, any> = {};

	constructor(scope: Construct, id: string, props: IDynamoLambdaLayerProps) {
		super(scope, id, props);

		const { layerStack, dynamoStack } = props;

		const lambdaFunctions = [
			{
				id: 'CreateFoundation',
				name: 'create-foundation',
				src: 'foundations',
				layers: [layerStack.petFoundationLayer],
				action: 'createFoundation',
				description: 'Create a new foundation',
			},
			{
				id: 'FindAllFoundations',
				name: 'findAll-foundation',
				src: 'foundations',
				action: 'findAllFoundations',
				description: 'Find all foundations',
			},
			{
				id: 'CreatePet',
				name: 'create-pet',
				src: 'pets',
				layers: [layerStack.petFoundationLayer],
				action: 'addPet',
				description: 'Add a new pet',
			},
			{
				id: 'FindAllPets',
				name: 'findAll-pet',
				src: 'pets',
				layers: [layerStack.petFoundationLayer],
				action: 'findAllPets',
				description: 'Find all pets for specific foundation',
			},
			{
				id: 'FindOnePet',
				name: 'findOne-pet',
				src: 'pets',
				action: 'findOnePet',
				description: 'Find one pet for specific foundation by id',
			},
			{
				id: 'UpdatePet',
				name: 'update-pet',
				src: 'pets',
				layers: [layerStack.petFoundationLayer],
				action: 'updatePet',
				description: 'Update one pet for specific foundation by id',
			},
			{
				id: 'DeletePet',
				name: 'delete-pet',
				src: 'pets',
				action: 'removePet',
				description: 'Delete one pet for specific foundation by id',
			},
			{
				id: 'AdoptPet',
				name: 'adopt-pet',
				src: 'pets',
				action: 'adoptPet',
				description: 'Adopt one pet for specific foundation by id',
			},
		];

		// Generate the lambda functions
		for (let index = 0; index < lambdaFunctions.length; index++) {
			const lambdaDef = lambdaFunctions[index];
			const lambdaFunction = new lambda.Function(this, lambdaDef.id, {
				runtime: lambda.Runtime.NODEJS_16_X,
				handler: `${lambdaDef.name}.handler`,
				code: lambda.Code.fromAsset(`./src/lambdas/${lambdaDef.src}`),
				layers: lambdaDef.layers || [],
				description: lambdaDef.description,
				environment: {
					TABLE_NAME: dynamoStack.petFoundationTable.tableName,
					PRIMARY_KEY: 'PK',
					SORT_KEY: 'SK',
				},
			});

			dynamoStack.petFoundationTable.grantReadWriteData(lambdaFunction);
			this.petsFoundation[lambdaDef.action] = lambdaFunction;
		}
	}
}
