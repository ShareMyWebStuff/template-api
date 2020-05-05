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
        if (event.body === undefined || event.body === null ) {
            body = {};
            throw { statusCode: 404, errorMsg: {'verificationCode': "Verification code does not exist."} };
          } else {
            body = JSON.parse(event.body);
        }

        const { verificationCode } = body;


        if ( verificationCode === undefined || verificationCode === '' ) {
          throw { statusCode: 404, errorMsg: {'verificationCode': "Verification code does not exist."} };
        }

        await db.connectToDB();
        let res = await userMedia.selectEmailVerification ( { verificationCode });

        if (res.rows === 0) {
          throw { statusCode: 404, errorMsg: {'verificationCode': "Verification code does not exist."} };
        } else {

          // Update account to validated
          res = await userAccount.updateUserAccount (res.user[0].user_id, {validated: 'Y', validated_email: 'Y'});

          // Delete verification record
          res = await userMedia.deleteUserMediaVerification ( { verificationCode });
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
      const ul = userValidateMedia ();
  
      if (event.httpMethod === 'POST') {
        res = await ul.validateMedia(event);
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
