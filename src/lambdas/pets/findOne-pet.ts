const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

const findOne = async ({
	foundationPK,
	petId,
}: {
	foundationPK: string;
	petId: string;
}) => {
	const params = {
		TableName: TABLE_NAME,
		KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
		ExpressionAttributeValues: {
			':pk': foundationPK.toUpperCase(),
			':sk': `PET#${petId.toUpperCase()}`,
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
	const { foundationPK } = event.headers;
	const { petId } = event.pathParameters;
	try {
		const response = await findOne({ foundationPK, petId });
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
