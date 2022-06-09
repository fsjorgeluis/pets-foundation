const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const createPet = async (body: Record<string, any>) => {
	const pet = typeof body === 'object' ? body : JSON.parse(body);
	const ID =
		String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now();

	pet[PRIMARY_KEY] = ID;

	const params = {
		TableName: TABLE_NAME,
		Item: pet,
	};

	try {
		await db.put(params).promise();
		return { message: 'Hosted pet' };
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any): Promise<any> => {
	try {
		const response = await createPet(event.body);
		return {
			statusCode: 201,
			body: JSON.stringify(response),
		};
	} catch (error) {
		console.log('Yay we got an error hosting pet: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
