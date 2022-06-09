const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const createFoundation = async (body: Record<string, any>) => {
	const foundation = typeof body === 'object' ? body : JSON.parse(body);
	const ID =
		String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now();

	foundation[PRIMARY_KEY] = ID;

	const params = {
		TableName: TABLE_NAME,
		Item: foundation,
	};

	try {
		await db.put(params).promise();
		return { message: 'Foundation created' };
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any): Promise<any> => {
	try {
		const response = await createFoundation(event.body);
		return {
			statusCode: 201,
			body: JSON.stringify(response),
		};
	} catch (error) {
		console.log('Error creating foundations: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
