const COLLECTION_NAME = 'user_notifications';
var ObjectId = require('mongodb').ObjectId;
const  moment  = require('moment');

exports.getAllByUserId = async function (user_id, options = null) {
    //  console.log('In getByUserId');
    // console.log('user_id: ' + user_id);
    //  console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            user_id: new ObjectId(user_id)
                };
        // console.log('query: ' + JSON.stringify(query));

        if (options === null) {
            options = {
                sort: {
                    name: 1,
                },
                projection: {
                    creation_date: 0,
                    modified_date: 0,
                    operator_id: 0,
                },
            };
        }
       // console.log('options: ' + JSON.stringify(options));
        var data1 = [];
        var data = await myDB.collection(COLLECTION_NAME).find(query, options).toArray();
        // console.log("data: " + JSON.stringify(data));
       data1=data;

        return data1;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}
exports.getAllOnForUserId = async function (user_id, options = null) {
    // console.log('In getByUserId');
    // console.log('user_id: ' + user_id);
   // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            user_id: new ObjectId(user_id),
            is_on: true
                };
        // console.log('query: ' + JSON.stringify(query));

        if (options === null) {
            options = {
                sort: {
                },
                projection: {
                    creation_date: 0,
                    modified_date: 0,
                    operator_id: 0,
                },
            };
        }
        console.log('options: ' + JSON.stringify(options));

        var data = await myDB.collection(COLLECTION_NAME).find(query, options).toArray();
        console.log("data: " + JSON.stringify(data));

        return data;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}
exports.getById = async function (id, options = null) {
    // console.log('In getById');
    // console.log('id: ' + id);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            _id: new ObjectId(id)
             };
        // console.log('query: ' + JSON.stringify(query));

        if (options === null) {
            options = {
                projection: {
                    is_active: 0,
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
exports.getByUserIdNotificationTypeId = async function (user_id,notification_type_id, options = null) {
    // console.log('In getByUserIdNotificationTypeId');
    // console.log('user_id: ' + user_id);
        // console.log('notification_type_id: ' + notification_type_id);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            user_id: new ObjectId(user_id),
            notification_type_id: new ObjectId(notification_type_id)
             };
        // console.log('query: ' + JSON.stringify(query));

        if (options === null) {
            options = {
                projection: {
                    is_active: 0,
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

exports.create = async function (input) {
     console.log('In create');
     console.log('input: ' + JSON.stringify(input));

    var now = moment.parseZone(new Date()).utcOffset("+05:30")._d;
    input.is_on = true;
    input.created_date = now;
    input.modified_date = now;
    input.is_active = true;


    try {
        var data = await myDB.collection(COLLECTION_NAME).insertOne(input);
         console.log("data: " + JSON.stringify(data));

        input._id = data.insertedId;
        return input;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}

exports.update = async function (_id,bool,input) {
    console.log('In create');
    console.log('input: ' + JSON.stringify(input));

    var now = moment.parseZone(new Date()).utcOffset("+05:30")._d;
    try {
        const query = {
            _id: new ObjectId(_id),
        };
        const newset = {
            is_on: bool,
            modified_date: now,
            operator_id:"changeNotificationSettings"
        };
        //console.log('newset: ' + JSON.stringify(newset));

        var data = await myDB.collection(COLLECTION_NAME).findOneAndUpdate(query, { $set: newset }, { returnOriginal: false });
        //console.log("data: " + JSON.stringify(data));

        return data.value
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}
