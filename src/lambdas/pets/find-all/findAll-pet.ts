const { DynamoDB } = require('aws-sdk');

const { wordNormalizer, capitalize, objectCleaner } = require('key-formatter');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

async function filterData(
	filterType: Record<string, any>,
	data: Record<string, any>
): Promise<Record<string, any>> {
	const evaluator: Record<string, any> = objectCleaner(filterType);

	let response: Record<string, any> = {};

	switch (Object.keys(evaluator)[0]) {
		case 'petBreed':
			response = data.Items.filter(
				(item: any) => item.PetBreed === capitalize(evaluator.breedType)
			);
			break;

		case 'petType':
			response = data.Items.filter(
				(item: any) => item.PetType === wordNormalizer(evaluator.petType)
			);
			break;

		case 'petName':
			response = data.Items.filter(
				(item: any) => item.PetName === wordNormalizer(evaluator.petName)
			);
			break;

		default:
			response = data.Items;
	}

	return response;
}

const findAll = async (foundation: string): Promise<any> => {
	const params = {
		TableName: TABLE_NAME,
		KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
		ExpressionAttributeValues: {
			':pk': foundation.toUpperCase(),
			':sk': 'PET',
		},
	};

	try {
		const response = await db.query(params).promise();

		return response;
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any): Promise<Record<string, any>> => {
	const { foundationPK } = event.headers;
	const petType = event.queryStringParameters?.petType || '';
	const petName = event.queryStringParameters?.petName || '';
	const petBreed = event.queryStringParameters?.petBreed || '';

	try {
		const response = await findAll(foundationPK);
		const result = await filterData({ petType, petName, petBreed }, response);

		return {
			statusCode: 200,
			body: JSON.stringify(result),
		};
	} catch (error) {
		console.log('Error retrieving all pets: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
