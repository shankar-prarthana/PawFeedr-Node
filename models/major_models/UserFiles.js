const COLLECTION_NAME = 'user_files';
var ObjectId = require('mongodb').ObjectId;
const  moment  = require('moment');

exports.getAllByUser_id = async function (user_id, options = null) {
    // console.log('In getAll');
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            user_id: new ObjectId(user_id),
            is_active:true,
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

        var data = await myDBMajor.collection(COLLECTION_NAME).find(query, options).toArray();
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
            is_active: true,

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

        var data = await myDBMajor.collection(COLLECTION_NAME).findOne(query, options);
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
   
    input.created_date = now;
    input.modified_date = now;
    input.is_active = true;

    try {
        var data = await myDBMajor.collection(COLLECTION_NAME).insertOne(input);
        // console.log("data: " + JSON.stringify(data));

        input._id = data.insertedId;
        return input;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}
exports.update = async function (_id,input) {
    console.log('In create');
    console.log('input: ' + JSON.stringify(input));

    input.modified_date = moment.parseZone(new Date()).utcOffset("+05:30")._d;
    try {
        const query = {
            _id: new ObjectId(_id),
        };
        const newset = {
            $set: input,
        };
        console.log('query: ' + JSON.stringify(query)); // Add this line
        console.log('newset: ' + JSON.stringify(newset)); // Add this line
        
        var data = await myDBMajor.collection(COLLECTION_NAME).findOneAndUpdate(query, newset, { returnOriginal: false });
        console.log("data: " + JSON.stringify(data));

        return data.value;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}