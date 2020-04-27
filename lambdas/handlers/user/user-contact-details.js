const crypto = require("crypto");
const db = require ('/opt/nodejs/services/db').mysqlDB();
const utils = require('/opt/nodejs/utils/utilities').utils();
const userAccount = require ('/opt/nodejs/models/modelUserAccount').userAccountModel();
const userContactDets = require ('/opt/nodejs/models/modelUserContactDetails').userContactDetailsModel();
const userMedia = require ('/opt/nodejs/models/modelUserMediaVerification').userMediaVerificationModel();
const validator = require ('/opt/nodejs/validation/validationUser').validationFns();
const AWS = require("aws-sdk");

const userContactDetsMaintenance = async () => {

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

  const sendEmail = async (email, name, verificationCode, username, password, websiteName, domainName ) => {

    console.log (`email             ${email}`);
    console.log (`name              ${name}`);
    console.log (`verificationCode  ${verificationCode}`);
    console.log (`username          ${username}`);
    console.log (`password          ${password}`);
    console.log (`websiteName       ${websiteName}`);
    console.log (`domainName        ${domainName}`);
    try {

      let fromEmail;

      AWS.config.update({
        region: 'us-east-1' 
      });

      const ses = new AWS.SES({apiVersion: '2010-12-01'});

      console.log ('*********************************************');
      console.log (process.env);
      console.log (process.env.AWS_SAM_LOCAL);
      console.log ('*********************************************');

      const supportEmail=`support@${domainName}`
      if (process.env.AWS_SAM_LOCAL === 'true') {
        fromEmail = `"${domainName}" <noreply@${domainName}>`;
        domainName = "http://localhost:3000"
      } else {
        fromEmail = `"${domainName}" <noreply@${domainName}>`;
      }

      // `"${domainName}" <noreply@${domainName}>`
      const params = {
          Destination: {
              ToAddresses: [email]
          },
          Source: `${fromEmail}`,
          Template: "WelcomeEmail", 
          TemplateData: `{ \"name\":\"${name}\",\"verificationCode\":\"${verificationCode}\",\"username\":\"${username}\",\"password\":\"${password}\",\"websiteName\":\"${websiteName}\",\"domainName\":\"${domainName}\",\"supportEmail\":\"${supportEmail}\" }`, 
          ReplyToAddresses: [
            fromEmail
          ],
      };
console.log ('Before error message');
console.log (params);
      const res = await sendTemplateEmail( ses, params );
      console.log (res);
      if ( res.MessageId === undefined) {
        throw { statusCode: 422, msg: err.message };
      } else {
        return ( res );
      }
  
      // ses.sendTemplatedEmail(params, (err, data) => {
      //     if (err) {
      //         return console.log(err, err.stack);
      //     } else {
      //         console.log("Email sent.", data);
      //     }
      // });
    } catch (err) {
      throw (err);
    }
    
  };

  // 
  // Function : validateFields
  //
  // This function validates the users contact details passed in. It returns an object with the validation errors
  //
  function validateFields (event) {
    console.log ('Event');
    console.log (event);
    let body = JSON.parse(event.body);
    
    let errors = {
        title: null,
        firstname: null,
        lastname: null,
        gender: null,
        address1: null,
        address2: null,
        town: null,
        county: null,
        postcode: null,
        country: null,
        phone: null,
        mobile: null,
        domainName: null,
        websiteName: null
    };
    let noErrors = 0;
    let res;

    if (body === null || body === undefined ) {
      body = {};
    }

    const { title, firstname, lastname, gender, address1, address2, town, county, postcode, country, phone, mobile, domainName, websiteName, password } = body;
    const trimmedFirstname = ( firstname === undefined? '' : firstname.trim());
    const trimmedLastname = ( lastname === undefined? '' : lastname.trim());
    const trimmedGender = ( gender === undefined? '' : gender.trim());
    const trimmedAddress1 = ( address1 === undefined? '' : address1.trim());
    const trimmedAddress2 = ( address2 === undefined? '' : address2.trim());
    const trimmedTown = ( town === undefined? '' : town.trim());
    const trimmedCounty = ( county === undefined? '' : county.trim());
    const trimmedPostcode = ( postcode === undefined? '' : postcode.trim());
    const trimmedCountry = ( country === undefined? '' : country.trim());
    const trimmedPhone = ( phone === undefined? '' : phone.trim());
    const trimmedMobile = ( mobile === undefined? '' : mobile.trim());
    const trimmedDomainName = ( domainName === undefined? '' : domainName.trim());
    const trimmedWebsiteName = ( websiteName === undefined? '' : websiteName.trim());
    const trimmedPassword = ( password === undefined? '' : password.trim());


    // Validate the inputs
    res = validator.validateTitle(title);
    if (!res.valid) {
      errors['title'] = res.msg;
      noErrors++;
    }
    res = validator.validateFirstname(trimmedFirstname);
    if (!res.valid) {
        errors['firstname'] = res.msg;
        noErrors++;
    }
    res = validator.validateLastname(trimmedLastname);
    if (!res.valid) {
        errors['lastname'] = res.msg;
        noErrors++;
    }
    res = validator.validateGender(trimmedGender);
    if (!res.valid) {
        errors['gender'] = res.msg;
        noErrors++;
    }
    res = validator.validateAddress1(trimmedAddress1);
    if (!res.valid) {
        errors['address1'] = res.msg;
        noErrors++;
    }
    res = validator.validateAddress2(trimmedAddress2);
    if (!res.valid) {
        errors['address2'] = res.msg;
        noErrors++;
    }
    res = validator.validateTown(trimmedTown);
    if (!res.valid) {
        errors['town'] = res.msg;
        noErrors++;
    }
    res = validator.validateCounty(trimmedCounty);
    if (!res.valid) {
        errors['county'] = res.msg;
        noErrors++;
    }
    res = validator.validatePostcode(trimmedPostcode);
    if (!res.valid) {
        errors['postcode'] = res.msg;
        noErrors++;
    }
    res = validator.validateCountry(trimmedCountry);
    if (!res.valid) {
      errors['country'] = res.msg;
      noErrors++;
    }
    res = validator.validatePhone(trimmedPhone);
    if (!res.valid) {
        errors['phone'] = res.msg;
        noErrors++;
    }
    res = validator.validateMobile(trimmedMobile);
    if (!res.valid) {
        errors['mobile'] = res.msg;
        noErrors++;
    }

    return { noErrors, errors, title, 
        firstname: trimmedFirstname, 
        lastname: trimmedLastname,
        gender: trimmedGender,
        address1: trimmedAddress1, 
        address2: trimmedAddress2, 
        town: trimmedTown, 
        county: trimmedCounty, 
        postcode: trimmedPostcode, 
        country: trimmedCountry,
        phone: trimmedPhone, 
        mobile: trimmedMobile,
        domainName: trimmedDomainName,
        websiteName: trimmedWebsiteName,
        password: trimmedPassword };

  }

  // 
  // Function : createContactDets
  //
  // This function creates the users contact details or returns the errors as to why they cant be created.
  //
  async function createContactDets (event) {

    try {

      const decoded = utils.verifyJWTToken (event, process.env.JWT_SECRET);

      const validationStatus = validateFields (event);
      if (validationStatus.noErrors > 0){
        throw { statusCode: 422, errorMsg: validationStatus.errors };
      }
      const { title, firstname, lastname, gender, address1, address2, town, county, postcode, country, phone, mobile, domainName, websiteName, password } = validationStatus;

      await db.connectToDB();
      // Check the user exists
      let userDets = await userAccount.selectUserAccountById ( { user_id: decoded.user_id });
      if (userDets.rows !== 1) {
        throw { statusCode: 404, errorMsg: "User account does not exist." };
      }

      const newContactDetails = { user_id: decoded.user_id, title, firstname, lastname, gender, address1, address2, town, county, postcode, country, phone, mobile }; 

      let userContDets = await userContactDets.saveUserContactDets (newContactDetails);

      const verificationCode = crypto.randomBytes(20).toString('hex');
      const userMediaRes = await userMedia.saveUserMediaVerification ({userId: decoded.user_id,  mediaType: 'Email', verificationCode});
      // sendEmail(userDets.user[0].email, firstname, verificationCode, userDets.user[0].username, password, websiteName, domainName);
      const res = await sendEmail('dave@harmonydata.co.uk', firstname, verificationCode, userDets.user[0].username, password, websiteName, domainName);
      // const res = await sendEmail(userDets.user[0].email, firstname, verificationCode, userDets.user[0].username, password, websiteName, domainName);

      return { statusCode: (userContDets.affectedRows === 1 ? 201 : 200), msg: 'Account created.', verificationCode };
    } catch (err) {
      console.log ('ERROR ----------------------------');
      console.log (err);
      throw err;
    }
  }

  // 
  // Function : getContactDets
  //
  // This function retrieves the users account specified by the user_id or returns an error.
  //
  async function getContactDets (event) {

    try {
      const decoded = utils.verifyJWTToken (event, process.env.JWT_SECRET);

      await db.connectToDB();

      const user = await userContactDets.selectContactDetailsById({ user_id: decoded.user_id} );

      return { statusCode: 200, rows: user.rows, contactDets: user.contactDets} ;

    } catch (err) {
      throw err;
    }

  }

  // 
  // Function : deleteContactDets
  //
  // This function deletes the user contact details or returns an error
  //
  async function deleteContactDets (event) {

    try {
      const decoded = utils.verifyJWTToken (event, process.env.JWT_SECRET);

      await db.connectToDB();
      await userContactDets.deleteUserContactDets(decoded.user_id);

      return { statusCode: 201, msg: "User contact details deleted."};
    } catch (err) {
      throw err;
    }

  }

  // 
  // Function : updateContactDets
  //
  // This function updates the specified uses contact details unless there is an error.
  //
  async function updateContactDets ( event ) {

    try {
      const decoded = utils.verifyJWTToken (event, process.env.JWT_SECRET);

      // Validate user details
      const validationStatus = validateFields (event);

      // Check the username is unique and hasnt been used
      if (validationStatus.noErrors > 0){
        throw { statusCode: 422, errorMsg: validationStatus.errors };
      }
      const { title, firstname, lastname, gender, address1, address2, town, county, postcode, country, phone, mobile } = validationStatus;
      
      await db.connectToDB();
      let userDets = await userAccount.selectUserAccountById ( { user_id: decoded.user_id });
      if (userDets.rows !== 1) {
        throw { statusCode: 404, errorMsg: "User account does not exist." };
      }

      const newContactDetails = { user_id: decoded.user_id, title, firstname, lastname, gender, address1, address2, town, county, postcode, country, phone, mobile }; 

      userDets = await userContactDets.saveUserContactDets (newContactDetails);
      if (userDets.changedRows === 1 ){
        return { statusCode: 201, msg: "Account updated."};
      }
      return { statusCode: 200, msg: "Account unchanged."};
    } catch (err) {
      console.log ('updateContactDets 20');
      throw err;
    }
  }
  return {
    createContactDets,
    getContactDets,
    deleteContactDets,
    updateContactDets
  }

};


