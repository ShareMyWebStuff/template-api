const db = require ('/opt/nodejs/services/db').mysqlDB();
const bcrypt = require ('bcryptjs');
const utils = require('/opt/nodejs/utils/utilities').utils();
const userAccount = require ('/opt/nodejs/models/modelUserAccount').userAccountModel();
const validator = require ('/opt/nodejs/validation/validationUser').validationFns();


const userLogin = () => {

    // 
    // Function : loginValidation
    //
    // This function validates the login details. It returns an object with the validation errors
    //
    const loginValidation = (event) => {
      
        let body;
  
        if (event.body === undefined || event.body === null ) {
            body = {};
        } else {
            body = JSON.parse(event.body);
        }
  
        const { username, password } = body;
        const trimmedUsername = ( username === undefined? '' : username.trim());
        let errors = {};
        let noErrors = 0;
  
        // Validate the inputs
        if (!validator.validateUsername(trimmedUsername)) {
            errors['username'] = "Username has to be 6 - 30 characters and can contain your email address.";
            noErrors++;
        }
      
        if (!validator.validatePassword(password)) {
            errors['password'] = "Your password needs to be 6 - 20 characters long and must contain at least one number.";
            noErrors++;
        }
      
        return { noErrors, errors, username: trimmedUsername, password };
    }
  
  
    // 
    // Function : login
    //
    // This function handles the user login in with the reuired username and password
    //
    async function login (event) {

        try {
            const validationStatus = loginValidation (event);
            if (validationStatus.noErrors > 0){
              throw { statusCode: 422, errorMsg: validationStatus.errors };
            }
      
            await db.connectToDB();
            const { username, password } = validationStatus;
            let userDets = await userAccount.selectUserAccountByUsername (username);

            if (userDets.rows === 0) {
                throw { statusCode: 404, errorMsg: {'password': "Invalid username and password."} };
            }
  
            if (userDets.user[0].validated === 'N') {
                throw { statusCode: 401, errorMsg: {'password': "You need to validate your account before login in."} };
            }

            // Check the password matches
            const isMatched = await bcrypt.compare(password, userDets.user[0].password);
            if (!isMatched) {
                throw { statusCode: 404, errorMsg: {'password': "Invalid username and password."} };
            }
  
            const payload = {
                user_id:userDets.user[0].user_id
            }
            const token = utils.createToken( payload, process.env.JWT_SECRET );

            return { statusCode: 201, token };
            // return { statusCode: 201, message: JSON.stringify( { token } ) };

        } catch (err) {
            throw err;
        }
    }

    return {
      login
    }
  
};
  
exports.userLogin = async (event) => {

    const response = {};
    let res;

    try {
      const ul = userLogin ();
  
      if (event.httpMethod === 'POST') {
        res = await ul.login(event);
      } else if (event.httpMethod === 'OPTIONS') {
        res.statusCode = 201;
        res.body = JSON.stringify({ errorMsg: {msg: `${event.httpMethod} sent.`}});
      } else {
        res.statusCode = 405;
        res.body = JSON.stringify({ errorMsg: {msg: `HttpMethod (${event.httpMethod}) was used and not handled.` } });
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
