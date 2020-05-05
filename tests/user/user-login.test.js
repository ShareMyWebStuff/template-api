'use strict';
const results = require('dotenv').config({ debug: process.env.DEBUG });
const axios = require ('axios');
const db = require('../../layers/common/nodejs/services/db').mysqlDB();

//
// user-login.test
//
//
// 1. Test all undefined login routes
//     1.1 Test Patch
//     1.2 Test Get
//     1.3 Test Put
//     1.4 Test Delete
// 2. Test Login
//     2.1 Username validation
//         2.1.1 No username
//         2.1.2 Username too short
//         2.1.3 Username too long
//         2.1.4 Username can contain uppercase characters
//         2.1.5 Username can contain lowercase characters
//         2.1.6 Username can contain numbers
//         2.1.7 Username can contain email characters (first set)
//         2.1.8 Username can contain email characters (second set)
//     2.2 Password validation
//         2.2.1 No password
//         2.2.2 Blank password entered
//         2.2.3 Password less than 6 characters
//         2.2.4 Password greater than 20 characters
//     2.3 Login
//         2.3.1 Error login in to unvalidated account
//         2.3.2 Login to validated account


// Number of milliseconds the tests will run for
const millisecondTimeout = 360000;

jest.setTimeout(millisecondTimeout);

//
// Before all tests connect to the database and create a non validated and validated user.
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
        await db.saveData (`DELETE FROM user_login WHERE username like 'login_%'`);

        // Insert non validated account
        sendBody = { username: 'login_non_validate', email: 'non@tester.com', password: 'Hello123', password2: 'Hello123', type: 3 }; 
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user`, body, dataSetupConfig);

        // Insert validated account
        sendBody = { username: 'login_validate', email: 'valid@tester.com', password: 'Hello123', password2: 'Hello123', type: 3 }; 
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user`, body, dataSetupConfig);

        await db.saveData (`UPDATE user_login SET validated_email = 'Y', validated = 'Y' ORDER BY user_id DESC LIMIT 1;`);

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

