const AWS = require('aws-sdk');
// const nodemailer = require('nodemailer');
const ses = new AWS.SES();

export const handler = async (event: any) => {
	let message = JSON.parse(event.Records[0].Sns.Message);
	let subject = event.Records[0].Sns.Subject;
	// let type = event.Records[0].Sns.Type;

	// let response = {
	// 	message: message,
	// 	subject: subject,
	// 	type: type,
	// };
	// console.log('SNS record: ', JSON.stringify(response, null, 2));

	// return response;

	const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
      </head>
      <body>
        <p>Sorpresa,</p>
        <p>Se realizó la adopción de la siguiente mascota:</p>
		<p>Nombre de la mascota: ${message.Attributes.PetName} </p>
		<p>Raza de la mascota: ${message.Attributes.PetBreed}</p>
		<p>Eda de la mascota: ${message.Attributes.PetAge}</p>
      </body>
    </html>
  `;

	const textBody = `
    Hi,
	Se realizó la adopción de la siguiente mascota:
	Nombre de la mascota: ${message.Attributes.PetName}
	Raza de la mascota: ${message.Attributes.PetBreed}
	Eda de la mascota: ${message.Attributes.PetAge}
    ...
  `;

	var params = {
		Destination: {
			ToAddresses: [process.env.EMAIL_TO],
		},
		Message: {
			Body: {
				Html: {
					Charset: 'UTF-8',
					Data: htmlBody,
				},
				Text: {
					Charset: 'UTF-8',
					Data: textBody,
				},
			},

			Subject: {
				Charset: 'UTF-8',
				Data: subject,
			},
		},
		Source: process.env.EMAIL_FROM,
	};

	return ses.sendEmail(params).promise();
};
