'use strict';
// const results = require('dotenv').config({ debug: process.env.DEBUG });
const axios = require ('axios');
const db = require('../../layers/common/nodejs/services/db').mysqlDB();

// 
// Subjects 
//
// This set of tests are to test that we can retrieve the subjects correctly.
// 
// 1. Test all routes POST / PUT / GET / DELETE to ensure we only have the ones setup that we require ( GET ).
// 2. GET subjects - check that subjects are returned
//

describe ( '1. Test all undefined subject routes', () => {

    let config;

    beforeEach ( () => {
        config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            crossDomain: true
        }

    })

    test ('1.1 Test Post', async () => {

        let body, status;

        try {
            const res = await axios.post(`http://localhost:3002/subjects`, config);

            // This is an error as the error wasnt thrown by axios
            expect (0).toBe(1);
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (POST) was used and not handled.");
    });

    test ('1.2 Test Put', async () => {

        let body, status;

        try {
            const res = await axios.put(`http://localhost:3002/subjects`, config);

            // This is an error as the error wasnt thrown by axios
            expect (0).toBe(1);
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (PUT) was used and not handled.");
    });

    test ('1.3 Test Delete', async () => {

        let body, status;

        try {
            const res = await axios.delete(`http://localhost:3002/subjects`, config);

            // This is an error as the error wasnt thrown by axios
            expect (0).toBe(1);
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (DELETE) was used and not handled.");
    });

    test ('1.4 Test Patch', async () => {

        let body, status;

        try {
            const res = await axios.patch(`http://localhost:3002/subjects`, config);

            // This is an error as the error wasnt thrown by axios
            expect (0).toBe(1);
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (PATCH) was used and not handled.");
    });

});

describe ( '2. Test GET subject route', () => {

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

    })

    test ('2.1 Test Get retrieves subjects', async () => {


        try {
            const res = await axios.get(`http://localhost:3002/subjects`, config);

            // This is an error as the error wasnt thrown by axios
            expect(res.status).toBe(200);
            expect (Object.keys(res.data).length).toBeGreaterThan(0);
        } catch (err) {
            console.log (err);
            expect(1).toBe(2);
        }
    });

});

