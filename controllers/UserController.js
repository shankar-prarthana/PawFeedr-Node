var UserService = require('../models/Users');
var UserCredentialService = require('../models/UserCredentials');
var RefSessionTypesService = require('../models/refSessionTypes');
var UserSessionServices = require('../models/UserSessions');
var RefOTPTypesService = require('../models/refOTPTypes');
var RefNotificationTypesService = require('../models/refNotificationTypes');
var MobileOTPsService = require('../models/MobileOTPs');
var MobileMessagesService = require('../models/MobileMessages');
var UserDeviceTokensService = require('../models/UserDeviceTokens')
var InAppMessagesServices = require('../models/InAppMessages')
var TeleSignSDK = require('telesignsdk');


const crypto = require('crypto');
const { Timestamp } = require('mongodb');
var genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};

var sha512 = function (password, salt) {
    var hash = crypto.createHmac('sha512', password + salt); /** Hashing algorithm sha512 */
    console.log("hash" + hash);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

sendOTPSMS = async function (input) {
    const phoneNumber = "+91" + input.mobile;
    const mobile = input.mobile;
    const accountSid = 'ACe0a74a4f8fac5352c07ef03e229fe295';
    const authToken = 'ba10636447d8d7d564657e8a9f0acde9';
    const from = '+14302435070'
    const client = require('twilio')(accountSid, authToken);
    const notificationTypeCode = input.notificationTypeCode
    var op = input.operator_id



    var notificationType = await RefNotificationTypesService.getByCode(notificationTypeCode);
    if (notificationType == null) {
        return res.status(200).send({ status: 403, message: 'notificationType error' });
    }

    var existingMobileOTP = await MobileOTPsService.getByMobileNotificationTypeId(mobile, notificationType._id);

    if (existingMobileOTP !== null) {

        console.log("existingMobileOTP: " + JSON.stringify(existingMobileOTP));

        await MobileOTPsService.expire(existingMobileOTP);
    }
    var newMobileOTP = {
        mobile: mobile,
        notfication_type_id: notificationType._id,
        operator_id: op,
    };
    console.log('newMobileOTP: ' + JSON.stringify(newMobileOTP));
    var newMobileOTP = await MobileOTPsService.create(newMobileOTP);
    console.log('newMobileOTP: ' + JSON.stringify(newMobileOTP));


    var otpType = await RefOTPTypesService.getByCode("VALIDATION_OTP");
    if (otpType == null) {
        return res.status(200).send({ status: 403, message: 'otpType error' });
    }



    var expiry = new Date(newMobileOTP.expiration_date);
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    };

    expiry = expiry.toLocaleString('en-US', options);

    const message = notificationType.message
        .replace("${otp}", newMobileOTP.otp)
        .replace("${expiration_minutes}", otpType.expiration_interval)
        .replace("${expiration_date}", expiry);

    console.log("MESSAGE: " + message);
    var newMobileMessage = {
        message: message,
        notfication_type_id: notificationType._id,
        operator_id: op,
    };
    var newMobileMessage = await MobileMessagesService.create(newMobileMessage);
    console.log('newMobileMessage: ' + JSON.stringify(newMobileMessage));



    // client.messages
    //     .create({
    //         body: message,
    //         from: from,
    //         to: phoneNumber
    //     })
    //     .then(message => console.log(message.sid))
}
exports.validateMobileNumber = async function (req, res, next) {
    // console.log('In signupUser');
    console.log('req.body: ' + JSON.stringify(req.body));
    const mobile = parseInt(req.body.mobile)
    if (mobile == null) {
        //console.log("mobile:"+mobile+"email:"+req.body.email+"name:"+req.body.name+"pa    ssword:"+req.body.password);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }

    var existingUser = await UserService.getByMobile(mobile);
    if (existingUser !== null) {
        return res.status(200).send({ status: 403, message: 'Mobile number is already in use.' });
    }
    var input = {
        mobile: mobile,
        notificationTypeCode: "SIGNUP_VALIDATION_OTP",
        operator_id: "validateMobileNumber",
    };
    sendOTPSMS(input);

    return res.status(200).send({ status: "success", message: "OTP Sent Succesdully!" });



}

exports.verifyOTP = async function (req, res, next) {
    // console.log('In signupUser');
    const mobile = parseInt(req.body.mobile)

    console.log('req.body: ' + JSON.stringify(req.body));
    if (mobile == null || req.body.otp == null || req.body.notificationTypeCode == null) {
        console.log("mobile:" + mobile + "otp:" + req.body.otp);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var notificationType = await RefNotificationTypesService.getByCode((req.body.notificationTypeCode).toString);
    if (notificationType == null) {
        return res.status(200).send({ status: 403, message: 'Incorrect notificationTypeCode' });
    }


    var mobileOtp = await MobileOTPsService.getByMobileNotificationTypeId(mobile, notificationType._id);
    if (mobileOtp == null) {
        return res.status(200).send({ status: 403, message: 'Resend OTP and try again' });
    }

    if (mobileOtp.otp.toString !== req.body.otp.toString) {
        //  console.log('PRINT 1 '+(mobileOtp.otp!==req.body.otp.toString)+" mobileOtp: "+mobileOtp.otp+"req.body.otp: "+req.body.otp);
        return res.status(200).send({ status: 403, message: "OTP invalid enter correct OTP and try again" });

    }

    await MobileOTPsService.expire(mobileOtp);
    return res.status(200).send({ status: "success", message: "Mobile validated Successfully" });



}

exports.resetPasswordValidation = async function (req, res, next) {
    // console.log('In sendValidationOTP');
    console.log('req.body: ' + JSON.stringify(req.body));
    const mobile = parseInt(req.body.mobile)
    if (mobile == null) {
        //console.log("mobile:"+mobile+"email:"+req.body.email+"name:"+req.body.name+"password:"+req.body.password);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }

    var existingUser = await UserService.getByMobile(mobile);
    if (existingUser == null) {
        return res.status(200).send({ status: 403, message: 'Mobile number not asscoiated with any account.' });
    }
    var input = {
        mobile: mobile,
        notificationTypeCode: "RESET_PASSWORD_OTP",
        operator_id: "resetPasswordValidation",
    };
    sendOTPSMS(input);

    return res.status(200).send({ status: "success", message: "OTP Sent Succesdully!" });


}






exports.signupUser = async function (req, res, next) {
    // console.log('In signupUser');
    const mobile = parseInt(req.body.mobile)

    console.log('req.body: ' + JSON.stringify(req.body));
    if (mobile == null || req.body.name == null || req.body.password == null || req.body.mobile_validated !== true) {
        //console.log("mobile:"+mobile+"email:"+req.body.email+"name:"+req.body.name+"password:"+req.body.password);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }

    var existingUser = await UserService.getByMobile(mobile);
    if (existingUser !== null) {
        return res.status(200).send({ status: 403, message: 'Mobile number is already in use.' });
    }



    if (req.body.email !== '') {
        existingUser = await UserService.getByEmail(req.body.email);
        if (existingUser !== null) {
            return res.status(200).send({ status: 403, message: 'Email address is already in use.' });
        }
    }


    console.log("password2" + req.body.password)
    var userpassword = req.body.password;
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(userpassword, salt);
    console.log('UserPassword = ' + userpassword);
    console.log('Passwordhash = ' + passwordData.passwordHash);
    console.log('\nSalt = ' + passwordData.salt);
    var credential = { salt: passwordData.salt, hash: passwordData.passwordHash };
    var newUser = {
        name: req.body.name,
        mobile: mobile,
        email: (req.body.email === "") ? null : req.body.email,
        is_mobile_validated: true,
        operator_id: 'signupUser',
    };
    console.log('newUser: ' + JSON.stringify(newUser));

    var newUser = await UserService.create(newUser);
    console.log('newUser: ' + JSON.stringify(newUser));



    var newUserCredential = {
        user_id: newUser._id,
        credential: credential,
        operator_id: 'signupUser',
    };

    var newUserCredential = await UserCredentialService.create(newUserCredential);
    console.log('newUserCredential: ' + JSON.stringify(newUserCredential));
    return res.status(200).send({ status: "success", user: newUser, message: "Signup successful!" });


}

exports.resetPassword = async function (req, res, next) {
    // console.log('In resetPassword');
    const mobile = parseInt(req.body.mobile)

    console.log('req.body: ' + JSON.stringify(req.body));
    if (mobile == null || req.body.password == null || req.body.mobile_validated !== true) {
        //console.log("mobile:"+mobile+"password:"+req.body.password);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }

    var existingUser = await UserService.getByMobile(mobile);
    if (existingUser == null) {
        return res.status(200).send({ status: 403, message: 'Mobile number does not exist' });
    }

    console.log("password2" + req.body.password)
    var userpassword = req.body.password;
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(userpassword, salt);
    console.log('UserPassword = ' + userpassword);
    console.log('Passwordhash = ' + passwordData.passwordHash);
    console.log('\nSalt = ' + passwordData.salt);
    var credential = { salt: passwordData.salt, hash: passwordData.passwordHash };


    var existingUserCredential = await UserCredentialService.getByUser_id(existingUser._id);
    if (existingUserCredential == null) {
        return res.status(200).send({ status: 403, message: 'existingUserCredential error' });

    }
    await UserCredentialService.expire(existingUserCredential)



    var newUserCredential = {
        user_id: existingUser._id,
        credential: credential,
        operator_id: 'signupUser',
    };

    var newUserCredential = await UserCredentialService.create(newUserCredential);
    console.log('newUserCredential: ' + JSON.stringify(newUserCredential));
    return res.status(200).send({ status: "success", newUserCredential: newUserCredential });


}





exports.loginUser = async function (req, res, next) {
    // console.log('In loginUser');
    const mobile = parseInt(req.body.mobile)

    console.log('req.body: ' + JSON.stringify(req.body));
    if ((mobile == null && req.body.email == null) || req.body.password == null) {

        console.log("mobile:" + mobile + "email:" + req.body.email + "password:" + req.body.password);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var existingUser
    if (req.body.email == null) {
        existingUser = await UserService.getByMobile(mobile);

        if (existingUser == null) {
            return res.status(200).send({ status: 403, message: 'User with this mobile number does not exist' });
        }

    }
    else {
        existingUser = await UserService.getByEmail(req.body.email);
        if (existingUser == null) {
            return res.status(200).send({ status: 403, message: 'User with this email address does not exist' });
        }

    }


    if (existingUser.is_locked) {
        return res.status(200).send({ status: 403, message: 'User Account has been locked please try again after some time.' });

    }
    existingUserCredential = await UserCredentialService.getByUser_id(existingUser._id);
    if (existingUserCredential == null) {
        return res.status(200).send({ status: 403, message: 'Password seems to have expired please reset your password.' });
    }


    var sha512 = function (password, salt) {
        var hash = crypto.createHmac('sha512', password + salt); /** Hashing algorithm sha512 */
        console.log("hash" + hash);
        var value = hash.digest('hex');
        return {
            salt: salt,
            passwordHash: value
        };
    };

    var userpassword = req.body.password;
    console.log("existing user cred:" + JSON.stringify(existingUserCredential));
    var salt = existingUserCredential.credential.salt;
    var hash = existingUserCredential.credential.hash;

    var passwordData = sha512(userpassword, salt);
    console.log(sha512(userpassword, salt));

    console.log('UserPassword = ' + userpassword);
    console.log('Passwordhash = ' + passwordData.passwordHash);
    console.log('\nSalt = ' + passwordData.salt);
    var failed_attempts = existingUser.unsuccessful_attempts;
    var is_wrong = false;
    var is_locked = false;
    if (passwordData.passwordHash != hash) {
        is_wrong = true;

        failed_attempts++;

        if (existingUser.unsuccessful_attempts >= 4) {
            is_locked = true;

        }

    }

    var updateUser = {
        unsuccessful_attempts: failed_attempts,
        is_locked: is_locked,
        last_login_attempt: new Date(),
        operator_id: 'loginUser',
    };
    var updateUser = await UserService.update(existingUser._id, updateUser);

    if (is_locked) {
        return res.status(200).send({ status: 403, message: 'Incorrect password, too many unsuccessful_attempts pelase try again after 30 minutes. ' });
    }
    console.log("is wrong: " + is_wrong);
    if (is_wrong) {
        return res.status(200).send({ status: 403, message: 'Incorrect password' });
    }


    //check existing session


    var token = genRandomString(25);
    var sessionType = await RefSessionTypesService.getByCode('LOGIN');
    if (sessionType == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
    }

    var existingUserSession = await UserSessionServices.getByUserIdSessionTypeId(existingUser._id, sessionType._id);
    if (existingUserSession !== null) {
        await UserSessionServices.expire(existingUserSession)
    }
    var newUserSession = {
        user_id: existingUser._id,
        token: token,
        session_type_id: sessionType._id,
        operator_id: 'loginUser',
    };

    var newUserSession = await UserSessionServices.create(newUserSession);
    console.log('newUserSession: ' + JSON.stringify(newUserSession));
    return res.status(200).send({ status: "success", user_session: newUserSession, user: updateUser, message: "Welcome back " + updateUser.name });


}

exports.getExistingSession = async function (req, res, next) {
    // console.log('In loginUser');
    console.log('req.body: ' + JSON.stringify(req.body));
    if ((req.body.user_id == null)) {

        console.log("user_id:" + req.body.user_id);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }

    var sessionType = await RefSessionTypesService.getByCode('LOGIN');
    if (sessionType == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
    }
    var existingUser = await UserService.getById(req.body.user_id);
    if (existingUser == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
    }

    var existingUserSession = await UserSessionServices.getByUserIdSessionTypeId(existingUser._id, sessionType._id);
    if (existingUserSession == null) {
        return res.status(200).send({ status: 403, message: 'No session found' });
    }
    return res.status(200).send({ status: "success", user_session: existingUserSession });


}

exports.saveUserDeviceToken = async function (req, res, next) {
    // console.log('In saveDeviceCode');
    console.log('req.body: ' + JSON.stringify(req.body));
    if ((req.body.user_id == null) || (req.body.device_token == null)) {

        console.log("user_id:" + req.body.user_id + "device_token:" + req.body.device_token);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var existingUser = await UserService.getById(req.body.user_id);
    if (existingUser == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
    }

    var newUserDeviceToken = {
        user_id: existingUser._id,
        device_token: req.body.device_token,
        operator_id: 'saveUserDeviceToken',
    };

    var newUserDeviceToken = await UserDeviceTokensService.create(newUserDeviceToken);
    console.log('newUserDeviceToken: ' + JSON.stringify(newUserDeviceToken));
    if (newUserDeviceToken == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
    }
    return res.status(200).send({ status: "success", user_device_token: newUserDeviceToken, message: "Saved user dvice successfully" });


}

exports.sendInAppNotification = async function (req, res, next) {
    console.log('req.body: ' + JSON.stringify(req.body));
    if ((req.body.user_id == null) || (req.body.notification_type_code == null)) {

        console.log("user_id:" + req.body.user_id + "notification_type_code:" + req.body.notification_type_code);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }

    var UserDeviceToken = await UserDeviceTokensService.getByUserId(req.body.user_id);
    if (UserDeviceToken == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
    }

    var NotificationType = await RefNotificationTypesService.getByCode(req.body.notification_type_code);
    if (NotificationType == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
    }




    const admin = require('firebase-admin');
    var serviceAccount = require("../env/paw-feedr.json");

    // Check if the app is already initialized
    if (admin.apps.length === 0) {
        // Initialize the Firebase Admin SDK
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    // Function to send a push notification
    async function sendPushNotification(message1) {
        try {
            const message = message1;

            const response = await admin.messaging().send(message);
            console.log('Successfully sent push notification:', response);
        } catch (error) {
            console.error('Error sending push notification:', error);
            return res.status(200).send({ status: 403, message: 'Error sending push notification:', error });

        }
    }


    var message = {
        token: UserDeviceToken.device_token,
        notification: {
            title: NotificationType.title,
            body: NotificationType.message,
        }
    };

    var newInAppMessage = {
        user_device_token_id: UserDeviceToken._id,
        notification_type_id: NotificationType._id,
        message: message,
        operator_id: 'sendInAppNotification'
    };

    var newInAppMessage = await InAppMessagesServices.create(newInAppMessage);
    if (newInAppMessage == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
    }
    console.log('newInAppMessage: ' + JSON.stringify(newInAppMessage))

    sendPushNotification(message);
    return res.status(200).send({ status: "success", in_app_message: newInAppMessage, message: "Saved user dvice successfully" });


}