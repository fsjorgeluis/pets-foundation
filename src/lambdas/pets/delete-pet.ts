const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const deleteOne = async ({ petId }: { petId: string }) => {
	const params = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: petId,
		},
	};

	try {
		await db.delete(params).promise();
		return { message: 'The pet has been successfully released' };
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any): Promise<Record<string, any>> => {
	try {
		const response = await deleteOne(event.pathParameters);
		return {
			statusCode: 200,
			body: JSON.stringify(response),
		};
	} catch (error) {
		console.log('Error releasing pet: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
