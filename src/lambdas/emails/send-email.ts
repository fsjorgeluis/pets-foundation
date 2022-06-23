const AWS = require('aws-sdk');

const EMAIL_FROM = process.env.EMAIL_FROM || '';
const EMAIL_TO = process.env.EMAIL_TO || '';

const sendEmail = async ({ from, to, subject, message }: any) => {
	const ses = new AWS.SES();

	const params = {
		Destination: {
			ToAddresses: [to],
		},
		Message: {
			Body: {
				Html: {
					Charset: 'UTF-8',
					Data: getHtmlBody(message),
				},
				Text: {
					Charset: 'UTF-8',
					Data: getTextBody(message),
				},
			},

			Subject: {
				Charset: 'UTF-8',
				Data: subject,
			},
		},
		Source: from,
	};

	try {
		await ses.sendEmail(params).promise();

		return { message: 'Email sent' };
	} catch (error) {
		console.log(error);
		return error;
	}
};

function getHtmlBody({ Attributes }: Record<string, any>) {
	return `
    <!DOCTYPE html>
    <html>
      <head>
      </head>
      <body>
        <p>Felicidades,</p>
        <p>Se realizó la adopción de la siguiente mascota:</p>
		<p>Nombre de la mascota: ${Attributes.PetName} </p>
		<p>Raza de la mascota: ${Attributes.PetBreed}</p>
		<p>Edad de la mascota: ${Attributes.PetAge}</p>
      </body>
    </html>
  `;
}
function getTextBody({ Attributes }: Record<string, any>) {
	return `
    Felicidades,
	Se realizó la adopción de la siguiente mascota:
	Nombre de la mascota: ${Attributes.PetName}
	Raza de la mascota: ${Attributes.PetBreed}
	Edad de la mascota: ${Attributes.PetAge}
    ...
  `;
}

export const handler = async (event: any) => {
	const message = JSON.parse(event.Records[0].Sns.Message);
	const subject = event.Records[0].Sns.Subject;
	// const type = event.Records[0].Sns.Type;

	try {
		const response = await sendEmail({
			from: EMAIL_FROM,
			to: EMAIL_TO,
			subject: subject,
			message: message,
		});

		return JSON.stringify({
			statusCode: 200,
			body: response,
		});
	} catch (error) {
		console.log(error);
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		};
	}
};
