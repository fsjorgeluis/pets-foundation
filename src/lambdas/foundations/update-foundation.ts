const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

export const handler = async (event: any) => {
	const { foundationId } = event.pathParameters;
	const updatedFoundation =
		typeof event.body === 'object' ? event.body : JSON.parse(event.body);

	const updatedFoundationProperties = Object.keys(updatedFoundation);

	if (!updatedFoundation || updatedFoundationProperties.length < 1) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: 'Bad Request',
			}),
		};
	}

	const firstProperty = updatedFoundationProperties.splice(0, 1);

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
		updatedFoundation[`${firstProperty}`];

	updatedFoundationProperties.forEach((property) => {
		params.UpdateExpression += `, ${property} = :${property}`;
		params.ExpressionAttributeValues[`:${property}`] =
			updatedFoundation[property];
	});

	try {
		await db.update(params).promise();
		return {
			statusCode: 204,
			body: '',
		};
	} catch (error) {
		console.log('Error updating foundation: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};

// const RESERVED_ERRORS_RESPONSES = {
// 	reserved: "Error: You're using AWS reserved keywords as attributes",
// 	executionError:
// 		'Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.',
// };

// const update = async ({ foundationId }: { foundationId: string }) => {
// 	const params = {
// 		TableName: TABLE_NAME,
// 		Key: {
// 			[PRIMARY_KEY]: foundationId,
// 		},
// 	};

// 	try {
// 		const response = await db.get(params).promise();
// 		return response;
// 	} catch (error) {
// 		return error;
// 	}
// };

// export const handler = async (event: any): Promise<Record<string, any>> => {
// 	if (!event.body) {
// 		return {
// 			statusCode: 400,
// 			body: 'invalid request, you are missing the parameter body',
// 		};
// 	}

// 	const updatedFoundationId = event.pathParameters.foundationId;

// 	const updatedFoundation =
// 		typeof event.body === 'object' ? event.body : JSON.parse(event.body);

// 	const updatedFoundationProperties = Object.keys(updatedFoundation);

// 	if (!updatedFoundation || updatedFoundationProperties.length === 0) {
// 		return {
// 			statusCode: 400,
// 			body: 'invalid request, you are missing the parameter body',
// 		};
// 	}

// 	const firstProperty = updatedFoundationProperties.splice(0, 1);

// 	const params: any = {
// 		TableName: TABLE_NAME,
// 		Key: {
// 			[PRIMARY_KEY]: updatedFoundationId,
// 		},
// 		UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
// 		ExpressionAttributeValues: {},
// 		ReturnValues: 'UPDATED_NEW',
// 	};

// 	params.ExpressionAttributeValues[`:${firstProperty}`] =
// 		updatedFoundation[`${firstProperty}`];

// 	updatedFoundationProperties.forEach((property) => {
// 		params.UpdateExpression += `, ${property} = :${property}`;
// 		params.ExpressionAttributeValues[`:${property}`] =
// 			updatedFoundation[`${property}`];
// 	});

// 	try {
// 		await db.update(params);
// 		return {
// 			statusCode: 204,
// 			body: JSON.stringify({ message: 'Foundation updated' }),
// 		};
// 	} catch (error) {
// 		console.log('Error updating foundation: ', error);
// 		const errorMessage =
// 			error.code === 'ValidationException' &&
// 			error.message.includes('reserved keyword')
// 				? RESERVED_ERRORS_RESPONSES.executionError
// 				: RESERVED_ERRORS_RESPONSES.reserved;
// 		return {
// 			statusCode: 500,
// 			body: JSON.stringify(errorMessage),
// 		};
// 	}
// };
