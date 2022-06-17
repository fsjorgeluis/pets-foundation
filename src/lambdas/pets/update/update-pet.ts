const { DynamoDB, S3 } = require('aws-sdk');

const { objectCleaner } = require('key-formatter');
const { putObjectToS3 } = require('s3-manager');

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SORT_KEY = process.env.SORT_KEY || '';
const BUCKET_NAME = process.env.BUCKET_NAME || '';

const updatePet = async ({
	foundationPK,
	dataToUpdate,
	petId,
}: {
	foundationPK: string;
	dataToUpdate: Record<string, any>;
	petId: string;
}) => {
	const updatedItem =
		typeof dataToUpdate === 'object' ? dataToUpdate : JSON.parse(dataToUpdate);
	const filteredItem = objectCleaner(updatedItem);
	const updatedItemProperties = Object.keys(filteredItem);

	if (!updatedItem || updatedItemProperties.length < 1) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: 'Bad Request',
			}),
		};
	}

	const firstProperty = updatedItemProperties.splice(0, 1);

	const params: any = {
		TableName: TABLE_NAME,
		Key: {
			[PRIMARY_KEY]: foundationPK.toUpperCase(),
			[SORT_KEY]: `PET#${petId.toUpperCase()}`,
		},
		UpdateExpression: `set ${firstProperty[0]} = :${firstProperty}`,
		ExpressionAttributeValues: {},
		ReturnValues: 'UPDATED_NEW',
	};

	params.ExpressionAttributeValues[`:${firstProperty}`] =
		updatedItem[`${firstProperty}`];

	updatedItemProperties.forEach((property) => {
		params.UpdateExpression += `, ${property} = :${property}`;
		params.ExpressionAttributeValues[`:${property}`] = updatedItem[property];
	});

	try {
		await db.update(params).promise();
		return { message: 'Pet updated successfully' };
	} catch (error) {
		return error;
	}
};

export const handler = async (event: any) => {
	const { foundationPK } = event.headers;
	const { petId } = event.pathParameters;
	const body = JSON.parse(event.body);
	const dataToUpdate = {
		PetAge: body.petAge <= 0 ? 0 : body.petAge || '',
		PetName: body.petName || '',
		PetBreed: body.petBreed || '',
		PetType: body.petType || '',
	};

	try {
		// Put request to S3
		await putObjectToS3(
			{ S3 },
			BUCKET_NAME,
			`${new Date().toISOString()}-update-pet-request.json`,
			JSON.parse(event.body)
		);

		const response = await updatePet({
			foundationPK,
			petId,
			dataToUpdate,
		});
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
