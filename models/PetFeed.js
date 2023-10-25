const COLLECTION_NAME = 'pet_feeds';
var ObjectId = require('mongodb').ObjectId;
const  moment  = require('moment');

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
   const weekAgo = moment.parseZone(new Date()).utcOffset("+05:30")._d;
   weekAgo.setDate(weekAgo.getDate() - 7); 


   try {
    const query = {
        pet_schedule_id: new ObjectId(pet_schedule_id),
        modified_date: { $gte: weekAgo },
        status: { $nin: ['created', 'upcoming'] }
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
exports.getIncomplete = async function (pet_schedule_id, options = null) {
  console.log('In getIncomplete');
  console.log('pet_schedule_id: ' + pet_schedule_id);
 console.log('options: ' + JSON.stringify(options));
 const weekAgo = moment.parseZone(new Date()).utcOffset("+05:30")._d;
 weekAgo.setDate(weekAgo.getDate() - 7); 


 try {
  const query = {
      pet_schedule_id: new ObjectId(pet_schedule_id),
      modified_date: { $gte: weekAgo },
      status: { $nin: ['cancelled', 'expired'] }
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
exports.getTodayFeeds = async function (pet_schedule_id, options = null) {
    console.log('In getTodayFeeds');
    console.log('pet_schedule_id: ' + pet_schedule_id);
   console.log('options: ' + JSON.stringify(options));
   const today = moment.parseZone(new Date()).utcOffset("+05:30")._d;
   today.setUTCHours(0, 0, 0, 0);

   try {
    const query = {
        pet_schedule_id: new ObjectId(pet_schedule_id),
        schedule_time: {
            $gte: today,
            $lt: moment.parseZone(new Date(today.getTime() + 24 * 60 * 60 * 1000)).utcOffset("+05:30")._d   // Add 24 hours to get the end of the day
          }
        
      };
    
      
        console.log('query: ' + JSON.stringify(query));


       console.log('options: ' + JSON.stringify(options));

       var data = await myDB.collection(COLLECTION_NAME).aggregate([
        { $match: query },
        {
            $addFields: {
                sortField: {
                    $cond: {
                        if: { $eq: ['$status', 'cancelled'] },
                        then: 1,
                        else: 0
                    }
                }
            }
        },
        { $sort: { sortField: 1, schedule_time: 1 } },
        { $project: { sortField: 0 ,created_date: 0,modified_date:0,operator_id:0} },
        { $limit: 10 }
    ]).toArray();
       console.log("data: " + JSON.stringify(data));

       return data;
   } catch (e) {
       console.log(e);
       throw Error('Error')
   }
}

exports.getTodayFeedsNext = async function(pet_schedule_id, options = null) {
    console.log('In getTodayFeeds');
    console.log('pet_schedule_id: ' + pet_schedule_id);
    console.log('options: ' + JSON.stringify(options));
  
    const currentTime = moment.parseZone(new Date()).utcOffset("+05:30")._d;
  
    try {
      const query = {
        pet_schedule_id: new ObjectId(pet_schedule_id),
        schedule_time: {
          $gt: currentTime
        },
        status: {
          $nin: ['expired', 'completed', 'cancelled', 'failed']
        }
      };
  
      if (options === null) {
        options = {
          sort: {
            schedule_time: 1 // Sort by schedule_time in ascending order
          },
          projection: {
            creation_date: 0,
            modified_date: 0,
            operator_id: 0
          }
        };
      }
      options.limit = 1; // Limit the result to one document
      console.log('options: ' + JSON.stringify(options));
  
      const data = await myDB.collection(COLLECTION_NAME).findOne(query, options)
      console.log("data: " + JSON.stringify(data));
  
      return data;
    } catch (e) {
      console.log(e);
      throw Error('Error');
    }
  }

  exports.getTodayRemaining = async function(pet_schedule_id, options = null) {
    console.log('In getTodayFeeds');
    console.log('pet_schedule_id: ' + pet_schedule_id);
    console.log('options: ' + JSON.stringify(options));
  
    const currentTime = moment.parseZone(new Date()).utcOffset("+05:30")._d;
  
    try {
      const query = {
        pet_schedule_id: new ObjectId(pet_schedule_id),
        schedule_time: {
          $gt: currentTime
        },
        status: {
          $nin: ['expired', 'completed', 'cancelled', 'failed']
        }
      };
  
    
  
      const data = await myDB.collection(COLLECTION_NAME).aggregate([
        { $match: query },
        {
            $addFields: {
                sortField: {
                    $cond: {
                        if: { $eq: ['$status', 'cancelled'] },
                        then: 1,
                        else: 0
                    }
                }
            }
        },
        { $sort: { sortField: 1, schedule_time: 1 } },
        { $project: { sortField: 0 ,created_date: 0,modified_date:0,operator_id:0} },
        { $limit: 10 }
    ]).toArray();
      console.log("data: " + JSON.stringify(data));
  
      return data;
    } catch (e) {
      console.log(e);
      throw Error('Error');
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

    var now = moment.parseZone(new Date()).utcOffset("+05:30")._d;
    input.created_date = now;
    input.modified_date = now;
    input.previous_bowl_weight=0.0;
    input.final_bowl_weight=0.0;
    input.food_consumed = 0.0;
    input.feed_time= null;



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

    input.modified_date = moment.parseZone(new Date()).utcOffset("+05:30")._d;
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

