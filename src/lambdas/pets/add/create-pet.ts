const { DynamoDB, S3 } = require('aws-sdk');

const {
	keyFormatter,
} = require('/opt/custom/nodejs/node_modules/key-formatter');
const { putObjectToS3 } = require('/opt/custom/nodejs/node_modules/s3-manager');

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';
const BUCKET_NAME = process.env.BUCKET_NAME || '';

const addPet = async (
	{ PK }: { PK: string },
	petData: Record<string, any>
): Promise<unknown> => {
	const db = new DynamoDB.DocumentClient();

	const ID =
		String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now();

	petData['id'] = ID;
	petData[PRIMARY_KEY] = keyFormatter('FOUNDATION', PK);
	petData[SORT_KEY] = keyFormatter('PET', ID);
	petData['PetStatus'] = 'unhappy';

	const params = {
		TableName: TABLE_NAME,
		Item: petData,
	};

	try {
		await db.put(params).promise();
		return { message: 'Pet addition successfully' };
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any): Promise<Record<string, any>> => {
	const { pk } = event.queryStringParameters;
	const {
		petName,
		petBreed,
		petType,
		petAge = 0,
	} = typeof event.body === 'object' ? event.body : JSON.parse(event.body);

	try {
		await putObjectToS3(
			{ S3 },
			BUCKET_NAME,
			`${new Date().toISOString()}-add-pet-request.json`,
			JSON.parse(event.body)
		);

		const response = await addPet(
			{ PK: pk },
			{
				PetAge: petAge,
				PetName: petName,
				PetBreed: petBreed,
				PetType: petType,
			}
		);
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
		console.log('Yay we got an error hosting pet: ', error);
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
