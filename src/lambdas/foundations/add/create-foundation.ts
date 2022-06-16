const { DynamoDB } = require('aws-sdk');

const { keyFormatter } = require('key-formatter');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';

const createFoundation = async (foundationData: Record<string, any>) => {
	foundationData[PRIMARY_KEY] = keyFormatter(
		'FOUNDATION',
		foundationData.FoundationName
	);
	foundationData[SORT_KEY] = keyFormatter(
		'METADATA',
		foundationData.FoundationName
	);

	const params = {
		TableName: TABLE_NAME,
		Item: foundationData,
	};

	try {
		await db.put(params).promise();
		return { message: 'Foundation created' };
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any): Promise<any> => {
	const { foundationName, foundationAddress = '' } =
		typeof event.body === 'object' ? event.body : JSON.parse(event.body);
	try {
		const response = await createFoundation({
			FoundationName: foundationName,
			FoundationAddress: foundationAddress,
		});
		return {
			statusCode: 201,
			body: JSON.stringify(response),
		};
	} catch (error) {
		console.log('Error creating foundations: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
