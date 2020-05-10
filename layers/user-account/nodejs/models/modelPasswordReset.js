'use strict';
const db = require ('/opt/nodejs/services/db').mysqlDB();

const userPasswordResetModel = () => {

    // 
    // Function : checkResetCodeExists
    //
    // Checks the reset code exists and returns the rows found matching the reset code.
    //
    // ReturnValues :
    //   Success
    //     rows        This contains the number of records found
    //     codes       This returns the user_id and created_mins. Should only be one row.
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //  
    async function checkResetCodeExists ( resetCode ) {

        try {
            const sql = `SELECT user_id, TIMESTAMPDIFF(MINUTE, create_date, now()) as created_mins FROM user_password_reset_codes where reset_code = '${resetCode}'`;
            const res = await db.selectData (sql);

            const resetCodes = {
                rows : res.rows,
                codes  : []
            };

            res.data.forEach( ({user_id, created_mins}) => {
                resetCodes.codes.push ({user_id, created_mins });
            });

            return (resetCodes);

        }catch (err) {
            throw err;
        }
    }
        
    // 
    // Function : getEmailUsernames
    //
    // Returns the usernames associated with an email address (only for validated accounts).
    //
    // ReturnValues :
    //   Success
    //     rows             This contains the number of records found
    //     usernames        The usernames associated with the email address
    //     htmlUsernames    The usernames with html.
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //  
    async function getEmailUsernames ( email ) {

        let retObj = {
            rows: 0,
            usernames: '',
            htmlUsernames: ''
        };
        try {
            const sql = `SELECT username FROM user_login where email = '${email}' and validated = 'Y'`;
            console.log (sql);
            const res = await db.selectData (sql);

            res.data.forEach( ({username}) => {
                retObj.rows++;
                retObj.usernames += `- ${username}\n`;
                retObj.htmlUsernames += `- ${username}<br>`;
            });

            return (retObj);

        }catch (err) {
            throw err;
        }
    }
        

    // 
    // Function : savePasswordForReset
    //
    // Updates the password for the specified user id.
    //
    // ReturnValues :
    //   Success
    //     statusCode       The http status code
    //     msg              A messages associated to the rsponse.
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //  
    async function savePasswordForReset ( userId, password ) {

        try {
            let sql = `UPDATE user_login SET password = '${password}' WHERE user_id = ${userId};`;
            const res = await db.saveData(sql);

            if ( res.affectedRows === 1 || res.changedRows === 1 ) {
                return {statusCode: 201, msg: 'Password has been successfully changed.'};
            }
            return {statusCode: 404, msg: 'Password was not changed.'};

        } catch (err) {
            console.log (err);
            throw (err);                
        }
    }

    // 
    // Function : saveResetCode
    //
    // Creates a new reset code record, deletes all the previous records for this user.
    //
    // ReturnValues :
    //   Success
    //     statusCode       The http status code
    //     msg              A messages associated to the rsponse.
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //  
    async function saveResetCode ( userId, resetCode ) {

        try {
            // Delete previous reset codes for this user
            let sql = `DELETE FROM user_password_reset_codes WHERE user_id = ${userId};`;
            let res = await db.saveData(sql);

            sql = `INSERT INTO user_password_reset_codes (user_id, reset_code) VALUES (${userId}, '${resetCode}');`;
            res = await db.saveData(sql);

            if ( res.affectedRows === 1 || res.changedRows === 1 ) {
                return {statusCode: 201, msg: 'Successfully created reset code.'};
            }
            return {statusCode: 404, msg: 'Password was not changed.'};

        } catch (err) {
            console.log (err);
            throw (err);                
        }
    }

    // 
    // Function : deleteResetCode
    //
    // Deleted the reset code
    //
    // ReturnValues :
    //   Success
    //     statusCode       The http status code
    //     msg              A messages associated to the rsponse.
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //
    async function deleteResetCode ( resetCode ) {

        try {

            const sql = `DELETE FROM user_password_reset_codes WHERE reset_code = '${resetCode}'`;
            const res = await db.saveData(sql, undefined);

            if (res.affectedRows !== 1) {
                return { statusCode: 404, errorMsg: "The reset code does not exist."};
              }

            return {statusCode: 201, msg: 'Password has been successfully changed.'};
    
        }catch (err) {
            throw err;
        }
    }

    // 
    // Function : getPasswordEmailDetails
    //
    // Retrieves user details required to send them an email stating a password reset has been requested.
    //
    // ReturnValues :
    //   Success
    //     rows        This contains the number of records found
    //     dets        This returns the users details - should only be one record as the username is unique.
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //  
    async function getPasswordEmailDetails ( username ) {

        try {

            const sql = `SELECT ul.user_id, ul.email, ucd.firstname FROM user_login ul INNER JOIN user_contact_details ucd ON ul.user_id = ucd.user_id WHERE ul.username = '${username}'`;
            const res = await db.selectData(sql);

            const emailDets = {
                rows : res.rows,
                dets  : []
            };

            res.data.forEach( ({user_id, email, firstname}) => {
                emailDets.dets.push ({user_id, email, firstname });
            });

            return (emailDets);    
        }catch (err) {
            throw err;
        }
    }


    return {
        checkResetCodeExists,
        savePasswordForReset,
        saveResetCode,
        deleteResetCode,
        getPasswordEmailDetails,
        getEmailUsernames
    };

}

module.exports.userPasswordResetModel              = userPasswordResetModel;
