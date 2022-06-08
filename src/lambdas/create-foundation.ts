const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

export const handler = async (event: any): Promise<any> => {
	const foundation =
		typeof event.body === 'object' ? event.body : JSON.parse(event.body);
	const ID =
		String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now();

	foundation[PRIMARY_KEY] = ID;

	const params = {
		TableName: TABLE_NAME,
		Item: foundation,
	};

	try {
		await db.put(params).promise();
		return {
			statusCode: 201,
			body: JSON.stringify({
				message: 'Foundation created',
			}),
		};
	} catch (error) {
		console.log('Error retrieving foundations: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
