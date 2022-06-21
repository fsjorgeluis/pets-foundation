const { DynamoDB, SNS } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || '';

const adoptPet = async ({
	foundationPK,
	petId,
}: {
	foundationPK: string;
	petId: string;
}): Promise<Record<string, any> | unknown> => {
	const params: any = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: foundationPK.toUpperCase(),
			[SORT_KEY]: `PET#${petId.toUpperCase()}`,
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
	// const eventText = JSON.stringify(event, null, 2);

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
	const { foundationPK } = event.headers;
	const { petId } = event.pathParameters;

	try {
		const response: any = await adoptPet({ foundationPK, petId });
		if (response.message === 'Pet updated successfully') {
			const snsResponse = await emitSNS({
				subject: 'pet-happy',
				body: response.data,
			});
			console.log(snsResponse);
		}
		return {
			statusCode: 204,
			body: JSON.stringify(response.data),
		};
	} catch (error) {
		console.log('Error updating pet data: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
