const { DynamoDB, S3 } = require('aws-sdk');

const {
	keyFormatter,
} = require('/opt/custom/nodejs/node_modules/key-formatter');
const { putObjectToS3 } = require('/opt/custom/nodejs/node_modules/s3-manager');

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';
const BUCKET_NAME = process.env.BUCKET_NAME || '';

const createFoundation = async (foundationData: Record<string, any>) => {
	const db = new DynamoDB.DocumentClient();

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
		await putObjectToS3(
			{ S3 },
			BUCKET_NAME,
			`${new Date().toISOString()}-add-foundation-request.json`,
			JSON.parse(event.body)
		);

		const response = await createFoundation({
			FoundationName: foundationName,
			FoundationAddress: foundationAddress,
		});
		return {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers':
					'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
				'Access-Control-Allow-Methods': 'OPTIONS,POST',
			},
			statusCode: 201,
			body: JSON.stringify(response),
		};
	} catch (error) {
		console.log('Error creating foundations: ', error);
		return {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers':
					'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
				'Access-Control-Allow-Methods': 'OPTIONS,POST',
			},
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
