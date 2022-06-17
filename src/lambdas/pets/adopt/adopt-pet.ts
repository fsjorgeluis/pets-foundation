const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';

const adoptPet = async ({
	foundationPK,
	petId,
}: {
	foundationPK: string;
	petId: string;
}) => {
	const params: any = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: foundationPK.toUpperCase(),
			[SORT_KEY]: `PET#${petId.toUpperCase()}`,
		},
		UpdateExpression: `set PetStatus = :petStatus`,
		ExpressionAttributeValues: {
			':petStatus': 'happy',
		},
		ReturnValues: 'UPDATED_NEW',
	};

	try {
		await db.update(params).promise();
		return { message: 'Pet updated successfully' };
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any) => {
	const { foundationPK } = event.headers;
	const { petId } = event.pathParameters;

	try {
		const response = await adoptPet({ foundationPK, petId });
		return {
			statusCode: 204,
			body: JSON.stringify(response),
		};
	} catch (error) {
		console.log('Error updating pet data: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
