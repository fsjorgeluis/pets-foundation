// TODO: return headers to avoid cors, add this chunk to apigateway
const { DynamoDB } = require('aws-sdk');

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const findOne = async ({ foundationId }: { foundationId: string }) => {
	const db = new DynamoDB.DocumentClient();

	const params = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: foundationId,
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
		console.log('Error retrieving foundations: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
