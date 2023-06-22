const COLLECTION_NAME = 'user_device_tokens';

var ObjectId = require('mongodb').ObjectId;

//UsersSessions_getByUser_id function

exports.getByUserId = async function (user_id, options = null) {
    // console.log('In getByUser_id');
    // console.log('user_id: ' + user_id);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            user_id: new ObjectId(user_id),
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
//UsersSessions_getById function
exports.getById = async function (_id, options = null) {
    // console.log('In getById');
    // console.log('_id: ' + id);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            _id: new ObjectId(_id),
            expiration_date :{ $gte : new Date() },


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
    // console.log('In createSession');
    // console.log('input: ' + JSON.stringify(input));

        var expire_input = {user_id:new ObjectId(input.user_id)}
        await this.expire(expire_input);
    

    var now = new Date();
    var expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);
    // console.log('now: ' + now);
    // console.log('expiry: ' + expiry);


    input = {
        ...input,
        expiration_date: expiry,
        creation_date: now,
        modified_date: now,
    }



    try {
       

        var data = await myDB.collection(COLLECTION_NAME).insertOne(input);
        // console.log("data: " + JSON.stringify(data));

        input._id = data.insertedId;
        return input;
    }

    catch (e) {
        console.log(e);
        throw Error('Error')
    }
}

exports.expire = async function (input) {
    // console.log('In create');
    //console.log('input: ' + JSON.stringify(input));

    var now = new Date();
    
    try {
        const query = {
            user_id: new ObjectId(input.user_id),
            session_type_id: new ObjectId(input.session_type_id)
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