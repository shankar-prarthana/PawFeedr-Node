const COLLECTION_NAME = 'pets';
var ObjectId = require('mongodb').ObjectId;

exports.getByUserId = async function (user_id, options = null) {
    // console.log('In getByUserId');
    // console.log('user_id: ' + user_id);
   // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            user_id: new ObjectId(user_id),
            is_active: true,
        };
        // console.log('query: ' + JSON.stringify(query));

        if (options === null) {
            options = {
                sort: {
                    name: 1,
                },
                projection: {
                    is_active: 0,
                    creation_date: 0,
                    modified_date: 0,
                    operator_id: 0,
                },
            };
        }
        console.log('options: ' + JSON.stringify(options));

        var data = await myDB.collection(COLLECTION_NAME).findOne(query, options);
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
            _id: new ObjectId(id),
            is_active : true, 
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
    // console.log('In create');
    // console.log('input: ' + JSON.stringify(input));

    var now = new Date();
    input.created_date = now;
    input.modified_date = now;
    input.is_active = true;


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

exports.update = async function (_id,input) {
    console.log('In create');
    console.log('input: ' + JSON.stringify(input));

    input.modified_date = new Date();
    try {
        const query = {
            _id: new ObjectId(_id),
        };
        const newset = {
            $set: input,
        };
        //console.log('newset: ' + JSON.stringify(newset));

        var data = await myDB.collection(COLLECTION_NAME).findOneAndUpdate(query, newset, { returnOriginal: false });
        //console.log("data: " + JSON.stringify(data));

        return data.value
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}
