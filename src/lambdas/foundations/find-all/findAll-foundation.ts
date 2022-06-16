const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

const findAll = async () => {
	const params = {
		TableName: TABLE_NAME,
		FilterExpression: 'contains(#SK, :sk)',
		ExpressionAttributeNames: { '#SK': 'SK' },
		ExpressionAttributeValues: {
			':sk': 'METADATA',
		},
	};

	try {
		const response = await db.scan(params).promise();

		return response;
	} catch (error) {
		return error;
	}
};

export const handler = async (): Promise<Record<string, any>> => {
	try {
		const response = await findAll();

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
