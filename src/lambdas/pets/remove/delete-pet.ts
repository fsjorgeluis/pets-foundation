const { DynamoDB } = require('aws-sdk');

const {
	keyFormatter,
} = require('/opt/custom/nodejs/node_modules/key-formatter');

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';

const deleteOne = async ({
	pk,
	petId,
}: {
	pk: string;
	petId: string;
}): Promise<unknown> => {
	const db = new DynamoDB.DocumentClient();

	const params = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: keyFormatter('FOUNDATION', pk),
			[SORT_KEY]: keyFormatter('PET', petId),
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
	const { pk } = event.queryStringParameters;
	const { petId } = event.pathParameters;

	try {
		const response = await deleteOne({ pk, petId });
		return {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers':
					'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
				'Access-Control-Allow-Methods': 'OPTIONS,DELETE',
			},
			statusCode: 200,
			body: JSON.stringify(response),
		};
	} catch (error) {
		console.log('Error releasing pet: ', error);
		return {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers':
					'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
				'Access-Control-Allow-Methods': 'OPTIONS,DELETE',
			},
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
