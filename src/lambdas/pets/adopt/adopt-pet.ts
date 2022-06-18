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
}): Promise<unknown> => {
	const params: any = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: foundationPK.toUpperCase(),
			[SORT_KEY]: `PET#${petId.toUpperCase()}`,
		},
		UpdateExpression: `set PetStatus = :petStatus`,
		ExpressionAttributeValues: {
			':petStatus': 'happy',
		},
		ReturnValues: 'UPDATED_NEW',
	};

	try {
		await db.update(params).promise();
		return { message: 'Pet updated successfully' };
	} catch (error) {
		return error;
	}
};

const emitSNS = async (event: any) => {
	const sns = new SNS();
	const eventText = JSON.stringify(event, null, 2);
	const params = {
		Message: eventText,
		Subject: 'A pet has been adopted!',
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
		const response = await adoptPet({ foundationPK, petId });
		const snsResponse = await emitSNS('pet-happy');
		console.log(snsResponse);
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
