// TODO: return headers to avoid cors, add this chunk to apigateway
const { DynamoDB } = require('aws-sdk');

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const deleteOne = async ({
	foundationId,
}: {
	foundationId: string;
}): Promise<unknown> => {
	const db = new DynamoDB.DocumentClient();

	const params = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: foundationId,
		},
	};

	try {
		await db.delete(params).promise();
		return { message: 'Successfully deleted foundation' };
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
		console.log('Error deleting foundation: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
