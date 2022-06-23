const { DynamoDB, SNS } = require('aws-sdk');

const {
	keyFormatter,
} = require('/opt/custom/nodejs/node_modules/key-formatter');

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || '';

const adoptPet = async ({
	pk,
	petId,
}: {
	pk: string;
	petId: string;
}): Promise<Record<string, any> | unknown> => {
	const db = new DynamoDB.DocumentClient();

	const params: any = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: keyFormatter('FOUNDATION', pk),
			[SORT_KEY]: keyFormatter('PET', petId),
		},
		UpdateExpression: `set PetStatus = :petStatus`,
		ConditionExpression: 'PetStatus = :initVal',
		ExpressionAttributeValues: {
			':petStatus': 'happy',
			':initVal': 'unhappy',
		},
		ReturnValues: 'ALL_NEW',
	};

	try {
		const data = await db.update(params).promise();
		return { message: 'Pet updated successfully', data };
	} catch (error) {
		return error;
	}
};

const emitSNS = async (event: any) => {
	const sns = new SNS();

	const params = {
		Message: JSON.stringify(event.body, null, 2),
		Subject: JSON.stringify(event.subject, null, 2),
		TopicArn: SNS_TOPIC_ARN,
	};

	try {
		const snsResponse = await sns.publish(params).promise();
		return snsResponse;
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any): Promise<Record<string, any>> => {
	const { pk } = event.queryStringParameters;
	const { petId } = event.pathParameters;

	try {
		const response: any = await adoptPet({ pk, petId });
		if (response.message === 'Pet updated successfully') {
			const snsResponse = await emitSNS({
				event: 'pet-happy',
				subject: 'Adoptaron una mascota! 🎉🎉🎉',
				body: response.data,
			});
			console.log(snsResponse);
		}
		return {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers':
					'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
				'Access-Control-Allow-Methods': 'OPTIONS,PATCH',
			},
			statusCode: 204,
			body: JSON.stringify(response.data),
		};
	} catch (error) {
		console.log('Error updating pet data: ', error);
		return {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers':
					'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
				'Access-Control-Allow-Methods': 'OPTIONS,PATCH',
			},
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
