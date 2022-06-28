const { DynamoDB } = require('aws-sdk');

const {
	keyFormatter,
	wordNormalizer,
	capitalize,
	objectCleaner,
} = require('/opt/custom/nodejs/node_modules/key-formatter');

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

const findAll = async (foundationPK: string): Promise<any> => {
	const db = new DynamoDB.DocumentClient();

	const params = {
		TableName: TABLE_NAME,
		KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
		ExpressionAttributeValues: {
			':pk': keyFormatter('FOUNDATION', foundationPK),
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
	const { pk } = event.queryStringParameters || '';
	const petType = event.queryStringParameters?.petType || '';
	const petName = event.queryStringParameters?.petName || '';
	const petBreed = event.queryStringParameters?.petBreed || '';

	try {
		const data = await findAll(pk);
		const result = await filterData({ petType, petName, petBreed }, data);
		const statusCode: number = data.Items.length < 1 ? 404 : 200;

		const response: Record<string, any> = {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers':
					'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
				'Access-Control-Allow-Methods': 'OPTIONS,GET',
			},
			statusCode,
		};

		if (statusCode === 200) {
			response['body'] = JSON.stringify(result);
		} else {
			response['body'] = JSON.stringify({ message: 'Not found' });
		}

		return response;
	} catch (error) {
		console.log('Error retrieving all pets: ', error);
		return {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers':
					'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
				'Access-Control-Allow-Methods': 'OPTIONS,GET',
			},
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
