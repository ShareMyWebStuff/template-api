'use strict';
const db = require ('/opt/nodejs/services/db').mysqlDB();

const userAccountModel = () => {

    // 
    // Function : selectUserAccountByUsername
    //
    // Returns the users account that match a username
    //
    // ReturnValues :
    //   Success
    //     rows        This contains the number of records found
    //     user        This returns the users details
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //  
    async function selectUserAccountByUsername (userName) {

        try {
            const sql = `SELECT user_id, email, username, type, password, validated, TIMESTAMPDIFF(MINUTE, create_date, now()) as created_mins FROM user_login where username = '${userName}'`;
            const res = await db.selectData (sql);

            const userDets = {
                rows : res.rows,
                user  : []
            };

            res.data.forEach( ({user_id, email, username, password, validated, created_mins}) => {
                userDets.user.push ({user_id, email, username, password, validated, created_mins });
            });

            return (userDets);

        }catch (err) {
            throw err;
        }
    }


    // 
    // Function : selectUserAccountById
    //
    // Returns the users account that matches a user id
    //
    // ReturnValues :
    //   Success
    //     rows        This contains the number of records found
    //     user        This returns the users details
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //  
    async function selectUserAccountById (whereObj) {

        try {
            const sql = 'SELECT * FROM user_login '  + db.createWhereClause (whereObj);
            const res = await db.selectData (sql);

            const userDets = {
                rows : res.rows,
                user  : []
            };

            res.data.forEach( ({user_id, email, username, password, validated, created_mins}) => {
                userDets.user.push ({user_id, email, username, password, validated, created_mins });
            });

            return (userDets);

        }catch (err) {
            throw err;
        }
    }


    // 
    // Function : saveUserAccount
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
    async function saveUserAccount (user) {

        try {

            if (user !== undefined)
            {

                const sql = `CALL sp_user_login_ins ( '${user.email}', '${user.username}', ${user.type}, '${user.password}', 'N', 'N', 'N' ); `;
                const res = await db.insertProcedure( sql );

                if ( res.affectedRows === 1 || res.changedRows === 1 ) {
                    return res;
                } else {
                    throw {statusCode: 500, errorMsg: "No user detail rows where inserted or updated." };
                }

            } else {
                throw {statusCode: 500, errorMsg: "No user details where passed." };
            }
        }catch (err) {
            throw err;
        }

    }

    // 
    // Function : updateUserAccount
    //
    // Updates an existing user
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
    async function updateUserAccount (user_id, user) {

        try {
            console.log ('updateUserAccount 1');
            if (user !== undefined) {
                // console.log ('updateUserAccount 1');
                const email            = (user.email ?              `'${user.email}'`:              "null");
                // console.log ('updateUserAccount 1');
                const username         = (user.username ?           `'${user.username}'`:           "null");
                // console.log ('updateUserAccount 1');
                const type             = (user.type ?               `${user.type}`:                 "null");
                // console.log ('updateUserAccount 1');
                const password         = (user.password ?           `'${user.password}'`:           "null");
                // console.log ('updateUserAccount 1');
                const validated        = (user.validated ?          `'${user.validated}'`:          "null");
                // console.log ('updateUserAccount 1');
                const validated_email  = (user.validated_email ?    `'${user.validated_email}'`:    "null");
                // console.log ('updateUserAccount 1');
                const validated_mobile = (user.validated_mobile ?   `'${user.validated_mobile}'`:   "null");
                // console.log ('updateUserAccount 1');
                const sql = `CALL sp_user_login_upd ( ${user_id}, ${email}, ${username}, ${type}, ${password}, ${validated}, ${validated_email}, ${validated_mobile} ); `;
// console.log (sql);
                const res = await db.insertProcedure( sql );
    
                if ( res.affectedRows === 1 || res.changedRows === 1 ) {
                    return res;
                } else {
                    throw {statusCode: 500, errorMsg: "No user detail rows where changed." };
                }

            }            
        } catch (err) {
            throw err;
        }
    }

    // 
    // Function : deleteUserAccount
    //
    // Updates an existing user
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
    async function deleteUserAccount (user_id) {

        try {

            const sql = 'DELETE FROM user_login ' + db.createWhereClause ( { user_id } );
            const res = await db.saveData(sql);
            console.log ('Tutor Delete Return Record');
            console.log (res);

            return {statusCode: 201, msg: 'Account deleted.'};
    
        }catch (err) {
            throw err;
        }
        
    }

    return {
        selectUserAccountByUsername,
        selectUserAccountById,
        saveUserAccount,
        updateUserAccount,
        deleteUserAccount
    };

}

module.exports.userAccountModel              = userAccountModel;
