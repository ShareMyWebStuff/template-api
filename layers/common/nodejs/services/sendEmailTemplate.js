const AWS = require("aws-sdk");

const awsEmailTemplates = () => {


    const sendTemplateEmail = ( ses, params ) => {
        return new Promise ( ( resolve, reject) => {
            ses.sendTemplatedEmail(params, (err, data) => {
                if (err) {
                    reject( err.stack);
                } else {
                    resolve(data);
                }
            });
        });
    }


    const sendEmail = async (toEmail, domainName, templateName, templateData ) => {

        try {

            toEmail = 'dave@harmonydata.co.uk';

            let fromEmail;

            AWS.config.update({
                region: 'us-east-1' 
            });

            const ses = new AWS.SES({apiVersion: '2010-12-01'});

            // const supportEmail=`support@${domainName}`
            if (process.env.AWS_SAM_LOCAL === 'true') {
                fromEmail = `"${domainName}" <noreply@${domainName}>`;
                domainName = "http://localhost:3000";
                templateData.domainName = domainName;
            } else {
                fromEmail = `"${domainName}" <noreply@${domainName}>`;
            }

            const params = {
                Destination: {
                    ToAddresses: [toEmail]
                },
                Source: `${fromEmail}`,
                Template: templateName, 
                TemplateData: JSON.stringify(templateData),
                ReplyToAddresses: [
                    fromEmail
                ],
            };


            const res = await sendTemplateEmail( ses, params );
            console.log (res);
            if ( res.MessageId === undefined) {
                throw { statusCode: 422, msg: err.message };
            } else {
                return ( res );
            }
  
        } catch (err) {
            throw (err);
        }
    };

    // 
    // These are the functions we are exposing from the database closure
    // 
    return {
        sendEmail
    };
}

module.exports.awsEmailTemplates = awsEmailTemplates;
