const COLLECTION_NAME = 'pet_feeds';
var ObjectId = require('mongodb').ObjectId;

exports.getUpcoming = async function (pet_schedule_id, options = null) {
     console.log('In getUpcoming');
     console.log('pet_schedule_id: ' + pet_schedule_id);
    console.log('options: ' + JSON.stringify(options));

    try {
        const query = {
            pet_schedule_id: new ObjectId(pet_schedule_id),
            status: 'upcoming'
                
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

        var data = await myDB.collection(COLLECTION_NAME).findOne(query, options);
        console.log("data: " + JSON.stringify(data));

        return data;
    } catch (e) {
        console.log(e);
        throw Error('Error')
    }
}
exports.getHistory = async function (pet_schedule_id, options = null) {
    console.log('In getHistory');
    console.log('pet_schedule_id: ' + pet_schedule_id);
   console.log('options: ' + JSON.stringify(options));
   const weekAgo = new Date();
   weekAgo.setDate(weekAgo.getDate() - 7); 
   try {
    const query = {
        pet_schedule_id: new ObjectId(pet_schedule_id),
        modified_date: { $gte: weekAgo },
        status: {
          $ne: 'created',
          $ne: 'upcoming'
        }
      };
    
      const pipeline = [
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$schedule_date'
              }
            },
            count: { $sum: 1 }
          }
        }
      ];
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

       const data = await myDB.collection(COLLECTION_NAME).aggregate(pipeline, options).toArray();
       console.log("data: " + JSON.stringify(data));

       return data;
   } catch (e) {
       console.log(e);
       throw Error('Error')
   }
}

exports.getTodayFeeds = async function (pet_schedule_id, options = null) {
    console.log('In getTodayFeeds');
    console.log('pet_schedule_id: ' + pet_schedule_id);
   console.log('options: ' + JSON.stringify(options));
   const today = new Date();
   today.setUTCHours(0, 0, 0, 0);

   try {
    const query = {
        pet_schedule_id: new ObjectId(pet_schedule_id),
        schedule_time: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours to get the end of the day
          },
          status: {
            $ne: 'expired'
          }
        
      };
    
      
        console.log('query: ' + JSON.stringify(query));

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

exports.getTodayFeedsNext = async function (pet_schedule_id, options = null) {
    console.log('In getTodayFeeds');
    console.log('pet_schedule_id: ' + pet_schedule_id);
   console.log('options: ' + JSON.stringify(options));
   const today = new Date();
   today.setUTCHours(0, 0, 0, 0);

   try {
    const query = {
        pet_schedule_id: new ObjectId(pet_schedule_id),
        schedule_time: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours to get the end of the day
          },
          status: {
            $ne: 'expired',
            $ne: 'completed',
            $ne: 'cancelled',
            $ne: 'failed'
          }
        
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
            _id: new ObjectId(id),
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

exports.create = async function (input) {
     console.log('In create');
    // console.log('input: ' + JSON.stringify(input));

    var now = new Date();
    input.created_date = now;
    input.modified_date = now;
    input.status = 'created';
    input.previous_bowl_weight=0.0;
    input.final_bowl_weight=0.0;
    input.food_consumed = 0.0;



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

