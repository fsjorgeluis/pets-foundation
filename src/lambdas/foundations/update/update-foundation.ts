// TODO: return headers to avoid cors, add this chunk to apigateway
const { DynamoDB } = require('aws-sdk');

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const updateFoundation = async ({
	body,
	foundationId,
}: {
	body: Record<string, any>;
	foundationId: string;
}): Promise<unknown> => {
	const db = new DynamoDB.DocumentClient();

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
			[PRIMARY_KEY]: foundationId,
		},
		UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
		ExpressionAttributeValues: {},
		ReturnValues: 'UPDATED_NEW',
	};

	params.ExpressionAttributeValues[`:${firstProperty}`] =
		updatedItem[`${firstProperty}`];

	updatedItemProperties.forEach((property) => {
		params.UpdateExpression += `, ${property} = :${property}`;
		params.ExpressionAttributeValues[`:${property}`] = updatedItem[property];
	});

	try {
		await db.update(params).promise();
		return { message: 'Success' };
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any): Promise<Record<string, any>> => {
	try {
		const response = await updateFoundation(event);
		return {
			statusCode: 204,
			body: JSON.stringify(response),
		};
	} catch (error) {
		console.log('Error updating foundation: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
