'use strict';
const validator = require ('validator');

const validationFns = () => {

    // 
    // Function : stringBreakdown
    //
    // This function takes a string 
    //
    // ReturnValues :
    //  True        The username is valid
    //  False       The username is invalid
    //  
    const stringBreakdown = userStr => {
        let noDigits = 0;
        let noUppercase = 0;
        let noLowercase = 0;
        let noSpecial = 0;
        let incorrectChar = false;
        let strLen = userStr.length;

        for ( let letter of userStr ) {
            if  ( letter >= '0' && letter <= '9' ) noDigits++;
            else if ( letter >= 'A' && letter <= 'Z' ) noUppercase++;
            else if ( letter >= 'a' && letter <= 'z' ) noLowercase++;
            else if (
                //  ! # $ % & ' * + - / = ? ^ _ ` { | } ~ .   ( ) , : ; < > @ [ \ ]
                letter === '!' ||
                letter === '#' ||
                letter === '$' ||
                letter === '%' ||
                letter === '&' ||
                letter === "'" ||
                letter === '*' ||
                letter === '+' ||
                letter === '-' ||
                letter === '/' ||
                letter === '=' ||
                letter === '?' ||
                letter === '^' ||
                letter === '_' ||
                letter === '`' ||
                letter === '{' ||
                letter === '|' ||
                letter === '}' ||
                letter === '~' ||
                letter === '.' ||
                letter === ' ' ||
                letter === '(' ||
                letter === ')' ||
                letter === ',' ||
                letter === ':' ||
                letter === ';' ||
                letter === '<' ||
                letter === '>' ||
                letter === '@' ||
                letter === '[' ||
                letter === '\\' ||
                letter === ']'
            ) noSpecial++;
            else incorrectChar = true;
        }

        return {
            strLen,
            noDigits,
            noUppercase,
            noLowercase,
            noSpecial,
            incorrectChar
        }
    }


    // 
    // Function : validateUsername
    //
    // Checks whether the username is correctly formated
    //
    // ReturnValues :
    //  True        The username is valid
    //  False       The username is invalid
    //  
    const validateUsername = username => {

        const { strLen, incorrectChar } = stringBreakdown(username);

        if ( strLen < 6 || strLen > 30 || incorrectChar ) {
            return false;
        }

        return true;
    }

    // 
    // Function : validateEmail
    //
    // Checks whether the email is correctly formated
    //
    // ReturnValues :
    //  True        The email is valid
    //  False       The email is invalid
    //  
    const validateEmail = email => {
        return ( email === undefined? false: validator.isEmail(email));
    }

    // 
    // Function : validatePassword
    //
    // Checks whether the password is correctly formated
    //
    // ReturnValues :
    //  True        The password is valid
    //  False       The password is invalid
    //  
    const validatePassword = pwd => {
        if (!pwd) return false;

        const { strLen, noDigits, incorrectChar } = stringBreakdown(pwd);

        if ( strLen < 6 || strLen > 20 || noDigits === 0 || incorrectChar ) {
            return false;
        }
        return true;
    }

    // 
    // Function : validatePassword
    //
    // Checks whether the password is correctly formated
    // 
    // user type is 1 - 3 (tutor / parent / student)
    //
    // ReturnValues :
    //  True        The password is valid
    //  False       The password is invalid
    //  
    const validateUserType = type => {
        if (!type) return false;

        if ( type >= 1 && type <= 3) return true;

        return false;
    }

    // 
    // Function : validateTitle
    //
    // Checks whether the title is correctly formated
    //  https://en.wikipedia.org/wiki/Title
    //
    // ReturnValues :
    //  True        The title is valid
    //  False       The title is invalid
    //  
    const validateTitle = title => {

        const TITLES = [ 'mr', 'mrs', 'mx', 'ms', 'miss', 'dr', 'prof', 'doc' ];
        if ( title === undefined ) {
            return { valid: false, msg: 'Title is not set.' };
        } else if (TITLES.includes(title.toLowerCase())) {
            return { valid: true };
        }

        return { valid: false, msg: 'Title is not a valid title.' };;
    }

    // 
    // Function : validateFirstname
    //
    // Checks whether the firstname is correctly formated
    //
    // ReturnValues :
    //  True        The firstname is valid
    //  False       The firstname is invalid
    //  
    const validateFirstname = firstname => {
        if ( firstname === undefined ) {
            return { valid: false, msg: 'First name is not set.' };
        } else if ( firstname.length < 2 ) {
            return { valid: false, msg: 'First name must be at least 2 characters long.' };
        } else if ( firstname.length > 50 ) {
            return { valid: false, msg: 'First name must be less than 50 characters.' };
        }

        return { valid: true};
    }

    // 
    // Function : validateLastname
    //
    // Checks whether the lastname is correctly formated
    //
    // ReturnValues :
    //  True        The lastname is valid
    //  False       The lastname is invalid
    //  
    const validateLastname = lastname => {

        if ( lastname === undefined ) {
            return { valid: false, msg: 'Last name is not set.' };
        } else if ( lastname.length < 2 ) {
            return { valid: false, msg: 'Last name must be at least 2 characters long.' };
        } else if ( lastname.length > 50 ) {
            return { valid: false, msg: 'Last name must be less than 50 characters.' };
        }

        return { valid: true };
    }

    // 
    // Function : validateGender
    //
    // Checks whether a valid gender is entered
    //
    // ReturnValues :
    //  True        The gender is valid
    //  False       The gender is invalid
    //  
    const validateGender = gender => {

        if ( gender === undefined ) {
            return { valid: false, msg: 'Gender is not set.' };
        } else if ( gender !== 'M' && gender !== 'F' ){
            return { valid: false, msg: 'Enter a valid gender ( M / F ).' };
        }

        return { valid: true };
    }

    // 
    // Function : validateAddress1
    //
    // Checks whether the first line of the address is valid
    //
    // ReturnValues :
    //  True        The addr1 is valid
    //  False       The addr1 is invalid
    //  
    const validateAddress1 = addr1 => {

        if ( addr1 === undefined ) {
            return { valid: false, msg: 'The first line of your address needs to entered.' };
        } else if (addr1.length < 2) {
            return { valid: false, msg: 'The address must be at least 2 characters long.' };
        } else if ( addr1.length > 80 ) {
            return { valid: false, msg: 'The address must be less than 80 characters.' };
        }

        return { valid: true };
    }

    // 
    // Function : validateAddress2
    //
    // Checks whether the second line of the address is valid
    //
    // ReturnValues :
    //  True        The addr2 is valid
    //  False       The addr2 is invalid
    //  
    const validateAddress2 = addr2 => {

        if ( addr2.length > 80 ) {
            return { valid: false, msg: 'The address must be less than 80 characters.' };
        }

        return { valid: true };
    }

    // 
    // Function : validateTown
    //
    // Checks whether the town of the address is valid
    //
    // ReturnValues :
    //  True        The town is valid
    //  False       The town is invalid
    //  
    const validateTown = town => {

        if ( town === undefined ) {
            return { valid: false, msg: 'Your town needs to entered.' };
        } else if (town.length < 2) {
            return { valid: false, msg: 'A valid town needs to be entered.' };
        } else if ( town.length > 80 ) {
            return { valid: false, msg: 'The town must be less than 80 characters.' };
        }

        return { valid: true };
    }

    // 
    // Function : validateCounty
    //
    // Checks whether the county is valid
    //
    // ReturnValues :
    //  True        The county is valid
    //  False       The county is invalid
    //  
    const validateCounty = county => {

        if ( county === undefined ) {
            return { valid: false, msg: 'Your county needs to entered.' };
        } else if (county.length < 2) {
            return { valid: false, msg: 'The county must be at least 2 characters long.' };
        } else if ( county.length > 80 ) {
            return { valid: false, msg: 'Your county must be less than 80 characters.' };
        }

        return { valid: true };
    }

    // 
    // Function : validatePostcode
    //
    // Checks whether the postcode is valid
    //
    // ReturnValues :
    //  True        The postcode is valid
    //  False       The postcode is invalid
    //  
    const validatePostcode = postcode => {

        if ( postcode.length > 11 ) {
            return { valid: false, msg: 'Your postcode must be less than 11 characters.' };
        }

        return { valid: true };
    }

    //
    // Function : validateCountry
    //
    // Checks whether the country is valid
    //
    // ReturnValues :
    //  True        The phone is valid
    //  False       The phone is invalid
    //  
    const validateCountry = country => {

        if ( country === undefined ) {
            return { valid: false, msg: 'You must enter a valid country.' };
        } else if (country.length < 2) {
            return { valid: false, msg: 'You must enter a valid country.' };
        } else if ( country.length > 80 ) {
            return { valid: false, msg: 'Your country must be less than 80 characters.' };
        }

        return { valid: true };
    }


    // 
    // Function : validatePhone
    //
    // Checks whether the phone number is valid
    //
    // ReturnValues :
    //  True        The phone is valid
    //  False       The phone is invalid
    //  
    const validatePhone = phone => {

        if ( phone.length > 20 ) {
            return { valid: false, msg: 'Your phone number must be less than 20 characters.' };
        }

        return { valid: true };
    }

    // 
    // Function : validateMobile
    //
    // Checks whether the mobile number is valid
    //
    // ReturnValues :
    //  True        The mobile is valid
    //  False       The mobile is invalid
    //  
    const validateMobile = mobile => {

        if ( mobile.length > 20 ) {
            return { valid: false, msg: 'Your mobile must be less than 20 characters.' };
        }

        return { valid: true };
    }


    // 
    // These are the functions we are exposing from the database closure
    // 
    return {
        validateUsername,
        validateEmail,
        validatePassword,
        validateUserType,
        validateTitle,
        validateFirstname,
        validateLastname,
        validateGender,
        validateAddress1,
        validateAddress2,
        validateTown,
        validateCounty,
        validatePostcode,
        validateCountry,
        validatePhone,
        validateMobile
    };
}

module.exports.validationFns = validationFns;
