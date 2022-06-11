const { DynamoDB } = require('aws-sdk');

const { keyFormatter } = require('key-formatter');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';

const addPet = async (
	pk: Record<string, any>,
	petData: Record<string, any>
) => {
	const ID =
		String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now();

	// petData['PetId'] = ID;
	petData[PRIMARY_KEY] = pk.PK;
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

export const handler = async (event: any): Promise<any> => {
	const {
		foundationPk,
		petName,
		petBreed,
		petType,
		petAge = 0,
	} = typeof event.body === 'object' ? event.body : JSON.parse(event.body);
	try {
		const response = await addPet(
			{ PK: foundationPk },
			{
				PetAge: petAge,
				PetName: petName,
				PetBreed: petBreed,
				PetType: petType,
			}
		);
		return {
			statusCode: 201,
			body: JSON.stringify(response),
		};
	} catch (error) {
		console.log('Yay we got an error hosting pet: ', error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
