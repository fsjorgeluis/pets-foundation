const { DynamoDB } = require('aws-sdk');

const { capitalize } = require('key-formatter');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';

const updatePet = async ({
	foundationPK,
	result,
	petId,
}: {
	foundationPK: string;
	result: Record<string, any>;
	petId: string;
}) => {
	const updatedItem = typeof result === 'object' ? result : JSON.parse(result);
	const updatedItemProperties = Object.keys(updatedItem);
	if (!updatedItem || updatedItemProperties.length < 1) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: 'Bad Request',
			}),
		};
	}

	const firstProperty = updatedItemProperties.splice(0, 1);

	const params: any = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: foundationPK.toUpperCase(),
			[SORT_KEY]: `PET#${petId.toUpperCase()}`,
		},
		UpdateExpression: `set ${capitalize(firstProperty[0])} = :${firstProperty}`,
		ExpressionAttributeValues: {},
		ReturnValues: 'UPDATED_NEW',
	};

	params.ExpressionAttributeValues[`:${firstProperty}`] =
		updatedItem[`${firstProperty}`];

	updatedItemProperties.forEach((property) => {
		params.UpdateExpression += `, ${capitalize(property)} = :${property}`;
		params.ExpressionAttributeValues[`:${property}`] = updatedItem[property];
	});

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
	const { petStatus, ...result } = JSON.parse(event.body);
	try {
		const response = await updatePet({ foundationPK, petId, result });
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
