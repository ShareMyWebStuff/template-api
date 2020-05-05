const db = require ('/opt/nodejs/services/db').mysqlDB();
const userAccount = require ('/opt/nodejs/models/modelUserAccount').userAccountModel();
const userMedia = require ('/opt/nodejs/models/modelUserMediaVerification').userMediaVerificationModel();


const userValidateMedia = () => {

    // 
    // Function : validateMedia
    //
    // This function takes the validation code, checks if it is valid and sets the 
    //
    const validateMedia = async(event) => {

      try {

        let body;
        console.log ('validateMedia - 1');

        if (event.body === undefined || event.body === null ) {
            body = {};
            throw { statusCode: 404, errorMsg: {'verificationCode': "Verification code does not exist."} };
          } else {
            body = JSON.parse(event.body);
        }

        const { verificationCode, mediaType } = body;


        if ( verificationCode === undefined || verificationCode === '' ) {
          throw { statusCode: 404, errorMsg: {'verificationCode': "Verification code does not exist."} };
        }

        if (mediaType === undefined || mediaType === ''){
          throw { statusCode: 404, errorMsg: {'mediaType': "Media type is not specified."} };
        }

        if (mediaType !== 'Email' && mediaType !== 'Mobile'){
          throw { statusCode: 422, errorMsg: {'mediaType': "Media type is not allowed."} };
        }

// VALIDATE PARAMETERS
//  verificationCode
//  mediaType

  
        await db.connectToDB();
        console.log ('validateMedia - 2');
        console.log ('validateMedia - 3');
        let res = await userMedia.selectEmailVerification ( { verificationCode, mediaType: 'Email' });
        console.log ('validateMedia - 4');
        console.log (res);

        if (res.rows === 0) {
          console.log ('validateMedia - 5');0
          throw { statusCode: 404, errorMsg: {'verificationCode': "Verification code does not exist."} };
        } else {

          // Update account to validated
          console.log ('validateMedia - 6');
          res = await userAccount.updateUserAccount (res.user[0].user_id, {validated: 'Y', validated_email: 'Y'});
          console.log (res);
          console.log ('validateMedia - 7');
          // Delete verification record
          res = await userMedia.deleteUserMediaVerification ( { verificationCode, mediaType: 'Email' });
          console.log (res);
          console.log ('validateMedia - 8');
          return res;
        }

      } catch (err) {
        throw err;
      }
    }
  
    return {
      validateMedia
    }
  
};
  
exports.validateMedia = async (event) => {

    const response = {};
    let res = {};
  
    try {
      console.log ('validateMedia OPTIONS - 1');
      
      const ul = userValidateMedia ();
  
      if (event.httpMethod === 'POST') {
        console.log ('OPTIONS - 1.5');
        res = await ul.validateMedia(event);
        console.log ('***************************************');
        console.log (res);
      } else if (event.httpMethod === 'OPTIONS') {
        console.log ('OPTIONS - 2');
        res.statusCode = 201;
        res.body = JSON.stringify({ msg: `${event.httpMethod} sent.`});
      } else {
        console.log ('OPTIONS - 3');
        res.statusCode = 405;
        res.body = JSON.stringify({ errorMsg: `HttpMethod (${event.httpMethod}) was used and not handled.`});
      }
  
      console.log ('OPTIONS - 4');
      response.statusCode = res.statusCode || 500;
      delete res.statusCode;
      response.body = JSON.stringify(res);
  
    } catch (err) {
  
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
  console.log (response);
    return response;
  };
