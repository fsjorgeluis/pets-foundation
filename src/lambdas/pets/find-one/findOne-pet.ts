const { DynamoDB } = require('aws-sdk');

const {
	keyFormatter,
} = require('/opt/custom/nodejs/node_modules/key-formatter');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

const findOne = async ({
	pk,
	petId,
}: {
	pk: string;
	petId: string;
}): Promise<any> => {
	const params = {
		TableName: TABLE_NAME,
		KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
		ExpressionAttributeValues: {
			':pk': keyFormatter('FOUNDATION', pk),
			':sk': keyFormatter('PET', petId),
		},
	};

	try {
		const response = await db.query(params).promise();
		return response;
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any): Promise<Record<string, any>> => {
	const { pk } = event.queryStringParameters;
	const { petId } = event.pathParameters;

	try {
		const response = await findOne({ pk, petId });
		return {
			statusCode: 200,
			body: JSON.stringify(response.Items),
		};
	} catch (error) {
		console.log('Error retrieving pet: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
