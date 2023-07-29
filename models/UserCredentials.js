const COLLECTION_NAME = 'user_credentials';
var ObjectId = require('mongodb').ObjectId;
const  moment  = require('moment');

exports.getByUser_id = async function (user_id, options = null) {
    // console.log('In getByUser_id');
    // console.log('user_id: ' + user_id);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            user_id: user_id,
            expiration_date :{ $gte :moment.parseZone(new Date()).utcOffset("+05:30")._d },
        };
        // console.log('query: ' + JSON.stringify(query));

        if (options === null) {
            options = {
                
                projection: {
                    expiration_date:0,
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

exports.getById = async function (id, options = null) {
    // console.log('In getById');
    // console.log('id: ' + id);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            _id: new ObjectId(id),
            expiration_date :{ $gte :moment.parseZone(new Date()).utcOffset("+05:30")._d },

        };
        // console.log('query: ' + JSON.stringify(query));

        if (options === null) {
            options = {
                projection: {
                    expiration_date:0,
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
    // console.log('In create');
    // console.log('input: ' + JSON.stringify(input));

    var now = moment.parseZone(new Date()).utcOffset("+05:30")._d;
    console.log("now"+now);
    console.log("now year"+now.getFullYear());
    var year = now.getFullYear();
    var month = now.getMonth();
    var day = now.getDate();
    var year_after = moment.parseZone(new Date(year + 1, month, day)).utcOffset("+05:30")._d ;
    console.log("now year_after"+year_after);

    input.expiration_date = year_after;
    input.created_date = now;
    input.modified_date = now;

    try {
        var data = await myDB.collection(COLLECTION_NAME).insertOne(input);
        // console.log("data: " + JSON.stringify(data));

        input._id = data.insertedId;
        return input;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}
exports.expire = async function (input) {
    // console.log('In expire');
    //console.log('input: ' + JSON.stringify(input));

    var now = moment.parseZone(new Date()).utcOffset("+05:30")._d;
    
    try {
        const query = {
            user_id: new ObjectId(input.user_id),
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