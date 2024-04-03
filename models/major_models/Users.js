const COLLECTION_NAME = 'user';
var ObjectId = require('mongodb').ObjectId;
const  moment  = require('moment');
exports.getByMobile = async function (mobile, options = null) {
    try {
        const query = {
            mobile: mobile, is_deleted: false,
        };
        if (options === null) {
            options = {
                sort: {
                    name: 1,
                },
                projection: {
                    is_active: 0, creation_date: 0, modified_date: 0, operator_id: 0,
                },
            };
        }
        var data = await myDBMajor.collection(COLLECTION_NAME).findOne(query, options);
        return data;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}
exports.getByUsername = async function (username, options = null) {
    try {
        const query = {
            username: username, is_deleted: false,
        };
        if (options === null) {
            options = {
                sort: {
                    name: 1,
                },
                projection: {
                    is_active: 0, creation_date: 0, modified_date: 0, operator_id: 0,
                },
            };
        }
        var data = await myDBMajor.collection(COLLECTION_NAME).findOne(query, options);
        return data;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}
exports.getAllUsersByOwner_id = async function (owner_id,options=null) {
    // console.log('In getAllCountries');
    try {
        const query = {
            is_deleted: false,
            owner_id: new ObjectId(owner_id),
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
            is_deleted:false,
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

        var data = await myDBMajor.collection(COLLECTION_NAME).findOne(query, options);
        // console.log("data: " + JSON.stringify(data));

        return data;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}

exports.getByEmail = async function (email, options = null) {
    // console.log('In getByEmail');
    // console.log('email: ' + email);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            email: email,
            is_deleted: false,
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
    input.is_locked = false;
    input.unsuccessful_attempts = 0;
    input.last_login_attempt = null;
    input.is_email_validated = false;
    input.is_deleted = false;


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
            is_deleted:false,
        };
        const newset = {
            $set: input,
        };
        //console.log('newset: ' + JSON.stringify(newset));

        var data = await myDBMajor.collection(COLLECTION_NAME).findOneAndUpdate(query, newset, { returnOriginal: false });
        //console.log("data: " + JSON.stringify(data));

        return data.value
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}