// 
// Function : handler
//
// handler calls the user account create / update / delete or get depending on the event parameter
//
exports.userContactDetailsHandler = async (event) => {

  const response = {};
  let res;
  console.log ('HELLO HELLO ------------------------------ 1');
  console.log (event);
  console.log ('HELLO HELLO ------------------------------ 1.5');

  try {
    
    console.log ('HELLO HELLO ------------------------------ 2');
    const tm = await userContactDetsMaintenance ();
    console.log ('HELLO HELLO ------------------------------ 3');
    console.log (tm);

    if (event.httpMethod === 'POST') {
      console.log ('HELLO HELLO ------------------------------ 4');
      res = await tm.createContactDets(event);
      console.log ('HELLO HELLO ------------------------------ 5');
    } else if (event.httpMethod === 'GET') {
      res = await tm.getContactDets(event);
    } else if (event.httpMethod === 'DELETE') {
      res =  await tm.deleteContactDets(event);
    } else if (event.httpMethod === 'PUT') {
      res =  await tm.updateContactDets(event);
    } else if (event.httpMethod === 'OPTIONS') {
      res.statusCode = 201;
      res.body = JSON.stringify({ msg: `${event.httpMethod} sent.`});
    } else {
      res.statusCode = 405;
      res.body = JSON.stringify({ errorMsg: `HttpMethod (${event.httpMethod}) was used and not handled.`});
    }

    console.log ('OPTIONS - 4');
    response.statusCode = res.statusCode || 500;
    delete res.statusCode;
    response.body = JSON.stringify(res);

  } catch (err) {
    console.log (err);
    console.log ('OPTIONS - 5');
    response.statusCode = err.statusCode || 500;
    if (response.statusCode === undefined) response.statusCode = 500;
    delete err.statusCode;
    response.body = JSON.stringify(err);

  }

  console.log ('OPTIONS - 6');
  if (response.statusCode === undefined) response.statusCode = 500;
  response.headers = {
    'Access-Control-Expose-Headers': 'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  };

  console.log ('OPTIONS - 7');
  console.log (response);
  return response;
};

