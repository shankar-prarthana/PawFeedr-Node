const COLLECTION_NAME = 'ref_pet_type';
var ObjectId = require('mongodb').ObjectId;

exports.getAll = async function (options = null) {
    // console.log('In getAll');
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
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
        // console.log('options: ' + JSON.stringify(options));

        var data = await myDB.collection(COLLECTION_NAME).find(query, options).toArray();
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

exports.getByCode = async function (code, options = null) {
    // console.log('In getByCode');
    // console.log('code: ' + code);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            code: code,
            is_active: true,

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
