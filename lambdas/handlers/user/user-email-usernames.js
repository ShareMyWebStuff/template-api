const db = require ('/opt/nodejs/services/db').mysqlDB();
const userReset = require ('/opt/nodejs/models/modelPasswordReset').userPasswordResetModel();
const validator = require ('/opt/nodejs/validation/validationUser').validationFns();
const sendEmail = require ('/opt/nodejs/services/sendEmailTemplate').awsEmailTemplates();

const emailUsernamesMaintenance = () => {

    // 
    // Function : validateparameters
    //
    // This function validates the users account details passed in. It returns an object with the validation errors
    //
    function validateparameters (event) {
        let errors = {
            email: null,
            domainName: null,
            websiteName: null
        };
        let noErrors = 0;
        const queryString = (event.queryStringParameters ? event.queryStringParameters : {} );
        const { email, domainName, websiteName } = queryString;
        const trimmedEmail = ( email === undefined? '' : email.trim());
        const trimmedDomainName = ( domainName === undefined? '' : domainName.trim());
        const trimmedWebsiteName = ( websiteName === undefined? '' : websiteName.trim());

        // Validate the inputs
        if (!validator.validateEmail(trimmedEmail)) {
            errors['email'] = "Email address is invalid.";
            noErrors++;
        }

        if (errors['email'] === undefined && trimmedDomainName.length < 4 ) {
            errors['email'] = "Internal error domain name missing.";
            noErrors++;
        }

        if (errors['email'] === undefined && trimmedWebsiteName.length < 4 ) {
            errors['email'] = "Internal error website name missing.";
            noErrors++;
        }

        return { noErrors, errors, email: trimmedEmail, domainName: trimmedDomainName, websiteName: trimmedWebsiteName };
    }

    // Function :    validateAndEmailUsernames
    // 
    // Description : 
    // 
    // Parameters  :
    //   username
    //   domainName
    //   websiteName
    // 
    async function validateAndEmailUsernames (events){
   
    try {
        // Validate the request parameters sent in
        const validationStatus = validateparameters (events);

        if (validationStatus.noErrors > 0){
            throw { statusCode: 422, errorMsg: validationStatus.errors };
        }

        await db.connectToDB();
        const { email, domainName, websiteName } = validationStatus;

        // Get email address for the user and their first name
        let res = await userReset.getEmailUsernames(email);
        console.log (res);
        if (res.rows === 0){
          throw { statusCode: 404, errorMsg: { email: "Email address is invalid." } };
        }

        const {usernames, htmlUsernames} = res;

        // Send then an email
        const templateData = {
          name: 'Sir / Madam',
          usernames,
          htmlUsernames,
          domainName,
          websiteName,
          supportEmail: `support@${domainName}`
        };

        res = await sendEmail.sendEmail(email, 
          domainName, 
          "SMT_UsernameReminder", 
          templateData
        );
        if (res.MessageId !== undefined) {
          return {statusCode: 200, email: 'Email has been sent.'};
        }

        return {statusCode: 500, email: 'Email usernames internal error.'};

    } catch (err) {
        throw err;
    }

  }

  return {
    validateAndEmailUsernames
  }

};


// 
// Function : handler
//
// handler calls the user account create / update / delete or get depending on the event parameter
//
exports.emailUsernames = async (event) => {

  const response = {};
  let res = {};

  try {
    const tm = emailUsernamesMaintenance ();

    if (event.httpMethod === 'GET') {
        res = await tm.validateAndEmailUsernames(event);
    } else if (event.httpMethod === 'OPTIONS') {
      res.statusCode = 201;
      res.body = JSON.stringify({ msg: `${event.httpMethod} sent.`});
    } else {
      res.statusCode = 405;
      res.body = JSON.stringify({ errorMsg: `HttpMethod (${event.httpMethod}) was used and not handled.`});
    }

    response.statusCode = res.statusCode || 500;
    delete res.statusCode;
    response.body = JSON.stringify(res);

  } catch (err) {

    response.statusCode = err.statusCode || 500;
    if (response.statusCode === undefined) response.statusCode = 500;
    delete err.statusCode;
    response.body = JSON.stringify(err);

  }

  if (response.statusCode === undefined) response.statusCode = 500;
  response.headers = {
    'Access-Control-Expose-Headers': 'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  };

  return response;
};

