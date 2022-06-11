const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const findOne = async ({ petId }: { petId: string }) => {
	const params = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: petId,
		},
	};

	try {
		const response = await db.get(params).promise();
		return response;
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any): Promise<Record<string, any>> => {
	try {
		const response = await findOne(event.pathParameters);
		return {
			statusCode: 200,
			body: JSON.stringify(response.Item),
		};
	} catch (error) {
		console.log('Error retrieving pet: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
