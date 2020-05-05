'use strict';
const results = require('dotenv').config({ debug: process.env.DEBUG });
const axios = require ('axios');
const db = require('../../layers/common/nodejs/services/db').mysqlDB();

// 
// user-contact-details.test
// 
//
// 1. Test all undefined login routes
//     1.1 Test Patch
// 2. Contact Details Validation
//     2.1 Title validation Checks
//         2.1.1 No title entered
//         2.1.2 Valid title Mr entered
//         2.1.3 Valid title Mrs entered
//         2.1.4 Valid title Miss entered
//         2.1.5 Valid title Ms entered
//         2.1.6 Valid title Dr entered
//     2.2 firstname validation Checks
//         2.2.1 No firstname entered
//         2.2.2 Firstname is too short
//         2.2.3 Firstname is too long
//     2.3 lastname validation Checks
//         2.3.1 No lastname entered
//         2.3.2 Lastname is too short
//         2.3.3 lastname is too long
//     2.4 gender validation Checks
//         2.4.1 No gender entered
//         2.4.2 Invalid gender
//     2.5 address1 validation Checks
//         2.5.1 No address1 entered
//         2.5.2 Address1 is too short
//         2.5.3 Address1 is too long
//     2.6 address2 validation Checks
//         2.6.1 No address2 entered
//         2.6.2 Address2 too long
//     2.7 town validation Checks
//         2.7.1 No town entered
//         2.7.2 A town whose name is too short
//         2.7.3 A town whose name is too long
//     2.8 county validation Checks
//         2.8.1 No county entered
//         2.8.1 County is too short
//         2.8.2 County is too long
//     2.9 postcode validation Checks
//         2.9.1 No postcode entered
//         2.9.2 Postcode to long
//     2.10 country validation Checks
//         2.10.1 No country entered
//         2.10.2 Country is too short
//         2.10.3 Country is too long
//     2.11 phone validation Checks
//         2.11.1 No phone entered
//         2.11.2 Phone number to long
//     2.12 mobile validation Checks
//         2.12.1 No mobile entered
//         2.12.2 Mobile is too long
//     3. Create Contact Details
//         3.1 Successfully created
//     4. Update Contact Details
//         4.1 Successfully updated
//     5. Delete Contact Details
//         5.1 Successfully deleted


// Number of milliseconds the tests will run for
const millisecondTimeout = 360000;

jest.setTimeout(millisecondTimeout);

// 
let user_token_1, user_token_2, user_token_3, user_token_4;

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
        await db.saveData (`DELETE FROM user_contact_details WHERE user_id IN (SELECT user_id FROM user_login WHERE username like 'contact_dets_%')`);
        await db.saveData (`DELETE FROM user_login WHERE username like 'contact_dets_%'`);

        // Insert validated account for validation testing
        sendBody = { username: 'contact_dets_1', email: 'cont_det_1@tester.com', password: 'Hello123', password2: 'Hello123', type: 3 }; 
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user`, body, dataSetupConfig);
        user_token_1=res.data.token;

        await db.saveData (`UPDATE user_login SET validated_email = 'Y', validated = 'Y' ORDER BY user_id DESC LIMIT 1;`);

        // Create create user  account not validated, so contact details can be added at a later date
        sendBody = { username: 'contact_dets_create', email: 'cont_det_2@tester.com', password: 'Hello123', password2: 'Hello123', type: 3 }; 
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user`, body, dataSetupConfig);
        user_token_2=res.data.token;

        // Create update user and contact details account
        sendBody = { username: 'contact_dets_update', email: 'cont_det_3@tester.com', password: 'Hello123', password2: 'Hello123', type: 3 }; 
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user`, body, dataSetupConfig);
        user_token_3=res.data.token;

        await db.saveData (`UPDATE user_login SET validated_email = 'Y', validated = 'Y' ORDER BY user_id DESC LIMIT 1;`);

        axios.defaults.headers.common['X-Auth-Token'] = `${user_token_3}`;
        sendBody = { title: 'Mr', firstname: 'Update', lastname: 'Down', gender: 'F', address1: '10 The High Street', address2: '', town: 'Guildford', county: 'Surrey', postcode: '', country: 'United Kingdom', phone: '01483 755899', mobile: '07973 123456', domainName: "TESTER", websiteName: "TESTER", password: 'Hello123' };
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user-contact-details`, body, dataSetupConfig);

        // Create delete user and contact details account
        sendBody = { username: 'contact_dets_delete', email: 'cont_det_4@tester.com', password: 'Hello123', password2: 'Hello123', type: 3 }; 
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user`, body, dataSetupConfig);
        user_token_4=res.data.token;

        await db.saveData (`UPDATE user_login SET validated_email = 'Y', validated = 'Y' ORDER BY user_id DESC LIMIT 1;`);

        axios.defaults.headers.common['X-Auth-Token'] = `${user_token_4}`;
        sendBody = { title: 'Mr', firstname: 'Delete', lastname: 'Down', gender: 'F', address1: '10 The High Street', address2: '', town: 'Guildford', county: 'Surrey', postcode: '', country: 'United Kingdom', phone: '01483 755899', mobile: '07973 123456', domainName: "TESTER", websiteName: "TESTER", password: 'Hello123' };
        body = JSON.stringify(sendBody);
        res = await axios.post(`http://localhost:3002/user-contact-details`, body, dataSetupConfig);

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

