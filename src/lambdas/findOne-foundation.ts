const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const findOne = async ({ foundationId }: { foundationId: string }) => {
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
	// const { foundationId } = event.pathParameters;

	// if (!foundationId) {
	// 	return {
	// 		statusCode: 400,
	// 		body: JSON.stringify({
	// 			Error: 'Missing foundationId',
	// 		}),
	// 	};
	// }

	// const params = {
	// 	TableName: TABLE_NAME,
	// 	Key: {
	// 		[PRIMARY_KEY]: foundationId,
	// 	},
	// };

	try {
		// const response = await db.get(params).promise();
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
