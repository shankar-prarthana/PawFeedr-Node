const COLLECTION_NAME = 'pet_bowl_weight';

var ObjectId = require('mongodb').ObjectId;
const  moment  = require('moment');

//UsersSessions_getByUser_id function

exports.getLastBowlWeightByPetId = async function (pet_id,  options = null) {
    // console.log('In getLastBowlWeightByPetId');
    // console.log('pet_id: ' + pet_id);
    // console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            pet_id: new ObjectId(pet_id),
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
            expiration_date :{ $gte : moment.parseZone(new Date()).utcOffset("+05:30")._d },


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
     console.log('In createPetBowlWeight');
     console.log('input: ' + JSON.stringify(input));

    // console.log('sessionType: ' + JSON.stringify(sessionType));

        var expire_input = { pet_id:new ObjectId(input.pet_id)}
        await this.expire(expire_input);
    

    var now = moment.parseZone(new Date()).utcOffset("+05:30")._d;
    var expiryDate = new Date(now.getTime() + 15 * 60 * 1000);

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
     console.log('In expire');
    console.log('input: ' + JSON.stringify(input));

    var now = moment.parseZone(new Date()).utcOffset("+05:30")._d;
    
    try {
        const query = {
            pet_id: new ObjectId(input.pet_id),
        };
        console.log('query: ' + JSON.stringify(query));

        const newset = {
            $set: {
                expiration_date: now,
                modified_date: now,
                operator_id:"expire"
            },
        };
        console.log('newset: ' + JSON.stringify(newset));

        var data = await myDB.collection(COLLECTION_NAME).updateMany(query, newset, { returnOriginal: false });
       console.log("data: " + JSON.stringify(data));

        return data.value;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }

}