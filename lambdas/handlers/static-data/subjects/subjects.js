const db = require ('/opt/nodejs/services/db').mysqlDB();
const subjectsDb = require ('/opt/nodejs/models/modelSubjects').subjectsModel();


const subjects = () => {

    // 
    // Function : getSubjects
    //
    // This function retrieves the users account specified by the user_id or returns an error.
    //
    async function getSubjects (event) {

      try {
        await db.connectToDB();

        const subs = await subjectsDb.SelectSubjectsAndcategories();

        if (subs.subjects_rows === 0 || subs.categories_rows === 0 ) {
          throw { statusCode: 404, errorMsg: { msg: "Static Data - Subjects or subjects categories do not exist." } };
        }
        subs.statusCode = 200;
        return subs;
      } catch (err) {
        throw err;
      }
    }

    return {
       getSubjects
    }
  
  };
  
  
  // 
  // Function : handler
  //
  // handler calls the subjects handler
  //
  exports.subjectsHandler = async (event) => {
  
    const response = {};
    let res;
  
    try {
      
      const sub = subjects ();
  
      if (event.httpMethod === 'GET') {
        res = await sub.getSubjects (event);
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
  
  