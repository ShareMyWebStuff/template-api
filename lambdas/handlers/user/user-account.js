const jwt = require('jsonwebtoken');
const bcrypt = require ('bcryptjs');
const db = require ('/opt/nodejs/services/db').mysqlDB();
const userAccount = require ('/opt/nodejs/models/modelUserAccount').userAccountModel();
const validator = require ('/opt/nodejs/validation/validationUser');

const userAccountMaintenance = () => {

  // 
  // Function : validateFields
  //
  // This function validates the users account details passed in. It returns an object with the validation errors
  //
  function validateFields (event) {
    let body = JSON.parse(event.body);
    let errors = {
      email: null,
      username: null,
      password: null,
      password2: null,
      type: null
    };
    let noErrors = 0;

    if (body === null || body === undefined ) {
      body = {};
    }

    const { email, username, password, password2, type } = body;
    const trimmedUsername = ( username === undefined? '' : username.trim());

    // Validate the inputs
    if (!validator.validateEmail(email)) {
      errors['email'] = "A valid email address needs to be entered.";
      noErrors++;
    }
    if (!validator.validateUsername(trimmedUsername)) {
      errors['username'] = "Username has to be 6 - 30 characters and can contain your email address.";
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
    if (!validator.validateUserType(type)) {
      errors['type'] = "The user type must be between 1 and 3.";
      noErrors++;
    }

    return { noErrors, errors, email, username: trimmedUsername, password, type };

  }

  // 
  // Function : createUserAccount
  //
  // This function creates a user or returns the errors as to why the user cant be created.
  //
  async function createUserAccount (event) {

    try {

      // Validate user details
      const validationStatus = validateFields (event);
      if (validationStatus.noErrors > 0){
        throw { statusCode: 422, errorMsg: validationStatus.errors };
      }

      await db.connectToDB();
      // Check the username isnt already used
      const { username, email, password, type } = validationStatus;
      let userDets = await userAccount.selectUserAccountByUsername (username);
      if (userDets.rows === 1 && userDets.user[0].validated === 'N') {
        if ( userDets.user[0].created_mins < 240 ) {
          if ( email !== userDets.user[0].email) {
            throw { statusCode: 409, errorMsg: {'username': "Username reserved, if this was you re-enter username with original email."} };
          }
        }
      } else if (userDets.rows === 1) {
        throw { statusCode: 409, errorMsg: {'username': "Username already exists."} };
      } else if (userDets.rows > 1) {
        throw { statusCode: 409, errorMsg: {'username': "Username already exists."} };
      }

      // Create new user object
      const newUser = { username, email, password, type }; 
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash (password, salt);
      userDets = await userAccount.saveUserAccount (newUser);
      const payload = {
        user_id:userDets.insertedId
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 360000});

      return { statusCode: (userDets.affectedRows === 1 ? 201 : 200), token };
    } catch (err) {
      throw err;
    }
  }

  // 
  // Function : getUserAccount
  //
  // This function retrieves the users account specified by the user_id or returns an error.
  //
  async function getUserAccount (event) {

    try {
      const token = event.headers['X-Auth-Token'];
      if (!token) {
        throw { statusCode: 401, errorMsg: "User is not signed in." };
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await db.connectToDB();

      const user = await userAccount.selectUserAccountById({ user_id: decoded.user_id} );
      if (user.rows !== 1) {
        throw { statusCode: 404, errorMsg: "Requested user does not exist." };
      }

      return { statusCode: 200, rows: user.rows, user: user.user} ;

    } catch (err) {
      throw err;
    }

  }

  // 
  // Function : deleteUserAccount
  //
  // This function deletes the specified user account or returns an error
  //
  async function deleteUserAccount (event) {

    try {
      const token = event.headers['X-Auth-Token'];

      if (!token) {
        throw { statusCode: 401, errorMsg: "User is not signed in." };
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      await db.connectToDB();

      const userDets = await userAccount.deleteUserAccount(decoded.user_id);
      if (userDets.affectedRows !== 1) {
        return { statusCode: 404, errorMsg: "The account does not exist."};
      }

      return { statusCode: 201, msg: "Account deleted."};
      throw {statusCode: 203, msg: 'Poop'};
    } catch (err) {
      throw err;
    }

  }

  // 
  // Function : updateUserAccount
  //
  // This function updates the specified uses account unless there is an error.
  //
  async function updateUserAccount ( event ) {

    try {

      const token = event.headers['X-Auth-Token'];
      if (!token) {
        throw { statusCode: 401, errorMsg: "User is not signed in." };
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Validate user details
      const validationStatus = validateFields (event);

      // Check the username is unique and hasnt been used
      if (validationStatus.noErrors > 0){
        throw { statusCode: 422, errorMsg: validationStatus.errors };
      }
      
      await db.connectToDB();
      const { username, email, password, type } = validationStatus;
      let userDets = await userAccount.selectUserAccountById ( { user_id: decoded.user_id });
      if (userDets.rows !== 1) {
        throw { statusCode: 404, errorMsg: "Requested user does not exist." };
      }

      // Create new user object
      const newUser = { username, email, password, type }; 

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash (password, salt);

      // Save the user details
      userDets = await userAccount.updateUserAccount (decoded.user_id, newUser);
      if (userDets.changedRows === 1 ){
        return { statusCode: 201, msg: "Account updated."};
      }
      return { statusCode: 200, msg: "Account unchanged."};
    } catch (err) {
      throw err;
    }
  }
  return {
    createUserAccount,
    getUserAccount,
    deleteUserAccount,
    updateUserAccount
  }

};


// 
// Function : handler
//
// handler calls the user account create / update / delete or get depending on the event parameter
//
exports.userAccountHandler = async (event) => {

  const response = {};
  let res;

  try {
    
    const tm = userAccountMaintenance ();

    if (event.httpMethod === 'POST') {
      res = await tm.createUserAccount(event);
    } else if (event.httpMethod === 'GET') {
      res = await tm.getUserAccount(event);

    } else if (event.httpMethod === 'DELETE') {
      res =  await tm.deleteUserAccount(event);
    } else if (event.httpMethod === 'PUT') {
      res =  await tm.updateUserAccount(event);
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
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PUT, GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
  };

  return response;
};

