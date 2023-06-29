const COLLECTION_NAME = 'mobile_otps';
var RefOTPTypesService = require('../models/refOTPTypes');

var ObjectId = require('mongodb').ObjectId;

//UsersSessions_getByUser_id function

exports.getByMobileNotificationTypeId = async function (mobile,notification_type_id, options = null) {
     console.log('In getByMobile');
    // console.log('mobile: ' + mobile);
    // console.log('options: ' + JSON.stringify(options));
    var currentDate = new Date();

    try {
        const query = {
            mobile: mobile,
            notification_type_id: new ObjectId(notification_type_id),
            expiration_date: { $gt: new Date() },       
         };
         console.log('query: ' + JSON.stringify(query));

        if (options === null) {
            options = {
                projection: {
                    creation_date: 0,
                    modified_date: 0,
                    operator_id: 0,
                },
            };
        }
        // console.log('options: ' + JSON.stringify(options));

        var data = await myDB.collection(COLLECTION_NAME).findOne(query, options);
        // console.log("data: " + JSON.stringify(data));

        return data;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}
//UsersSessions_getById function
exports.getById = async function (_id, options = null) {
    // console.log('In getById');
    // console.log('_id: ' + id);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            _id: new ObjectId(_id),
            expiration_date: { $gte: new Date() },

        };
        // console.log('query: ' + JSON.stringify(query));

        if (options === null) {
            options = {
                projection: {
                    creation_date: 0,
                    modified_date: 0,
                    operator_id: 0,
                },
            };
        }
        // console.log('options: ' + JSON.stringify(options));

        var data = await myDB.collection(COLLECTION_NAME).findOne(query, options);
        // console.log("data: " + JSON.stringify(data));

        return data;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}

//UsersSessions create table function

exports.create = async function (input) {
     console.log('In createOtp');
     console.log('input: ' + JSON.stringify(input));

    var otpType = await RefOTPTypesService.getByCode("VALIDATION_OTP");
     console.log('otpType: ' + JSON.stringify(otpType));

    function generateOTP(length) {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
          otp += digits.charAt(Math.floor(Math.random() * digits.length));
        }
        return otp;
      }
      const otp = generateOTP(otpType.length);

    var now = new Date();
    var expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + otpType.expiration_interval);
     console.log('now: ' + now);
     console.log('expiry: ' + expiry);


    input = {
        ...input,
        otp_type_id:otpType._id,
        otp:otp,
        expiration_date: expiry,
        creation_date: now,
        modified_date: now,
    }

    try {
       
        var data = await myDB.collection(COLLECTION_NAME).insertOne(input);
         console.log("data: " + JSON.stringify(data));

        input._id = data.insertedId;
        return input;
    }

    catch (e) {
        console.log(e);
        throw Error('Error')
    }
}

exports.expire = async function (input) {
     console.log('In expire');
    console.log('input: ' + JSON.stringify(input));

    var now = new Date();
    
    try {
        const query = {
            mobile: input.mobile
        };
        // console.log('query: ' + JSON.stringify(query));

        const newset = {
            $set: {
                expiration_date: now,
                modified_date: now,
            },
        };
        // console.log('newset: ' + JSON.stringify(newset));

        var data = await myDB.collection(COLLECTION_NAME).updateMany(query, newset, { returnOriginal: false });
       // console.log("data: " + JSON.stringify(data));

        return data.value;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }

}