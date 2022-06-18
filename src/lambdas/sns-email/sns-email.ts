export const handler = async (event: any): Promise<any> => {
	console.log('Received Event:', JSON.stringify(event, undefined, 2));

	let message = event.Records[0].Sns.Message;
	let subject = event.Records[0].Sns.Subject;
	let type = event.Records[0].Sns.Type;

	let response = {
		message: message,
		subject: subject,
		type: type,
	};
	console.log('SNS record: ', JSON.stringify(response, null, 2));

	return response;
};
