'use strict';
const db = require ('/opt/nodejs/services/db').mysqlDB();

const subjectsModel = () => {

    // 
    // Function : SelectSubjectsAndcategories
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
    async function SelectSubjectsAndcategories ( ) {

        try {
            const sql = `CALL sp_static_subjects_get();`;
            const res = await db.selectData (sql);

            if (res.rows !== 4) {
                throw {statusCode: 404, errorMsg: "Static Data - Subjects do not exist." };
            }

            const subjectsDets = {
            };

            // Setup the subjects structure
            res.data[0].forEach( ({ subject_category_id, subject_category}) => {
                subjectsDets[subject_category] = {
                    subject_category_id,
                    subject_category,
                    subjects: [],
                    subject_levels: []
                };
            });

            res.data[0].forEach( ({ subject_category}) => {
                subjectsDets[subject_category].subject_levels = res.data[1].filter ( levels => { return levels.subject_category === subject_category });
            });

            res.data[0].forEach( ({ subject_category_id, subject_category}) => {
                subjectsDets[subject_category].subjects = res.data[2].filter ( levels => { return levels.subject_category === subject_category });
            });

            return (subjectsDets);

        }catch (err) {
            throw err;
        }
    }
    return {
        SelectSubjectsAndcategories
    };

}

module.exports.subjectsModel              = subjectsModel;