describe ( '1. Test all undefined login routes', () => {

    let config;

    beforeEach ( () => {
        config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            validateStatus: function (status) {
                return ( status < 500 )
            },
            crossDomain: true
        }

    });


    test ('1.1 Test Patch', async () => {

        let res, body, status;

        try {
            res = await axios.patch(`http://localhost:3002/user-auth`, config);
            body = JSON.parse(res.data.body);
            status = res.status;
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (PATCH) was used and not handled.");
    }, millisecondTimeout);

    test ('1.2 Test Get', async () => {

        let res, body, status;

        try {
            res = await axios.get(`http://localhost:3002/user-auth`, config);
            body = JSON.parse(res.data.body);
            status = res.status;
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (GET) was used and not handled.");
    }, millisecondTimeout);

    test ('1.3 Test Put', async () => {

        let res, body, status;

        try {
            res = await axios.put(`http://localhost:3002/user-auth`, config);
            body = JSON.parse(res.data.body);
            status = res.status;
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (PUT) was used and not handled.");
    }, millisecondTimeout);

    test ('1.4 Test Delete', async () => {

        let res, body, status;

        try {
            res = await axios.delete(`http://localhost:3002/user-auth`, config);
            body = JSON.parse(res.data.body);
            status = res.status;
        } catch (err) {
            console.log (err);
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (DELETE) was used and not handled.");
    }, millisecondTimeout);

});

describe ( '2. Test Login', () => {


    describe ( '2.1 Username validation', () => {

        let config;
        let sendBody = { username: 'DaveFromSurrey', password: 'Hello123' };

        beforeEach ( () => {
            config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return ( status < 500 )
                },
                crossDomain: true
            }
        });

        test ('2.1.1 No username', async () => {

            let res, body, status;
    
            try {
                delete sendBody.username;
                const body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
            }

        }, millisecondTimeout);
    
        test ('2.1.2 Username too short', async () => {

            let res, body, status;
    
            try {
                sendBody.username = 'd';
                const body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
            }

        }, millisecondTimeout);
    
        test ('2.1.3 Username too long', async () => {

            let res, body, status;
    
            try {
                sendBody.username = 'Dad4567890123456789012345678901';
                const body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.username).toBe('Username has to be 6 - 30 characters and can contain your email address.');
            }

        }, millisecondTimeout);
    
        test ('2.1.4 Username can contain uppercase characters', async () => {

            let res, body, status;
    
            try {
                sendBody.username = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                delete sendBody.password;
                const body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            }

        }, millisecondTimeout);
    
        test ('2.1.5 Username can contain lowercase characters', async () => {

            let res, body, status;
    
            try {
                sendBody.username = 'abcdefghijklmnopqrstuvwxyz';
                delete sendBody.password;
                const body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            }

        }, millisecondTimeout);
    
        test ('2.1.6 Username can contain numbers', async () => {

            let res, body, status;
    
            try {
                sendBody.username = '01234567890';
                delete sendBody.password;
                const body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            }

        }, millisecondTimeout);
    
        test ('2.1.7 Username can contain email characters (first set)', async () => {

            let res, body, status;
    
            try {
                sendBody.username = '!#$%&\'*+-/=?^_`{|}~. ()';
                delete sendBody.password;
                const body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            }

        }, millisecondTimeout);
    
        test ('2.1.8 Username can contain email characters (second set)', async () => {

            let res, body, status;
    
            try {
                sendBody.username = ',:;<>@[\\]';
                delete sendBody.password;
                const body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            }

        }, millisecondTimeout);

    });

    describe ( '2.2 Password validation', () => {

        let config;
        let sendBody = { username: 'DaveFromSurrey', password: 'Hello123' };

        beforeEach ( () => {
            config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return ( status < 500 )
                },
                crossDomain: true
            }
        });

        test ('2.2.1 No password', async () => {

            let res, body;
    
            try {
                delete sendBody.password;
                body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.username).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            }

        }, millisecondTimeout);

        test ('2.2.2 Blank password entered', async () => {

            let res, body;
    
            try {
                sendBody.password = '';
                body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.username).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            }

        }, millisecondTimeout);
    
        test ('2.2.3 Password less than 6 characters', async () => {

            let res, body;
    
            try {
                sendBody.password = 'Abcd1';
                body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.username).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            }

        }, millisecondTimeout);
    
        test ('2.2.4 Password greater than 20 characters', async () => {

            let res, body;
    
            try {
                sendBody.password = 'Abcdefghilkmnopqrstu1';
                body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(422);
                expect (res.data.errorMsg.password).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(422);
                expect (err.response.data.errorMsg.username).toBe('Your password needs to be 6 - 20 characters long and must contain at least one number.');
            }

        }, millisecondTimeout);
    
    });

    describe ( '2.3 Login', () => {

        let config;
        let sendBody = { username: 'DaveFromSurrey', password: 'Hello123' };

        beforeEach ( () => {
            config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    return ( status < 500 )
                },
                crossDomain: true
            }
        });

        test ('2.3.1 Error login in to unvalidated account', async () => {

            let res, body;
    
            try {
                sendBody.username = 'login_non_validate';
                body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(401);
                expect (res.data.errorMsg.password).toBe('You need to validate your account before login in.');
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(401);
                expect (err.response.data.errorMsg.username).toBe('You need to validate your account before login in.');
            }

        }, millisecondTimeout);

        test ('2.3.2 Login to validated account', async () => {

            let res, body;
    
            try {
                sendBody.username = 'login_validate';
                body = JSON.stringify(sendBody);
                res = await axios.post(`http://localhost:3002/user-auth`, body, config);
                expect (res.status).toBe(201);
                expect (res.data.token).toBeDefined();
            } catch (err) {
                console.log (err);
                expect (err.response.status).toBe(201);
                expect (err.response.data.token).toBeDefined();
            }

        }, millisecondTimeout);
    
    });

});

