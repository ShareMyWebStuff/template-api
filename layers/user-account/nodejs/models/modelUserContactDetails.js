'use strict';
const db = require ('/opt/nodejs/services/db').mysqlDB();

const userContactDetailsModel = () => {

    // 
    // Function : selectContactDetailsById
    //
    // Returns the users contact details
    //
    // ReturnValues :
    //   Success
    //     rows        This contains the number of records found
    //     contactDets This returns the users contact details
    // 
    //   Failure
    //     statusCode This is the status code we return to the calling application
    //     errorNo    This is the database error number.
    //     sqlMessage This is the error message.
    //     sqlState   This is the database error state.
    //  
    async function selectContactDetailsById (userId) {

        try {
            const sql = 'SELECT * FROM user_contact_details '  + db.createWhereClause (userId);
            const res = await db.selectData (sql);

            const userContactDets = {
                rows : res.rows,
                contactDets  : []
            };

            res.data.forEach( ({user_id, title, firstname, lastname, gender, location_id, address1, address2, town, county, postcode, country_id, phone, mobile }) => {
                userContactDets.contactDets.push ({user_id, title, firstname, lastname, gender, location_id, address1, address2, town, county, postcode, country_id, phone, mobile });
            });

            return (userContactDets);

        }catch (err) {
            throw err;
        }
    }


    // 
    // Function : saveUserContactDets
    //
    // Inserts a users contact details
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
    async function saveUserContactDets (userContactDets) {

        try {

            if (userContactDets !== undefined)
            {
                const { user_id, title, firstname, lastname, gender, address1, address2, town, county, postcode, country, phone, mobile } = userContactDets;
                const sql = `CALL sp_user_contact_dets_ins( ${user_id}, '${title}', '${firstname}', '${lastname}', '${gender}', '${address1}', '${address2}', '${town}', '${county}', '${postcode}', '${country}', '${phone}', '${mobile}' ); `;

                const res = await db.insertProcedure( sql );

                if ( res.affectedRows === 1 || res.changedRows === 1 ) {
                    return res;
                } else {
                    throw {statusCode: 500, errorMsg: "No user contact detail where inserted or updated." };
                }

            } else {
                throw {statusCode: 500, errorMsg: "No user contact details where passed." };
            }
        }catch (err) {
            throw err;
        }

    }

    // 
    // Function : updateUserContactDets
    //
    // Updates a users contact details
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
    async function updateUserContactDets (userContactDets) {

        try {
            if (user !== undefined) {
                const { user_id, title, firstname, lastname, gender, address1, address2, town, county, postcode, country, phone, mobile } = userContactDets;
                const sql = `CALL sp_user_contact_dets_ins( ${user_id}, '${title}', '${firstname}', '${lastname}', '${gender}', '${address1}', '${address2}', '${town}'. '${county}', '${postcode}', '${country}', '${phone}', '${mobile}' ); `;

                const res = await db.insertProcedure( sql );
    
                if ( res.affectedRows === 1 || res.changedRows === 1 ) {
                    return res;
                } else {
                    throw {statusCode: 500, errorMsg: "No user contact detail where changed." };
                }
            }            
        } catch (err) {
            throw err;
        }
    }

    // 
    // Function : deleteUserContactDets
    //
    // Deletes a users contact details
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
    async function deleteUserContactDets (userId) {

        try {

            const sql = 'DELETE FROM user_contact_details ' + db.createWhereClause ( { user_id: userId } );
            const res = await db.saveData(sql);

            return {statusCode: 201, msg: 'Account deleted.'};
    
        }catch (err) {
            throw err;
        }
        
    }

    return {
        selectContactDetailsById,
        saveUserContactDets,
        updateUserContactDets,
        deleteUserContactDets
    };

}

module.exports.userContactDetailsModel         = userContactDetailsModel;
