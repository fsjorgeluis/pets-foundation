const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';

const deleteOne = async ({
	foundationPK,
	petId,
}: {
	foundationPK: string;
	petId: string;
}): Promise<unknown> => {
	const params = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: foundationPK.toUpperCase(),
			[SORT_KEY]: `PET#${petId}`,
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
	const { foundationPK } = event.headers;
	const { petId } = event.pathParameters;

	try {
		const response = await deleteOne({ foundationPK, petId });
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
