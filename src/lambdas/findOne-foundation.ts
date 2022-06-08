const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

export const handler = async (event: any): Promise<any> => {
	const { foundationId } = event.pathParameters;

	if (!foundationId) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				Error: 'Missing foundationId',
			}),
		};
	}

	const params = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: foundationId,
		},
	};

	try {
		const response = await db.get(params).promise();
		if (!response.Item) {
			return {
				statusCode: 404,
			};
		}
		return {
			statusCode: 200,
			body: JSON.stringify(response.Items),
		};
	} catch (error) {
		console.log('Error retrieving foundations: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
