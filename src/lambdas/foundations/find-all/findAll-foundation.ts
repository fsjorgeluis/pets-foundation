const { DynamoDB } = require('aws-sdk');

const TABLE_NAME = process.env.TABLE_NAME || '';

const findAll = async () => {
	const db = new DynamoDB.DocumentClient();

	const params = {
		TableName: TABLE_NAME,
		FilterExpression: 'contains(#SK, :sk)',
		ExpressionAttributeNames: { '#SK': 'SK' },
		ExpressionAttributeValues: {
			':sk': 'METADATA',
		},
	};

	try {
		const response = await db.scan(params).promise();

		return response;
	} catch (error) {
		return error;
	}
};

export const handler = async (): Promise<Record<string, any>> => {
	try {
		const data = await findAll();
		const statusCode: number = data.Items.length < 1 ? 404 : 200;

		const response: Record<string, any> = {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers':
					'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
				'Access-Control-Allow-Methods': 'OPTIONS,GET',
			},
			statusCode,
		};

		if (statusCode === 200) {
			response['body'] = JSON.stringify(data.Items);
		} else {
			response['body'] = JSON.stringify({ message: 'Not found' });
		}

		return response;
	} catch (error) {
		console.log('Error retrieving foundations: ', error);
		return {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers':
					'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
				'Access-Control-Allow-Methods': 'OPTIONS,GET',
			},
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
