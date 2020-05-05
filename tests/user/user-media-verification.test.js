'use strict';
const results = require('dotenv').config({ debug: process.env.DEBUG });
const axios = require ('axios');
const db = require('../../layers/common/nodejs/services/db').mysqlDB();

// Number of milliseconds the tests will run for
const millisecondTimeout = 360000;

jest.setTimeout(millisecondTimeout);

// Global variables
let user_token_1, verificationCode;

//
// user-media-verification.test
//
// 1. Test all undefined login routes
//     1.1 Test Patch
//     1.2 Test Put
//     1.3 Test Get
//     1.4 Test Delete
// 2. Test for failures.
//     2.1 No Verification Code
//     2.2 No Media Type
//     2.3 Invalid verification code
// 3. Test for success.
//     3.1 Email verification


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
        await db.saveData (`DELETE FROM user_contact_details WHERE user_id IN (SELECT user_id FROM user_login WHERE username like 'verify_%')`);
        await db.saveData (`DELETE FROM user_login WHERE username like 'verify_%'`);

        // Create user for email verification of account
        sendBody = { username: 'verify_1', email: 'verify_1@tester.com', password: 'Hello123', password2: 'Hello123', type: 3 }; 
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user`, body, dataSetupConfig);
        user_token_1=res.data.token;

        axios.defaults.headers.common['X-Auth-Token'] = `${user_token_1}`;
        sendBody = { title: 'Mr', firstname: 'John', lastname: 'Verify', gender: 'F', address1: '10 Mount Herman Road', address2: '', town: 'Worthing', county: 'Surrey', postcode: '', country: 'United Kingdom', phone: '', mobile: '07973 123456', domainName: "TESTER", websiteName: "TESTER", password: 'Hello123' };
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user-contact-details`, body, dataSetupConfig);
        verificationCode=res.data.verificationCode;

        delete axios.defaults.headers.common['X-Auth-Token'];
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

test ( 'Always success', () => {

    expect(1).toBe(1);
});


describe ( '1. Test all undefined login routes', () => {

    let config, sendBody;

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
            body = JSON.stringify({});
            res = await axios.patch(`http://localhost:3002/user-media-verify`, body, config);

            body = JSON.parse(res.data.body);
            status = res.status;
        } catch (err) {
            console.log (err);
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (PATCH) was used and not handled.");
    }, millisecondTimeout);

    test ('1.2 Test Put', async () => {

        let res, body, status;

        try {
            body = JSON.stringify({});
            res = await axios.put(`http://localhost:3002/user-media-verify`, body, config);
            body = JSON.parse(res.data.body);
            status = res.status;
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (PUT) was used and not handled.");
    }, millisecondTimeout);

    test ('1.3 Test Get', async () => {

        let res, body, status;

        try {
            body = JSON.stringify({});
            res = await axios.get(`http://localhost:3002/user-media-verify`, body, config);
            body = JSON.parse(res.data.body);
            status = res.status;
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (GET) was used and not handled.");
    }, millisecondTimeout);

    test ('1.4 Test Delete', async () => {

        let res, body, status;

        try {
            body = JSON.stringify({});
            res = await axios.delete(`http://localhost:3002/user-media-verify`, body, config);
            body = JSON.parse(res.data.body);
            status = res.status;
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (DELETE) was used and not handled.");
    }, millisecondTimeout);

});

describe ( '2. Test for failures.', () => {

    let config, sendBody;

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

    test ('2.1 No Verification Code', async () => {

        let res, body, status;

        try {
            body = JSON.stringify({ mediaType: 'Email'});
            res = await axios.post(`http://localhost:3002/user-media-verify`, body, config);

            expect(res.status).toBe(404);
            expect(res.data.errorMsg.verificationCode).toBe("Verification code does not exist.");

        } catch (err) {
            expect(status).toBe(404);
        }
    }, millisecondTimeout);

    test ('2.2 No Media Type', async () => {

        let res, body, status;

        try {
            body = JSON.stringify({ verificationCode: '12345'});
            res = await axios.post(`http://localhost:3002/user-media-verify`, body, config);

            expect(res.status).toBe(404);
            expect(res.data.errorMsg.mediaType).toBe("Media type is not specified.");

        } catch (err) {
            expect(status).toBe(404);
        }
    }, millisecondTimeout);

    test ('2.3 Invalid verification code', async () => {

        let res, body, status;

        try {
            body = JSON.stringify({ verificationCode: '12345', mediaType: 'Email'});
            res = await axios.post(`http://localhost:3002/user-media-verify`, body, config);

            expect(res.status).toBe(404);
            expect(res.data.errorMsg.verificationCode).toBe("Verification code does not exist.");

        } catch (err) {
            expect(status).toBe(404);
        }
    }, millisecondTimeout);


});

describe ( '3. Test for success.', () => {

    let config, sendBody;

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

    test ('3.1 Email verification', async () => {

        let res, body, status;

        try {
            body = JSON.stringify({ verificationCode, mediaType: 'Email'});
            res = await axios.post(`http://localhost:3002/user-media-verify`, body, config);

            expect(res.status).toBe(201);
            expect(res.data.msg).toBe("Media verfication deleted.");

        } catch (err) {
            expect(status).toBe(404);
        }
    }, millisecondTimeout);


});

