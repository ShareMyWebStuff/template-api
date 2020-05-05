'use strict';
const results = require('dotenv').config({ debug: process.env.DEBUG });
const axios = require ('axios');
const db = require('../../layers/common/nodejs/services/db').mysqlDB();

// 
// user-account.test
// 
//
// 1. Test all undefined user-account routes
//     1.1 Test Patch
// 2. Test Creating User
//     2.1 Username validation Checks
//         2.1.1 No username entered
//         2.1.2 Username too short
//         2.1.3 Username too long
//         2.1.4 Username can contain uppercase characters
//         2.1.5 Username can contain lowercase characters
//         2.1.6 Username can contain numbers
//         2.1.7 Username can contain email characters (first set)
//         2.1.8 Username can contain email characters (second set)
//     2.2 Email validation checks
//         2.2.1 No email entered
//     2.2.2 A blank email
//         2.2.3 An invalid email (dad)
//         2.2.4 An invalid email (dad@)
//         2.2.5 An invalid email (dad@dad)
//         2.2.6 A valid email
//     2.3 Password(s) validation checks
//         2.3.1 No Passwords entered
//         2.3.2 Blank password entered
//         2.3.3 Password less than 6 characters
//         2.3.4 Password greater than 20 characters
//         2.3.5 Valid password, missing confirmation password
//         2.3.6 Valid password, blank confirmation password
//     2.4 Tutor Type validation checks
//         2.4.1 No tutor type entered
//         2.4.2 Blank tutor type entered
//         2.4.3 Alphanumeric tutor type entered
//         2.4.4 Numeric tutor type entered that is out of range
//         2.4.5 Valid Numeric tutor type entered (1)
//         2.4.6 Valid Numeric tutor type entered (2)
//         2.4.7 Valid Numeric tutor type entered (3)
//     2.5 No Parameters or Valid User
//         2.5.1 No parameters passed in
//         2.5.2 Valid User Created
// 3. Test Get Tutor
//     3.1 No token passed
//     3.2 Blank token passed
//     3.3 Incorrect token passed
//     3.4 Valid token passed
// 4. Test Update Tutor
//     4.1 No token and no body passed
//     4.2 Blank token passed
//     4.3 Incorrect token passed
//     4.4 Valid token passed and no body
//     4.5 Valid token passed and invalid username
//     4.6 Valid token passed and invalid email
//     4.7 Valid token passed and invalid password
//     4.8 Valid token and update details - non validated account
// 5. Test Delete Tutor
//     5.1 No token passed
//     5.2 Blank token passed
//     5.3 Incorrect token passed
//     5.4 Valid token passed


// Number of milliseconds the tests will run for
const millisecondTimeout = 360000;

// This is the userToken extracted from test 2.5.2. This token is used on the GET / UPDATE and finally the DELETE requests
let   userToken;
let   userTest1;
let   userDeleteTest1;

jest.setTimeout(millisecondTimeout);

// 
// User Account 
//
// This set of tests to deal with account creation / update/ reading and deletion.
// 
// 1. Test all routes POST / PUT / GET / DELETE to ensure we only have the ones setup that we require ( GET ).
//

//
// Before all tests connect to the database
//
beforeAll( async () => {

    try {
        // Create variables
        let body;
        let res;
        let sendBody={};
        let dataSetupConfig = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            validateStatus: function(status) {
                return (status < 500);
            },
            crossDomain: true
        };

        await db.connectToDB();

        // Delete records we will add to the database when testing
        await db.saveData (`DELETE FROM user_login WHERE username like 'user_%'`);

        // Create users required for testing
        sendBody = {
            username: 'user_test_1',
            email: 'test1@tester.co.uk',
            password: 'Hello123',
            password2: 'Hello123',
            type: '3'
        };
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user`, body, dataSetupConfig);
        userTest1 = res.data.token;

        // Create users required for testing
        sendBody = {
            username: 'user_test_2',
            email: 'test2@tester.co.uk',
            password: 'Hello123',
            password2: 'Hello123',
            type: '3'
        };
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user`, body, dataSetupConfig);
        userDeleteTest1 = res.data.token;

        
    } catch (error) {
        console.log (error);
    }
});

