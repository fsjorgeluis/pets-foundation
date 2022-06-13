const { DynamoDB } = require('aws-sdk');

const { capitalize } = require('key-formatter');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';

const updatePet = async ({
	foundation,
	body,
	petId,
}: {
	foundation: string;
	body: Record<string, any>;
	petId: string;
}) => {
	const updatedItem = typeof body === 'object' ? body : JSON.parse(body);
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
			[PRIMARY_KEY]: `FOUNDATION#${foundation.toUpperCase()}`,
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
	const { petId } = event.pathParameters;
	const { body } = event;
	const { foundation } = event.headers;
	try {
		const response = await updatePet({ foundation, petId, body });
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
