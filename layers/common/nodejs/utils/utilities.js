const jwt = require('jsonwebtoken');

const utils = () => {


  // 
  // Function : verifyJWTToken
  //
  // Common function to decipher the items in the token.
  //
  // ReturnValues :
  //   statusCode This is the status code we return to the calling application
  //   errorNo    This is the database error number.
  //   sqlMessage This is the error message.
  //   sqlState   This is the database error state.
  // 
  function verifyJWTToken (event, secret) {

    let decoded;    
    try {

        if (event.headers['x-auth-token'] === undefined && event.headers['X-Auth-Token'] === undefined ){
          throw { statusCode: 401, errorMsg: "User is not signed in." };
        }

        const token = (event.headers['x-auth-token'] ? event.headers['x-auth-token'] : event.headers['X-Auth-Token'] );
  
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;

      } catch (err) {
      if ( err.message === undefined ) {
        throw err;
        } else {
          throw { statusCode: 500, msg: `JWT - err.message` };
        }

      }
    }

    function createToken( payload, secret ) {
      try {
        const token = jwt.sign(payload, secret, {expiresIn: 360000});
        return token;
      } catch (err) {
        throw { statusCode: 500, msg: 'Cannot create JWT token.' };
      }      
    }


    // 
    // These are the functions we are exposing from the database closure
    // 
    return {
      verifyJWTToken,
      createToken
  };
}



module.exports.utils = utils;