//
// Test routes not configured to work produce error message.
//

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
            axios.defaults.headers.common['X-Auth-Token'] = `${user_token_1}`;
            const body = JSON.stringify(sendBody);
            res = await axios.patch(`http://localhost:3002/user-contact-details`, config);
            body = JSON.parse(res.data.body);
            status = res.status;
        } catch (err) {
            body = JSON.parse(err.response.data.body);
            status = err.response.status;
        }
        expect(status).toBe(405);
        expect(body.errorMsg).toBe("HttpMethod (PATCH) was used and not handled.");
    }, millisecondTimeout);

});

describe ( '2. Contact Details Validation', () => {

    beforeAll ( ()=> {
        axios.defaults.headers.common['X-Auth-Token'] = `${user_token_1}`;
    })

    describe ('2.1 Title validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {
            sendBody = { 	
                title: 'Mr',
                firstname: 'Sam',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                country: 'United Kingdom',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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

        test ('2.1.1 No title entered', async () => {
            try {
                delete sendBody.title;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBe('Title is not set.');
                expect (res.data.errorMsg.firstname).toBeNull();
                expect (res.data.errorMsg.lastname).toBeNull();
                expect (res.data.errorMsg.gender).toBeNull();
                expect (res.data.errorMsg.address1).toBeNull();
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBeNull();
                expect (res.data.errorMsg.county).toBeNull();
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBeNull();
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();

            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.2 Valid title Mr entered', async () => {
            try {
                sendBody.title = 'Mr';
                delete sendBody.country;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.3 Valid title Mrs entered', async () => {
            try {
                sendBody.title = 'Mrs';
                delete sendBody.country;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.4 Valid title Miss entered', async () => {
            try {
                sendBody.title = 'Miss';
                delete sendBody.country;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.5 Valid title Ms entered', async () => {
            try {
                sendBody.title = 'Ms';
                delete sendBody.country;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.1.6 Valid title Dr entered', async () => {
            try {
                sendBody.title = 'Dr';
                delete sendBody.country;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

    });


    describe ('2.2 firstname validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {

            sendBody = { 	
                title: 'Mr',
                firstname: 'Sam',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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
        })

        test ('2.2.1 No firstname entered', async () => {
            try {
                delete sendBody.firstname;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.firstname).toBe('First name is not set.');
                expect (res.data.errorMsg.lastname).toBeNull();
                expect (res.data.errorMsg.gender).toBeNull();
                expect (res.data.errorMsg.address1).toBeNull();
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBeNull();
                expect (res.data.errorMsg.county).toBeNull();
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.2.2 Firstname is too short', async () => {
            try {
                sendBody.firstname = 'A';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.firstname).toBe('First name must be at least 2 characters long.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);

        test ('2.2.3 Firstname is too long', async () => {
            try {
                sendBody.firstname = 'Dave 1234501234567890123456789012345678901234567890';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.firstname).toBe('First name must be less than 50 characters.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        }, millisecondTimeout);

    });

    describe ('2.3 lastname validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {

            sendBody = { 	
                title: 'Mr',
                firstname: 'Sam',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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
        })

        test ('2.3.1 No lastname entered', async () => {
            try {
                delete sendBody.lastname;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.firstname).toBeNull();
                expect (res.data.errorMsg.lastname).toBe('Last name is not set.');
                expect (res.data.errorMsg.gender).toBeNull();
                expect (res.data.errorMsg.address1).toBeNull();
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBeNull();
                expect (res.data.errorMsg.county).toBeNull();
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.3.2 Lastname is too short', async () => {
            try {
                sendBody.lastname = 'A';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.lastname).toBe('Last name must be at least 2 characters long.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.3.3 lastname is too long', async () => {
            try {
                sendBody.lastname = 'Dave 1234501234567890123456789012345678901234567890';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.lastname).toBe('Last name must be less than 50 characters.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

    });

    describe ('2.4 gender validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {

            sendBody = { 	
                title: 'Mr',
                firstname: 'Sam',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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
        })

        test ('2.4.1 No gender entered', async () => {
            try {
                delete sendBody.gender;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.firstname).toBeNull();
                expect (res.data.errorMsg.lastname).toBeNull();
                expect (res.data.errorMsg.gender).toBe('Gender is not set.');
                expect (res.data.errorMsg.address1).toBeNull();
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBeNull();
                expect (res.data.errorMsg.county).toBeNull();
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.4.2 Invalid gender', async () => {
            try {
                sendBody.gender = 'X';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.gender).toBe('Enter a valid gender ( M / F ).');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

    });

    describe ('2.5 address1 validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {

            sendBody = { 	
                title: 'Mr',
                firstname: 'Sam',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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
        })

        test ('2.5.1 No address1 entered', async () => {
            try {
                delete sendBody.address1;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.firstname).toBeNull();
                expect (res.data.errorMsg.lastname).toBeNull();
                expect (res.data.errorMsg.gender).toBeNull();
                expect (res.data.errorMsg.address1).toBe('The first line of your address needs to entered.');
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBeNull();
                expect (res.data.errorMsg.county).toBeNull();
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.5.2 Address1 is too short', async () => {
            try {
                sendBody.address1 = 'A';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.address1).toBe('The address must be at least 2 characters long.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

        test ('2.5.3 Address1 is too long', async () => {
            try {
                sendBody.address1 = 'Address 12012345678901234567890123456789012345678901234567890123456789012345678901';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.address1).toBe('The address must be less than 80 characters.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
    
        }, millisecondTimeout);

    });

    describe ('2.6 address2 validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {

            sendBody = { 	
                title: 'Mr',
                firstname: 'Sam',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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
        })

        test ('2.6.1 No address2 entered', async () => {
            try {
                delete sendBody.address2;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.firstname).toBeNull();
                expect (res.data.errorMsg.lastname).toBeNull();
                expect (res.data.errorMsg.gender).toBeNull();
                expect (res.data.errorMsg.address1).toBeNull();
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBeNull();
                expect (res.data.errorMsg.county).toBeNull();
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }
        });

        test ('2.6.2 Address2 too long', async () => {
            try {
                sendBody.address2 = 'Address 12012345678901234567890123456789012345678901234567890123456789012345678901';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.address2).toBe('The address must be less than 80 characters.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });
    });


    describe ('2.7 town validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {

            sendBody = { 	
                title: 'Mr',
                firstname: 'Sam',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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
        })

        test ('2.7.1 No town entered', async () => {
            try {
                delete sendBody.town;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.firstname).toBeNull();
                expect (res.data.errorMsg.lastname).toBeNull();
                expect (res.data.errorMsg.gender).toBeNull();
                expect (res.data.errorMsg.address1).toBeNull();
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBe('Your town needs to entered.');
                expect (res.data.errorMsg.county).toBeNull();
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

        test ('2.7.2 A town whose name is too short', async () => {
            try {
                sendBody.town = 'A';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.town).toBe('A valid town needs to be entered.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

        test ('2.7.3 A town whose name is too long', async () => {
            try {
                sendBody.town = 'Town    12012345678901234567890123456789012345678901234567890123456789012345678901';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.town).toBe('The town must be less than 80 characters.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

    });

    describe ('2.8 county validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {

            sendBody = { 	
                title: 'Mr',
                firstname: 'Sam',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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
        })

        test ('2.8.1 No county entered', async () => {
            try {
                delete sendBody.county;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.firstname).toBeNull();
                expect (res.data.errorMsg.lastname).toBeNull();
                expect (res.data.errorMsg.gender).toBeNull();
                expect (res.data.errorMsg.address1).toBeNull();
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBeNull();
                expect (res.data.errorMsg.county).toBe('Your county needs to entered.');
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

        test ('2.8.1 County is too short', async () => {
            try {
                sendBody.county = 'A';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.county).toBe('The county must be at least 2 characters long.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

        test ('2.8.2 County is too long', async () => {
            try {
                sendBody.county = 'County  12012345678901234567890123456789012345678901234567890123456789012345678901';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.county).toBe('Your county must be less than 80 characters.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

    });

    describe ('2.9 postcode validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {

            sendBody = { 	
                title: 'Mr',
                firstname: 'Sam',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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
        })

        test ('2.9.1 No postcode entered', async () => {
            try {
                delete sendBody.postcode;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.firstname).toBeNull();
                expect (res.data.errorMsg.lastname).toBeNull();
                expect (res.data.errorMsg.gender).toBeNull();
                expect (res.data.errorMsg.address1).toBeNull();
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBeNull();
                expect (res.data.errorMsg.county).toBeNull();
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

        test ('2.9.2 Postcode to long', async () => {
            try {
                sendBody.postcode = 'ABCDEFGHIJLM';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);
                

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.postcode).toBe('Your postcode must be less than 11 characters.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });
        
    });

    describe ('2.10 country validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {

            sendBody = { 	
                title: 'Mr',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                country: 'United Kingdom',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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
        })

        test ('2.10.1 No country entered', async () => {
            try {
                delete sendBody.country;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.firstname).toBe('First name is not set.');
                expect (res.data.errorMsg.lastname).toBeNull();
                expect (res.data.errorMsg.gender).toBeNull();
                expect (res.data.errorMsg.address1).toBeNull();
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBeNull();
                expect (res.data.errorMsg.county).toBeNull();
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

        test ('2.10.2 Country is too short', async () => {
            try {
                sendBody.country = 'A';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

        test ('2.10.3 Country is too long', async () => {
            try {
                sendBody.country = 'Country 12012345678901234567890123456789012345678901234567890123456789012345678901';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.country).toBe('Your country must be less than 80 characters.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

    });

    describe ('2.11 phone validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {

            sendBody = { 	
                title: 'Mr',
                firstname: 'Sam',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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
        })

        test ('2.11.1 No phone entered', async () => {
            try {
                delete sendBody.phone;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.firstname).toBeNull();
                expect (res.data.errorMsg.lastname).toBeNull();
                expect (res.data.errorMsg.gender).toBeNull();
                expect (res.data.errorMsg.address1).toBeNull();
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBeNull();
                expect (res.data.errorMsg.county).toBeNull();
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

        test ('2.11.2 Phone number to long', async () => {
            try {
                sendBody.phone = '012345678901234567890';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.phone).toBe('Your phone number must be less than 20 characters.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

    });

    describe ('2.12 mobile validation Checks', () => {

        let config;
        let sendBody;

        beforeEach ( () => {

            sendBody = { 	
                title: 'Mr',
                firstname: 'Sam',
                lastname: 'Down',
                gender: 'M',
                address1: '10 The High Street',
                address2: '',
                town: 'Woking',
                county: 'Surrey',
                postcode: 'GU21 7AU',
                phone: '01483 755899',
                mobile: '07973 123456'
            };
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
        })

        test ('2.12.1 No mobile entered', async () => {
            try {
                delete sendBody.mobile;
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.title).toBeNull();
                expect (res.data.errorMsg.firstname).toBeNull();
                expect (res.data.errorMsg.lastname).toBeNull();
                expect (res.data.errorMsg.gender).toBeNull();
                expect (res.data.errorMsg.address1).toBeNull();
                expect (res.data.errorMsg.address2).toBeNull();
                expect (res.data.errorMsg.town).toBeNull();
                expect (res.data.errorMsg.county).toBeNull();
                expect (res.data.errorMsg.postcode).toBeNull();
                expect (res.data.errorMsg.country).toBe('You must enter a valid country.');
                expect (res.data.errorMsg.phone).toBeNull();
                expect (res.data.errorMsg.mobile).toBeNull();
                expect (res.data.errorMsg.domainName).toBeNull();
                expect (res.data.errorMsg.websiteName).toBeNull();
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

        test ('2.12.2 Mobile is too long', async () => {
            try {
                sendBody.mobile = '012345678901234567890';
                const body = JSON.stringify(sendBody);
                const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

                expect (res.status).toBe(422);
                expect (res.data.errorMsg.mobile).toBe('Your mobile must be less than 20 characters.');
            } catch (err) {
                console.error (err);
                expect(1).toBe(20);
            }

        });

    });

});


//
// Check that an account can be created.
// 
describe ( '3. Create Contact Details', () => {

    let config;
    let sendBody;

    beforeAll ( ()=> {
        axios.defaults.headers.common['X-Auth-Token'] = `${user_token_2}`;
    })

    beforeEach ( () => {
        sendBody = { 	
            title: 'Mr',
            firstname: 'Sam',
            lastname: 'Down',
            gender: 'M',
            address1: '10 The High Street',
            address2: '',
            town: 'Woking',
            county: 'Surrey',
            postcode: 'GU22 0HH',
            country: 'United Kingdom',
            phone: '01483 755899',
            mobile: '07973 123456',
            domainName: "TESTER",
            websiteName: "TESTER",
            password: 'Hello123'
        };
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

    test ('3.1 Successfully created', async () => {
        try {
            const body = JSON.stringify(sendBody);
            const res = await axios.post(`http://localhost:3002/user-contact-details`, body, config);

            expect (res.status).toBe(201);
            expect (res.data.msg).toBe('Account created.');
            expect (res.data.verificationCode).toBeDefined();

        } catch (err) {
            console.error (err);
            expect(1).toBe(20);
        }

    }, millisecondTimeout);

});

//
// Check that contact deails can be updated
//
describe ( '4. Update Contact Details', () => {

    let config;
    let sendBody;

    beforeAll ( ()=> {
        axios.defaults.headers.common['X-Auth-Token'] = `${user_token_3}`;
    })

    beforeEach ( () => {
        sendBody = { 	
            title: 'Mr',
            firstname: 'Sam',
            lastname: 'Down',
            gender: 'M',
            address1: '10 The High Street',
            address2: '',
            town: 'Bude',
            county: 'Cornwall',
            postcode: '',
            country: 'United Kingdom',
            phone: '',
            mobile: '07973 123456',
            domainName: "TESTER",
            websiteName: "TESTER",
            password: 'Hello123'
        };
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

    test ('4.1 Successfully updated', async () => {
        try {
            const body = JSON.stringify(sendBody);
            const res = await axios.put(`http://localhost:3002/user-contact-details`, body, config);

            expect (res.status).toBe(201);
            expect (res.data.msg).toBe('Account updated.');

        } catch (err) {
            console.error (err);
            expect(1).toBe(20);
        }

    }, millisecondTimeout);

});

//
// test that contact details can be deleted
//
describe ( '5. Delete Contact Details', () => {

    let config;
    let sendBody;

    beforeAll ( ()=> {
        axios.defaults.headers.common['X-Auth-Token'] = `${user_token_4}`;
    })

    beforeEach ( () => {
        sendBody = { 	
        };
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

    test ('5.1 Successfully deleted', async () => {
        try {
            const body = JSON.stringify(sendBody);
            const res = await axios.delete(`http://localhost:3002/user-contact-details`, body, config);

            expect (res.status).toBe(201);
            expect (res.data.msg).toBe('User contact details deleted.');

        } catch (err) {
            console.error (err);
            expect(1).toBe(20);
        }

    }, millisecondTimeout);

});

