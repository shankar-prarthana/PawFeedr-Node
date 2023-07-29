const COLLECTION_NAME = 'in_app_messages';

var ObjectId = require('mongodb').ObjectId;
const  moment  = require('moment');

//UsersSessions_getByUser_id function

exports.getByUserDeviceIdNotficationTypeId = async function (user_device_id,notfication_type_id, options = null) {
    // console.log('In getByUserDeviceId');
    // console.log('user_device_id: ' + user_device_id);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            user_device_id: new ObjectId(user_device_id),
            notfication_type_id: new ObjectId(notfication_type_id),
            expiration_date: { $gte: moment.parseZone(new Date()).utcOffset("+05:30")._d },
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
//UsersSessions_getById function
exports.getById = async function (_id, options = null) {
    // console.log('In getById');
    // console.log('_id: ' + id);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            _id: new ObjectId(_id),
            expiration_date: { $gte:moment.parseZone(new Date()).utcOffset("+05:30")._d },


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

   
    var now = moment.parseZone(new Date()).utcOffset("+05:30")._d;
    var expiry = moment.parseZone(new Date()).utcOffset("+05:30")._d;
    expiry.setMinutes(expiry.getMinutes() + 15);
     console.log('now: ' + now);
     console.log('expiry: ' + expiry);


    input = {
        ...input,
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