// 
// Clear up the database after we have run our tests.
// 
afterAll( async () => {

    try {

        await db.disconnectDB();
    } catch (error) {
        console.log (error);
    }
});


//
// Test routes not configured to work produce error message.
//

describe ( '1. Test all undefined user-account routes', () => {

    let config;

    beforeEach ( () => {
        config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            validateStatus: function (status) {
                return ( ( status >= 200 && status < 300 ) || status === 403 || status === 405 )
            },
            crossDomain: true
        }

    });


    test ('1.1 Test Patch', async () => {

        let body, status;

        try {
            const res = await axios.patch(`http://localhost:3002/user`, config);

            // This is an error as the error wasnt thrown by axios
            expect (0).toBe(1);
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (PATCH) was used and not handled.");
    }, millisecondTimeout);

});


describe ( '2. Test Creating User', () => {

    describe ('2.1 Username validation Checks', () => {

        let config;
        let sendBody = { email: "dave@hello.co.uk", password: 'Hello123', password2: 'Hello123', type: 1 };

        beforeEach ( () => {
            config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return ( ( status >= 200 && status < 300 ) || status === 403 || status === 405 || status === 422 )
                },
                crossDomain: true
            }
            delete sendBody.username;
        })

        test ('2.1.1 No username entered', async () => {
            try {
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.2 Username too short', async () => {
            try {
                sendBody.username='Dad';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.3 Username too long', async () => {
            try {
                sendBody.username='Dad4567890123456789012345678901';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.4 Username can contain uppercase characters', async () => {
            try {
                sendBody.username='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                delete sendBody.email;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.5 Username can contain lowercase characters', async () => {
            try {
                sendBody.username='abcdefghijklmnopqrstuvwxyz';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.6 Username can contain numbers', async () => {
            try {
                sendBody.username='01234567890';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.7 Username can contain email characters (first set)', async () => {
            try {
                sendBody.username='!#$%&\'*+-/=?^_`{|}~. ()';

                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.8 Username can contain email characters (second set)', async () => {
            try {
                sendBody.username=',:;<>@[\\]';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);


    });

    describe ( '2.2 Email validation checks', () => {

        let config;
        let sendBody = { username: 'DaveFromSurrey', password: 'Hello123', password2: 'Hello123', type: 1 };

        beforeEach ( () => {
            config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return ( ( status >= 200 && status < 300 ) || status === 403 || status === 405 || status === 422 )
                },
                crossDomain: true
            };
        });

        test ('2.2.1 No email entered', async () => {

            let res;
            try {
                const body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.log (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);


        test ('2.2.2 A blank email', async () => {

            try {
                sendBody.email = '';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.2.3 An invalid email (dad)', async () => {

            try {
                sendBody.email = 'dad';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.2.4 An invalid email (dad@)', async () => {

            try {
                sendBody.email = 'dad@';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.2.5 An invalid email (dad@dad)', async () => {

            try {
                sendBody.email = 'dad@dad';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.2.6 A valid email', async () => {

            try {
                delete sendBody.username;
                sendBody.email = 'dad@dad.co.uk';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

    });


    describe ( '2.3 Password(s) validation checks', () => {

        let config;
        let sendBody = { username: 'DaveFromSurrey', email: 'dad@dad.co.uk', type: 1 };

        beforeEach ( () => {
            config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return ( ( status >= 200 && status < 300 ) || status === 403 || status === 405 || status === 422 )
                },
                crossDomain: true
            };
        });

        test ('2.3.1 No Passwords entered', async () => {

            try {
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);
        
        test ('2.3.2 Blank password entered', async () => {

            try {

                sendBody.password = '';
                sendBody.password2 = 'Hello123';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
                expect (res.data.errorMsg.password2).toBe('Your passwords must match.');
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);
        
        test ('2.3.3 Password less than 6 characters', async () => {

            try {

                sendBody.password = 'Abcd1';
                sendBody.password2 = 'Hello123';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
                expect (res.data.errorMsg.password2).toBe('Your passwords must match.');
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);
        
        test ('2.3.4 Password greater than 20 characters', async () => {

            try {

                sendBody.password = 'Abcdefghilkmnopqrstu1';
                sendBody.password2 = 'Hello123';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
                expect (res.data.errorMsg.password2).toBe('Your passwords must match.');
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);
        
        test ('2.3.5 Valid password, missing confirmation password', async () => {

            try {

                sendBody.password = 'Hello123';
                delete sendBody.password2;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBe('Your passwords must match.');
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);
        
        test ('2.3.6 Valid password, blank confirmation password', async () => {

            try {

                sendBody.password = 'Hello123';
                sendBody.password2 = '';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBe('Your passwords must match.');
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);
        
    });

    describe ( '2.4 Tutor Type validation checks', () => {

        let config;
        let sendBody = { username: 'DaveFromSurrey', email: 'dad@dad.co.uk', password: 'Hello123', password2: 'Hello123' };

        beforeEach ( () => {
            config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return ( ( status >= 200 && status < 300 ) || status === 403 || status === 405 || status === 422 )
                },
                crossDomain: true
            };
        });

        test ('2.4.1 No tutor type entered', async () => {

            try {
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBe('The user type must be between 1 and 3.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.4.2 Blank tutor type entered', async () => {

            try {
                sendBody.type = '';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBe('The user type must be between 1 and 3.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.4.3 Alphanumeric tutor type entered', async () => {

            try {
                sendBody.type = 'a';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBe('The user type must be between 1 and 3.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.4.4 Numeric tutor type entered that is out of range', async () => {

            try {
                sendBody.type = '4';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBe('The user type must be between 1 and 3.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);

        test ('2.4.5 Valid Numeric tutor type entered (1)', async () => {

            try {
                sendBody.type = '1';
                delete sendBody.password2;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBe('Your passwords must match.');
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);

        test ('2.4.6 Valid Numeric tutor type entered (2)', async () => {

            try {
                sendBody.type = '2';
                delete sendBody.password2;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBe('Your passwords must match.');
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);

        test ('2.4.7 Valid Numeric tutor type entered (3)', async () => {

            try {
                sendBody.type = '3';
                delete sendBody.password2;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBeNull();
                expect (res.data.errorMsg.email).toBeNull();
                expect (res.data.errorMsg.password).toBeNull();
                expect (res.data.errorMsg.password2).toBe('Your passwords must match.');
                expect (res.data.errorMsg.type).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);

    });


    describe ( '2.5 No Parameters or Valid User', () => {

        let config;
        let sendBody = { };

        beforeEach ( () => {
            config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return ( ( status >= 200 && status < 300 ) || status === 403 || status === 405 || status === 422 )
                },
                crossDomain: true
            };
        });

        test ('2.5.1 No parameters passed in', async () => {

            try {
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
                expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
                expect (res.data.errorMsg.password2).toBeNull();
                expect (res.data.errorMsg.type).toBe('The user type must be between 1 and 3.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);

        test ('2.5.2 Valid User Created', async () => {

            try {
                sendBody.username = 'user_reg_create_user_test';
                sendBody.email = 'dad@dad.co.uk';
                sendBody.password = 'Hello123';
                sendBody.password2 = 'Hello123';
                sendBody.type = '3';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user`, body, config);
                userToken = res.data.token;

                expect (res.status).toBe(201);
                expect (res.data.token).toBeDefined();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);

    });
    
});


describe ( '3. Test Get Tutor', () => {

    let sendBody = {};
    let config;
    beforeEach ( () => {
        config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            validateStatus: function(status) {
                return (status < 500);
            },
            crossDomain: true
        };
    });

    test ( '3.1 No token passed', async () => {

        try {
            const body = JSON.stringify({});
            const res = await axios.get(`http://localhost:3002/user`, body, config);

            expect (res.status).toBe(401);
            expect (res.data.errorMsg).toBe('User is not signed in.');
        } catch (err) {
            expect (err.response.status).toBe(401);
            expect (err.response.data.errorMsg).toBe('User is not signed in.');
        }

    }, millisecondTimeout);

    test ( '3.2 Blank token passed', async () => {

        try {
            const body = JSON.stringify({});
            axios.defaults.headers.common['X-Auth-Token'] = '';
            const res = await axios.get(`http://localhost:3002/user`, body, config);

            expect(err.response.status).toBe(401);
            expect(err.response.data.errorMsg).toBe('User is not signed in.');
        } catch (err) {
            expect(err.response.status).toBe(401);
            expect(err.response.data.errorMsg).toBe('User is not signed in.');
        }

    }, millisecondTimeout);


    test ( '3.3 Incorrect token passed', async () => {

        try {
            const body = JSON.stringify({});
            axios.defaults.headers.common['X-Auth-Token'] = 'sfgsd gf;vsfn;lagjsdr;pvbjz;lbjfdt;ohd';
            const res = await axios.get(`http://localhost:3002/user`, body, config);

            expect(err.response.status).toBe(409);
            expect(err.response.data.errorMsg).toBe('User is not signed in.');
        } catch (err) {
            expect(err.response.status).toBe(409);
            expect(err.response.data.errorMsg).toBe('User is not signed in.');
        }

    }, millisecondTimeout);

    test ( '3.4 Valid token passed', async () => {

        try {
            const body = JSON.stringify({});
            axios.defaults.headers.common['X-Auth-Token'] = `${userTest1}`;
            const res = await axios.get(`http://localhost:3002/user`, body, config);

            expect (res.status).toBe(200);
            expect(res.data.user.username).toBe('user_test_1');
            expect(res.data.user.email).toBe('test1@tester.co.uk');
            expect(res.data.user.type).toBe(3);
        } catch (err) {
            console.error (err);
            expect(1).toBe(20);
        }

    }, millisecondTimeout);

});

describe ( '4. Test Update Tutor', () => {

    let sendBody = {};
    let config;
    beforeEach ( () => {
        config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            validateStatus: function(status) {
                return (status < 500);
            },
            crossDomain: true
        };
        sendBody = { 
            username: 'Changed',
            email: 'changed@update.co.uk',
            password: 'Hello123',
            password2: 'Hello123',
            type: '3' 
        };
        delete axios.defaults.headers.common['X-Auth-Token'];
    });

    test ( '4.1 No token and no body passed', async () => {

        try {
            const body = JSON.stringify({});
            // axios.defaults.headers.common['X-Auth-Token'] = `${userToken}`;
            const res = await axios.put(`http://localhost:3002/user`, body, config);

            expect(res.status).toBe(401);
            expect(res.data.errorMsg).toBe('User is not signed in.');
        } catch (err) {
            expect(err.response.status).toBe(401);
            expect(err.response.data.errorMsg).toBe('User is not signed in.');
        }

    }, millisecondTimeout);

    test ( '4.2 Blank token passed', async () => {

        try {
            const body = JSON.stringify({});
            axios.defaults.headers.common['X-Auth-Token'] = ``;
            const res = await axios.put(`http://localhost:3002/user`, body, config);

            expect(res.status).toBe(401);
            expect(res.data.errorMsg).toBe('User is not signed in.');
        } catch (err) {
            expect(err.response.status).toBe(401);
            expect(err.response.data.errorMsg).toBe('User is not signed in.');
        }

    }, millisecondTimeout);


    test ( '4.3 Incorrect token passed', async () => {

        try {
            const body = JSON.stringify(sendBody);
            axios.defaults.headers.common['X-Auth-Token'] = `adfsadsadfsdafsad`;
            const res = await axios.put(`http://localhost:3002/user`, body, config);

            expect(res.status).toBe(409);
            expect(res.data.errorMsg).toBe('User is not signed in.');
        } catch (err) {
            expect(err.response.status).toBe(409);
            expect(err.response.data.errorMsg).toBe('User is not signed in.');
        }

    }, millisecondTimeout);

    test ( '4.4 Valid token passed and no body', async () => {

        try {
            const body = JSON.stringify({});
            axios.defaults.headers.common['X-Auth-Token'] = `${userToken}`;
            const res = await axios.put(`http://localhost:3002/user`, body, config);

            expect (res.status).toBe(422);
            expect (res.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
            expect (res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
            expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            expect (res.data.errorMsg.password2).toBeNull();
            expect (res.data.errorMsg.type).toBe('The user type must be between 1 and 3.');

        } catch (err) {
            expect (err.response.status).toBe(422);
            expect (err.response.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
            expect (err.response.data.errorMsg.email).toBe('A valid email address needs to be entered.');
            expect (err.response.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            expect (err.response.data.errorMsg.password2).toBeNull();
            expect (err.response.data.errorMsg.type).toBe('The user type must be between 1 and 3.');
    }

    }, millisecondTimeout);

    test ( '4.5 Valid token passed and invalid username', async () => {

        try {
            sendBody.username = 'd';
            const body = JSON.stringify(sendBody);
            axios.defaults.headers.common['X-Auth-Token'] = `${userTest1}`;
            const res = await axios.put(`http://localhost:3002/user`, body, config);

            expect(res.status).toBe(422);
            expect(res.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
            expect(res.data.errorMsg.email).toBeNull();
            expect(res.data.errorMsg.password).toBeNull();
            expect(res.data.errorMsg.password2).toBeNull();
            expect(res.data.errorMsg.type).toBeNull();
        } catch (err) {
            expect(err.response.status).toBe(422);
            expect(err.response.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
            expect(err.response.data.errorMsg.email).toBeNull();
            expect(err.response.data.errorMsg.password).toBeNull();
            expect(err.response.data.errorMsg.password2).toBeNull();
            expect(err.response.data.errorMsg.type).toBeNull();
        }

    }, millisecondTimeout);


    test ( '4.6 Valid token passed and invalid email', async () => {

        try {
            sendBody.email = 'd';
            const body = JSON.stringify(sendBody);
            axios.defaults.headers.common['X-Auth-Token'] = `${userTest1}`;
            const res = await axios.put(`http://localhost:3002/user`, body, config);

            expect(res.status).toBe(422);
            expect(res.data.errorMsg.username).toBeNull();
            expect(res.data.errorMsg.email).toBe('A valid email address needs to be entered.');
            expect(res.data.errorMsg.password).toBeNull();
            expect(res.data.errorMsg.password2).toBeNull();
            expect(res.data.errorMsg.type).toBeNull();
        } catch (err) {

            expect(err.response.status).toBe(422);
            expect(err.response.data.errorMsg.username).toBeNull();
            expect(err.response.data.errorMsg.email).toBe('A valid email address needs to be entered.');
            expect(err.response.data.errorMsg.password).toBeNull();
            expect(err.response.data.errorMsg.password2).toBeNull();
            expect(err.response.data.errorMsg.type).toBeNull();
        }

    }, millisecondTimeout);

    test ( '4.7 Valid token passed and invalid password', async () => {

        try {
            sendBody.password = 'd';
            const body = JSON.stringify(sendBody);
            axios.defaults.headers.common['X-Auth-Token'] = `${userTest1}`;
            const res = await axios.put(`http://localhost:3002/user`, body, config);

            expect(res.status).toBe(422);
            expect(res.data.errorMsg.username).toBeNull();
            expect(res.data.errorMsg.email).toBeNull();
            expect(res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            expect(res.data.errorMsg.password2).toBe('Your passwords must match.');
            expect(res.data.errorMsg.type).toBeNull();
        } catch (err) {
            console.log (err);
            expect(err.response.status).toBe(422);
            expect(err.response.data.errorMsg.username).toBeNull();
            expect(err.response.data.errorMsg.email).toBeNull();
            expect(err.response.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            expect(err.response.data.errorMsg.password2).toBe('Your passwords must match.');
            expect(err.response.data.errorMsg.type).toBeNull();
        }

    }, millisecondTimeout);

    test ( '4.8 Valid token and update details - non validated account', async () => {

        try {
            const body = JSON.stringify(sendBody);
            console.log (sendBody);
            axios.defaults.headers.common['X-Auth-Token'] = `${userTest1}`;
            const res = await axios.put(`http://localhost:3002/user`, body, config);

            expect(res.status).toBe(409);
            expect(res.data.errorMsg.username).toBe('Username reserved, if this was you re-enter username with original email.');
        } catch (err) {
            expect(err.response.status).toBe(409);
            expect(err.response.data.errorMsg.username).toBe('Username reserved, if this was you re-enter username with original email.');
        }

    }, millisecondTimeout);

});

describe ( '5. Test Delete Tutor', () => {

    let config;
    beforeEach ( () => {
        config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            validateStatus: function(status) {
                return (status < 500);
            },
            crossDomain: true
        };

        delete axios.defaults.headers.common['X-Auth-Token'];

    });

    test ( '5.1 No token passed', async () => {
        try {
            const body = JSON.stringify({});

            // axios.defaults.headers.common['X-Auth-Token'] = `${userTest1}`;
            const res = await axios.delete(`http://localhost:3002/user`, body, config);

            expect(res.status).toBe(404);
            expect(res.data.errorMsg).toBe('Requested user does not exist.');
        } catch (err) {
            expect(err.response.status).toBe(404);
            expect(err.response.data.errorMsg).toBe('Requested user does not exist.');
        }

    }, millisecondTimeout);

    test ( '5.2 Blank token passed', async () => {
        try {
            const body = JSON.stringify({});

            axios.defaults.headers.common['X-Auth-Token'] = ``;
            const res = await axios.delete(`http://localhost:3002/user`, body, config);

            expect(res.status).toBe(404);
            expect(res.data.errorMsg).toBe('Requested user does not exist.');
        } catch (err) {
            expect(err.response.status).toBe(404);
            expect(err.response.data.errorMsg).toBe('Requested user does not exist.');
        }

    }, millisecondTimeout);

    test ( '5.3 Incorrect token passed', async () => {
        try {
            const body = JSON.stringify({});

            axios.defaults.headers.common['X-Auth-Token'] = `sfsdgsdrsdgsdsfersfdeewrdergfsdfd`;
            const res = await axios.delete(`http://localhost:3002/user`, body, config);

            expect(res.status).toBe(404);
            expect(res.data.errorMsg).toBe('Requested user does not exist.');
        } catch (err) {
            expect(err.response.status).toBe(404);
            expect(err.response.data.errorMsg).toBe('Requested user does not exist.');
        }

    }, millisecondTimeout);

    test ( '5.4 Valid token passed', async () => {
        try {
            const body = JSON.stringify({});

            axios.defaults.headers.common['X-Auth-Token'] = `${userDeleteTest1}`;
            const res = await axios.delete(`http://localhost:3002/user`, body, config);
            expect(res.status).toBe(201);
            expect(res.data.msg).toBe('Account deleted.');
        } catch (err) {
            expect(err.response.status).toBe(201);
            expect(err.response.data.msg).toBe('Account deleted.');
        }

    }, millisecondTimeout);

});



