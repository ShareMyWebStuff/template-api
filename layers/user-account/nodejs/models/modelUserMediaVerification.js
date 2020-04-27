'use strict';
const db = require ('/opt/nodejs/services/db').mysqlDB();

const userMediaVerificationModel = () => {

    // 
    // Function : saveUserMediaVerification
    //
    // Inserts a new user
    //
    // ReturnValues :
    //   Success
    //     insertedId      The unique identifier of the added user    
    //     affectedRows    The number of rows affected in the database
    //     changedRows     The number of rows changed in the database
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //  
    async function saveUserMediaVerification (req) {

        try {

            if (req !== undefined)
            {
                let sql = `DELETE FROM user_verification_codes WHERE user_id = ${req.userId} AND media_type = '${req.mediaType}' `;
                let res = await db.saveData(sql);

                sql = `INSERT INTO user_verification_codes (user_id, media_type, verification_code) VALUES ( ${req.userId}, '${req.mediaType}', '${req.verificationCode}')`;
                res = await db.saveData(sql);
                if ( res.affectedRows === 1 || res.changedRows === 1 ) {
                    return res;
                } else {
                    throw {statusCode: 500, errorMsg: "No user media verification rows where inserted or updated." };
                }

            } else {
                throw {statusCode: 500, errorMsg: "No user media verification parameters where passed in." };
            }
        }catch (err) {
            throw err;
        }

    }

    // 
    // Function : selectEmailVerification
    //
    // Retrieves the email verification
    //
    // ReturnValues :
    //   Success
    //     insertedId      The unique identifier of the added user    
    //     affectedRows    The number of rows affected in the database
    //     changedRows     The number of rows changed in the database
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //  
    async function selectEmailVerification (req) {

        try {
            const sql = `SELECT * FROM user_verification_codes WHERE verification_code = '${req.verificationCode}'`;
            console.log (sql);
            const res = await db.selectData (sql);

            const userDets = {
                rows : res.rows,
                user  : []
            };

            res.data.forEach( ({user_id, media_type, verification_code }) => {
                userDets.user.push ({user_id, media_type, verification_code });
            });

            return (userDets);

        }catch (err) {
            throw err;
        }
    }
    
    // 
    // Function : deleteUserMediaVerification
    //
    // Deletes a specific media verification
    //
    // ReturnValues :
    //   Success
    //     insertedId      The unique identifier of the added user    
    //     affectedRows    The number of rows affected in the database
    //     changedRows     The number of rows changed in the database
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //  
    async function deleteUserMediaVerification (req) {

        try {

            const sql = `DELETE FROM user_verification_codes WHERE verification_code = '${req.verificationCode}'`;
            await db.saveData(sql);

            return {statusCode: 201, msg: 'Media verfication deleted.'};
    
        }catch (err) {
            throw err;
        }

    }

    return {
        saveUserMediaVerification,
        selectEmailVerification,
        deleteUserMediaVerification
    };

}

module.exports.userMediaVerificationModel      = userMediaVerificationModel;
