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
		await db.delete(params).promise();
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Successfully deleted foundation',
			}),
		};
	} catch (error) {
		console.log('Error deleting foundation: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
