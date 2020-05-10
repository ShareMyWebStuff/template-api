const db = require ('/opt/nodejs/services/db').mysqlDB();
const bcrypt = require ('bcryptjs');
const crypto = require("crypto");
const userReset = require ('/opt/nodejs/models/modelPasswordReset').userPasswordResetModel();
const validator = require ('/opt/nodejs/validation/validationUser').validationFns();
const sendEmail = require ('/opt/nodejs/services/sendEmailTemplate').awsEmailTemplates();

const userPasswordResetMaintenance = () => {

  // 
  // Function : validateResetPassword
  //
  // This function validates the users account details passed in. It returns an object with the validation errors
  //
  function validateResetPassword (event) {
    let body = JSON.parse(event.body);
    let errors = {
      resetCode: null,
      password: null,
      password2: null
    };
    let noErrors = 0;

    if (body === null || body === undefined ) {
      body = {};
    }

    const { resetCode, password, password2 } = body;

    // Validate the inputs
    if (resetCode.length < 5) {
      errors['resetCode'] = "A valid reset code needs to be passed.";
      noErrors++;
    }

    if (!validator.validatePassword(password)) {
      errors['password'] = "Your password needs to be 6 - 20 characters long and must contain at least one number.";
      noErrors++;
    }
    if ( !errors['password2'] && password !== password2) {
      errors['password2'] = "Your passwords must match.";
      noErrors++;
    }

    return { noErrors, errors, resetCode, password };

  }

  // 
  // Function : validateResetPassword
  //
  // This function validates the users account details passed in. It returns an object with the validation errors
  //
  function validateSendPasswordReset (event) {
    let body = JSON.parse(event.body);
    let errors = {
      username: null,
      domainName: null,
      websiteName: null
    };
    let noErrors = 0;

    if (body === null || body === undefined ) {
      body = {};
    }

    const { username, domainName, websiteName } = body;
    const trimmedUsername = ( username === undefined? '' : username.trim());
    const trimmedDomainName = ( domainName === undefined? '' : domainName.trim());
    const trimmedWebsiteName = ( websiteName === undefined? '' : websiteName.trim());

    // Validate the inputs
    if (!validator.validateUsername(trimmedUsername)) {
      errors['username'] = "Username has to be 6 - 30 characters and can contain your email address.";
      noErrors++;
    }

    if (trimmedDomainName.length < 4 ) {
      errors['domainName'] = "You need to enter a domain name.";
      noErrors++;
    }

    if (trimmedWebsiteName.length < 4 ) {
      errors['websiteName'] = "You need to enter a website name.";
      noErrors++;
    }

    return { noErrors, errors, username: trimmedUsername, domainName: trimmedDomainName, websiteName: trimmedWebsiteName };

  }

  // Function :    resetPassword
  // 
  // Description : 
  // 
  // Parameters  :
  //   resetCode
  //   password
  //   password2
  // 
  async function resetPassword (event){

    try {

        const validationStatus = validateResetPassword (event);
        if (validationStatus.noErrors > 0){
            throw { statusCode: 422, errorMsg: validationStatus.errors };
        }

        await db.connectToDB();
        const { resetCode, password } = validationStatus;

        let res = await userReset.checkResetCodeExists (resetCode);
        
        if ( res.rows !== 1 ) {
          throw { statusCode: 422, errorMsg: {resetCode: 'This reset code does not exist.' } };
        }

        if ( res.rows === 1 && res.codes[0].created_mins > 240 ) {
          res = userReset.deleteResetCode (resetCode);
          throw { statusCode: 422, errorMsg: {resetCode: 'This reset code has expired.' } };
        }

        const salt = await bcrypt.genSalt(10);
        encryptedPassword = await bcrypt.hash (password, salt);
  
        // Reset the password
        res = await userReset.savePasswordForReset (res.codes[0].user_id, encryptedPassword);

        if (res.statusCode === 201) {
          const delRes = await userReset.deleteResetCode (resetCode);
        }
        return res;

    } catch (err) {
        throw err;
    }

  }

    // Function :    sendPasswordResetEmail
    // 
    // Description : 
    // 
    // Parameters  :
    //   username
    //   domainName
    //   websiteName
    // 
    async function sendPasswordResetEmail (event){
   
    try {
console.log ('Here we are 1');
        // Validate the request parameters sent in
        const validationStatus = validateSendPasswordReset (event);
        if (validationStatus.noErrors > 0){
          console.log ('Here we are 2');
          throw { statusCode: 422, errorMsg: validationStatus.errors };
        }
        console.log ('Here we are 3');

        await db.connectToDB();
        const { username, domainName, websiteName } = validationStatus;

        console.log ('Here we are 4');
        // Get email address for the user and their first name
        let res = await userReset.getPasswordEmailDetails(username);
        if (res.rows !== 1){
          throw { statusCode: 404, errorMsg: { username: "Username does not exist." } };
        }
        console.log ('Here we are 5');

        // Create resetCode and save to database
        const { user_id, email, firstname } = res.dets[0];
        const resetCode = crypto.randomBytes(20).toString('hex');
        res = await userReset.saveResetCode ( user_id, resetCode);
        console.log ('Here we are 6');

        // Send then an email
        const templateData = {
          name: firstname,
          resetCode,
          username,
          domainName,
          websiteName,
          supportEmail: `support@${domainName}`
        };

        console.log ('Here we are 7');
        res = await sendEmail.sendEmail(email, 
          domainName, 
          "SMT_PasswordReset", 
          templateData
        );

        if (res.MessageId !== undefined) {
          return {statusCode: 200, username: 'Password reset email has been sent.'};
        }

        return {statusCode: 500, username: 'Reset password internal error.'};


    } catch (err) {
        throw err;
    }

  }


  return {
    resetPassword,
    sendPasswordResetEmail
  }

};


// 
// Function : handler
//
// handler calls the user account create / update / delete or get depending on the event parameter
//
exports.userPasswordResetHandler = async (event) => {

  const response = {};
  let res = {};

  try {

    console.log (event);
    
    const tm = userPasswordResetMaintenance ();

    if (event.httpMethod === 'POST') {
      res = await tm.resetPassword(event);
    } else if (event.httpMethod === 'PUT') {
      res =  await tm.sendPasswordResetEmail(event);
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

  console.log (response);
  return response;
};

