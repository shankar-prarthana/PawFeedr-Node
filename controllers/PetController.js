var RefPetTypesService = require('../models/RefPetTypes');
var RefPetSizeTypesService = require('../models/RefPetSizeTypes');
var RefAgeTypesService = require('../models/RefAgeTypes');
var RefActivityLevelTypesService = require('../models/RefActivityLevelTypes');
var RefFoodTypesService = require('../models/RefFoodTypes');
var PetsServices = require('../models/Pets');
var PetFoodAmountsService = require('../models/PetFoodAmounts');
var PetSchedulesServices = require('../models/PetSchedule');
var PetFeedServices = require('../models/PetFeed');
var UserSessionServices = require('../models/UserSessions');
var UserService = require('../models/Users');
const path = require('path');

// Assuming your `dog.py` file is located in the `assets` directory within the project
const fileDogPath = path.join(__dirname, '..', 'assets', 'dog.py');
const fileCatPath = path.join(__dirname, '..', 'assets', 'cat.py');


const { spawn } = require('child_process');

exports.addPet = async function (req, res, next) {
    // console.log('In addPet');
    console.log('req.body: ' + JSON.stringify(req.body));
    if ((req.body.token == null) || (req.body.name == null) || (req.body.petTypeCode == null) || (req.body.ageCode == null) || (req.body.gender == null) || (req.body.weight == null) || (req.body.petSizeCode == null) || (req.body.foodTypeCode == null)) {

        console.log("token:" + req.body.token + "name:" + req.body.name + "petTypeCode:" + req.body.petTypeCode + "ageCode:" + req.body.ageCode + "gender:" + req.body.gender + "weight:" + req.body.weight + "petSizeCode:" + req.body.petSizeCode + "foodTypeCode:" + req.body.foodTypeCode);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var userSession = await UserSessionServices.getByToken(req.body.token);
    if (userSession == null) {
        console.log("in userSession");
        return res.status(200).send({ status: 403, message: 'Your session has expired. Login again' });
    }

    var user = await UserService.getById(userSession.user_id);
    if (user == null) {
        console.log("in user");

        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var petType = await RefPetTypesService.getByCode(req.body.petTypeCode);
    if (petType == null) {
        console.log("in petType");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var petSizeType = await RefPetSizeTypesService.getByCodePetTypeId(req.body.petSizeCode, petType._id);
    if (petSizeType == null) {
        console.log("in petSizeType");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });

    }

    var ageType = await RefAgeTypesService.getByCode(req.body.ageCode);
    if (ageType == null) {
        console.log("in ageType");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }

    var foodType = await RefFoodTypesService.getByCode(req.body.foodTypeCode);
    if (foodType == null) {
        console.log("in foodType");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var activityLevelType = {}
    if (req.body.activityLevelTypeCode != null) {
         activityLevelType = await RefActivityLevelTypesService.getByCode(req.body.activityLevelTypeCode);
        if (activityLevelType == null) {
            console.log("in activityLevelType");
            return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
        }
    }

    var newPet = {
        user_id: user._id,
        pet_type_id: petType._id,
        pet_size_type_id: petSizeType._id,
        age_type_id: ageType._id,
        gender: req.body.gender,
        name: req.body.name,
        weight: req.body.weight,
        food_type_id: foodType._id,
        operator_id: 'addPet',

    };
    if (petType.code == "dog") {
        newPet.activity_level_type_id = activityLevelType._id;
    }

    var newPet = await PetsServices.create(newPet);
    console.log('newPet: ' + JSON.stringify(newPet));
    if (newPet == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
    }

    
    var pythonScript = null
    if (petType.code == "dog") {
        pythonScript = spawn('python3', [fileDogPath, req.body.petSizeCode, req.body.weight, req.body.activityLevelTypeCode, req.body.ageCode]);
    }
    else {
        pythonScript = spawn('python3', [fileCatPath, req.body.weight, req.body.ageCode]);
    }



var output = [];

// Function to convert an Uint8Array to a string
var uint8arrayToString = function(data){
    return String.fromCharCode.apply(null, data);
};



pythonScript.stdout.on('data', (data) => {
    const result = data.toString().trim(); // Convert data to string and remove leading/trailing whitespaces
    output = result.split('\n'); // Split the result on newline characters
  });
  
  const pythonScriptPromise = new Promise((resolve, reject) => {
    pythonScript.on('exit', (code) => {
      const calories = parseFloat(output[0] || 0); // Parse the first value as a float or default to 0
      const dry_food = parseFloat(output[1] || 0); // Parse the second value as a float or default to 0
      const wet_food = parseFloat(output[2] || 0); // Parse the third value as a float or default to 0

      var newPetFoodAmount = {
        pet_id: newPet._id,
        calories_per_day: calories,
        dry_food_per_day: dry_food,
        wet_food_per_day: wet_food,
        operator_id: 'addPet',
      };

      resolve(newPetFoodAmount);
    });

    pythonScript.on('error', (error) => {
      reject(error);
    });
  });


    

  // Use the variables `calories`, `dry_food`, and `wet_food` as needed


    var newPetFoodAmount =  await pythonScriptPromise;
    newPetFoodAmount = await PetFoodAmountsService.create(newPetFoodAmount);
    console.log('newPetFoodAmount: ' + JSON.stringify(newPetFoodAmount));
    if (newPetFoodAmount == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
    }
    var portion = 0.0;
    if (foodType.code == 'dry') {
        portion = newPetFoodAmount.dry_food_per_day / 3
    }
    else {
        portion = newPetFoodAmount.wet_food_per_day / 3
    }

    var newPetSchedule = {
        pet_food_amount_id: newPetFoodAmount._id,
        portion: portion.toFixed(0),
        frequency: 3,
        timings: ["09:30", "13:00", "19:00"],
        operator_id: 'addPet',
      };
      
      var newPetSchedule = await PetSchedulesServices.create(newPetSchedule);
      console.log('newPetSchedule: ' + JSON.stringify(newPetSchedule)); // Corrected variable name
      if (newPetSchedule == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
      }
      var isFirstFeedProcessed = false;
      
      for (let i = 0; i < newPetSchedule.frequency; i++) {
        const currentTime = new Date();
        const targetTime = new Date();
        const timeParts = newPetSchedule.timings[i].split(":");
        const hour = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        targetTime.setUTCHours(hour);
        targetTime.setUTCMinutes(minutes);
      
      
        console.log('currentTime: ' + JSON.stringify(currentTime));
        console.log('targetTime: ' + JSON.stringify(targetTime));

        if (currentTime < targetTime) {
            
            var newPetFeed = {
                pet_schedule_id: newPetSchedule._id,
                timing:newPetSchedule.timings[i],
                amount: newPetSchedule.portion,
                schedule_time:targetTime,
                operator_id: 'addPet',
            };
            if (!isFirstFeedProcessed) {
                newPetFeed.status = "upcoming";
              }
              else{
                newPetFeed.status = "created";
              }


            var newPetFeed = await PetFeedServices.create(newPetFeed);
            console.log('newPetFeed: ' + JSON.stringify(newPet));
            if (newPetFeed == null) {
                return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
            }
            isFirstFeedProcessed=true;
        }
    }


    return res.status(200).send({ status: "success", pet: newPet, pet_food_amount: newPetFoodAmount, pet_schedule: newPetSchedule, message: "Added pet successfully!" });


}
exports.getPet = async function (req, res, next) {
    // console.log('In getAllCountries');
    // console.log('req.body: ' + JSON.stringify(req.body));
    if ((req.body.user_id == null)) {

        console.log("user_id:" + req.body.user_id );
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var existingUser = await UserService.getById(req.body.user_id);
    if (existingUser == null) {
        console.log("in UserService");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var Pet = await PetsServices.getByUserId(existingUser._id);
    if (Pet == null) {
        console.log("in PetsServices");
    }
    return res.status(200).send({ status: 'success', pet: Pet,isPet:Pet!=null, message:'Got pet successfully!' });
}

exports.getPetSchedule = async function (req, res, next) {
    // console.log('In getAllCountries');
    // console.log('req.body: ' + JSON.stringify(req.body));
    if ((req.body.user_id == null)) {

        console.log("user_id:" + req.body.user_id );
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var existingUser = await UserService.getById(req.body.user_id);
    if (existingUser == null) {
        console.log("in UserService");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    const Pet = await PetsServices.getByUserId(existingUser._id);

    if (Pet == null) {
        console.log("in PetsServices");
        return res.status(200).send({ status: 'no_pet', message: 'There is no pet added' });
    }

    var PetFoodAmount = await PetFoodAmountsService.getByPetId(Pet._id);
    if (PetFoodAmount == null) {
        console.log("in PetFoodAmountsService");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var PetSchedule = await PetSchedulesServices.getByPetFoodAmountId(PetFoodAmount._id);
    if (PetSchedule == null) {
        console.log("in PetSchedule");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var PetFeeds = await PetFeedServices.getTodayFeeds(PetSchedule._id);
    if (PetFeeds == null) {
        console.log("in PetFeed");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    console.log("");

    return res.status(200).send({ status: 'success', pet: Pet,pet_food_amount:PetFoodAmount,pet_schedule:PetSchedule, pet_feeds:PetFeeds, message:'Got pet schedule successfully!' });
}

exports.getPetHome = async function (req, res, next) {
    // console.log('In getAllCountries');
    if ((req.body.user_id == null)) {

        console.log("user_id:" + req.body.user_id );
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var existingUser = await UserService.getById(req.body.user_id);
    if (existingUser == null) {
        console.log("in UserService");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    const Pet = await PetsServices.getByUserId(existingUser._id);

    if (Pet == null) {
        console.log("in PetsServices");
        return res.status(200).send({ status: 'no_pet', message: 'There is no pet added' });
    }

    var PetFoodAmount = await PetFoodAmountsService.getByPetId(Pet._id);
    if (PetFoodAmount == null) {
        console.log("in PetFoodAmountsService");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    console.log(PetFoodAmount._id);
    var PetSchedule = await PetSchedulesServices.getByPetFoodAmountId(PetFoodAmount._id);
    if (PetSchedule == null) {
        console.log("in PetSchedule");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var PetUpcoming = await PetFeedServices.getUpcoming(PetSchedule._id);
    if (PetUpcoming == null) {
        console.log("in PetUpcoming");
    }

    return res.status(200).send({ status: 'success', pet: Pet, pet_upcoming:PetUpcoming, message:'Got pet home successfully!' });
}

exports.getPetHistory = async function (req, res, next) {
    // console.log('In getAllCountries');
    if ((req.body.user_id == null)) {

        console.log("user_id:" + req.body.user_id );
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var existingUser = await UserService.getById(req.body.user_id);
    if (existingUser == null) {
        console.log("in UserService");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    const Pet = await PetsServices.getByUserId(existingUser._id);

    if (Pet == null) {
        console.log("in PetsServices");
        return res.status(200).send({ status: 'no_pet', message: 'There is no pet added' });
    }

    var PetFoodAmount = await PetFoodAmountsService.getByPetId(Pet._id);
    if (PetFoodAmount == null) {
        console.log("in PetFoodAmountsService");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var PetSchedule = await PetSchedulesServices.getByPetFoodAmountId(PetFoodAmount._id);
    if (PetSchedule == null) {
        console.log("in PetSchedule");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var PetHistory = await PetFeedServices.getHistory(PetSchedule._id);
    if (PetHistory == null) {
        console.log("in PetUpcoming");
    }

    return res.status(200).send({ status: 'success', pet: Pet, pet_history:PetHistory, message:'Got pet History successfully!' });
}

exports.getProfile = async function (req, res, next) {
    // console.log('In getAllCountries');
    if ((req.body.user_id == null)) {

        console.log("user_id:" + req.body.user_id );
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var existingUser = await UserService.getById(req.body.user_id);
    if (existingUser == null) {
        console.log("in UserService");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var Pet = await PetsServices.getByUserId(existingUser._id);

    if (Pet == null) {
        console.log("in PetsServices");
        return res.status(200).send({ status: 'no_pet',user:existingUser, message: 'There is no pet added' });
    }
    var ageType = await RefAgeTypesService.getById(Pet.age_type_id);
    if (ageType == null) {
        console.log("in UserService");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var petType = await RefPetTypesService.getById(Pet.pet_type_id);
    if (petType == null) {
        console.log("in petType");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var petSizeType = await RefPetSizeTypesService.getById(Pet.pet_size_type_id);
    if (petSizeType == null) {
        console.log("in petSizeType");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });

    }

    var foodType = await RefFoodTypesService.getById(Pet.food_type_id);
    if (foodType == null) {
        console.log("in foodType");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var activityLevelType = {}
    if (petType.code=="dog") {
         activityLevelType = await RefActivityLevelTypesService.getById(Pet.activity_level_type_id);
        if (activityLevelType == null) {
            console.log("in activityLevelType");
            return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
        }
    }
   
    Pet = {pet:Pet, food_type:foodType,pet_size_type:petSizeType, pet_type: petType, age_type:ageType};
    if (activityLevelType!==null){
        Pet.activity_level_type = activityLevelType;
    }
    return res.status(200).send({ status: 'success', pet: Pet,user:existingUser, message:'Got pet History successfully!' });
}


exports.removePet = async function (req, res, next) {
    // console.log('In getAllCountries');
    if ((req.body.pet_id == null)) {

        console.log("pet_id:" + req.body.pet_id );
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var Pet = await PetsServices.getById(req.body.pet_id);
    if (Pet == null) {
        console.log("in PetsServices");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var updateUser = {
        is_active: false,
        operator_id: 'removePet',
    };
    var updateUser = await PetsServices.update(Pet._id, updateUser);


   
    
    return res.status(200).send({ status: 'success', message:'Removed pet successfully!' });
}

exports.cancelFeed = async function (req, res, next) {
    // console.log('In getAllCountries');
    if ((req.body.pet_feed_id == null)) {

        console.log("pet_feed_id:" + req.body.pet_feed_id );
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var petFeed = await PetFeedServices.getById(req.body.pet_feed_id);
    if (petFeed == null) {
        console.log("in PetFeedServices");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var newPetFeed = {
        status: "cancelled",
        operator_id: 'cancelFeed',
    };

   
    var newPetFeed = await PetFeedServices.update(petFeed._id,newPetFeed);
    if(petFeed.status == "upcoming")
    var petNextFeed = await PetFeedServices.getTodayFeedsNext(petFeed.pet_schedule_id);
    if (petNextFeed != null) {
        var updateNextFeed = {
            status: "upcoming",
            operator_id: 'cancelFeed',
        };   
        var updateNextFeed = await PetFeedServices.update(petNextFeed._id,updateNextFeed);

    }

   
  
    return res.status(200).send({ status: 'success', message:'Cancelled feed successfully!' });
}
exports.updatePet = async function (req, res, next) {
    // console.log('In addPet');
    console.log('req.body: ' + JSON.stringify(req.body));
    if ((req.body.pet_id == null) || (req.body.name == null) || (req.body.petTypeCode == null) || (req.body.ageCode == null) || (req.body.gender == null) || (req.body.weight == null) || (req.body.petSizeCode == null) || (req.body.foodTypeCode == null)) {

        console.log("token:" + req.body.token + "name:" + req.body.name + "petTypeCode:" + req.body.petTypeCode + "ageCode:" + req.body.ageCode + "gender:" + req.body.gender + "weight:" + req.body.weight + "petSizeCode:" + req.body.petSizeCode + "foodTypeCode:" + req.body.foodTypeCode);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
 
    var existingPet = await PetsServices.getById(req.body.pet_id);
    if (existingPet == null) {
        console.log("in PetsServices");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
   
    var petType = await RefPetTypesService.getByCode(req.body.petTypeCode);
    if (petType == null) {
        console.log("in petType");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var petSizeType = await RefPetSizeTypesService.getByCodePetTypeId(req.body.petSizeCode, petType._id);
    if (petSizeType == null) {
        console.log("in petSizeType");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });

    }

    var ageType = await RefAgeTypesService.getByCode(req.body.ageCode);
    if (ageType == null) {
        console.log("in ageType");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }

    var foodType = await RefFoodTypesService.getByCode(req.body.foodTypeCode);
    if (foodType == null) {
        console.log("in foodType");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
    var activityLevelType = {}
    if (req.body.activityLevelTypeCode != null) {
         activityLevelType = await RefActivityLevelTypesService.getByCode(req.body.activityLevelTypeCode);
        if (activityLevelType == null) {
            console.log("in activityLevelType");
            return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
        }
    }

    var updatePet = {
        pet_type_id: petType._id,
        pet_size_type_id: petSizeType._id,
        age_type_id: ageType._id,
        gender: req.body.gender,
        name: req.body.name,
        weight: req.body.weight,
        food_type_id: foodType._id,
        operator_id: 'updatePet',

    };
    if (petType.code == "dog") {
        updatePet.activity_level_type_id = activityLevelType._id;
    }

    var updatePet = await PetsServices.update(existingPet._id,updatePet);
    console.log('updatePet: ' + JSON.stringify(updatePet));
   
    
    
    var pythonScript = null
    if (petType.code == "dog") {
        pythonScript = spawn('python3', [fileDogPath, req.body.petSizeCode, req.body.weight, req.body.activityLevelTypeCode, req.body.ageCode]);
    }
    else {
        pythonScript = spawn('python3', [fileCatPath, req.body.weight, req.body.ageCode]);
    }



var output = [];

// Function to convert an Uint8Array to a string
var uint8arrayToString = function(data){
    return String.fromCharCode.apply(null, data);
};



pythonScript.stdout.on('data', (data) => {
    const result = data.toString().trim(); // Convert data to string and remove leading/trailing whitespaces
    output = result.split('\n'); // Split the result on newline characters
  });
  
  const pythonScriptPromise = new Promise((resolve, reject) => {
    pythonScript.on('exit', (code) => {
      const calories = parseFloat(output[0] || 0); // Parse the first value as a float or default to 0
      const dry_food = parseFloat(output[1] || 0); // Parse the second value as a float or default to 0
      const wet_food = parseFloat(output[2] || 0); // Parse the third value as a float or default to 0

      var updateFoodAmount = {
        calories_per_day: calories,
        dry_food_per_day: dry_food,
        wet_food_per_day: wet_food,
        operator_id: 'updatePet',
      };

      resolve(updateFoodAmount);
    });

    pythonScript.on('error', (error) => {
      reject(error);
    });
  });

  var petFoodAmount = await PetFoodAmountsService.getByPetId(existingPet._id);
    console.log('petFoodAmount: ' + JSON.stringify(petFoodAmount));
    if (petFoodAmount == null) {
        console.log("in petFoodAmount");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }
  // Use the variables `calories`, `dry_food`, and `wet_food` as needed


    var updateFoodAmount =  await pythonScriptPromise;
    updateFoodAmount = await PetFoodAmountsService.update(petFoodAmount._id,updateFoodAmount);
    console.log('updateFoodAmount: ' + JSON.stringify(updateFoodAmount));
    

    var portion1 = 0.0;
    if (foodType.code == 'dry') {
        portion1 = updateFoodAmount.dry_food_per_day / 3
        console.log("in PORTION "+updateFoodAmount.dry_food_per_day );
        console.log("in PORTION "+portion1);

    }
    else {
        portion1 = updateFoodAmount.wet_food_per_day / 3
        console.log("in PORTION "+portion1);
        console.log("in PORTION "+updateFoodAmount.wet_food_per_day );

    }
    var petSchedule = await PetSchedulesServices.getByPetFoodAmountId(updateFoodAmount._id);
    console.log('petSchedule: ' + JSON.stringify(petSchedule));
    if (petSchedule == null) {
        console.log("in petSchedule");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }

    var updatePetSchedule = {
        portion: portion1.toFixed(0),
        operator_id: 'updatePet',
    };

 
    var updatePetSchedule = await PetSchedulesServices.update(petSchedule._id,updatePetSchedule);
    console.log('updatePetSchedule: ' + JSON.stringify(updatePetSchedule));
   
    var petFeeds = await PetFeedServices.getTodayRemaining(updatePetSchedule._id);
    console.log('petFeeds: ' + JSON.stringify(petFeeds));
    for (let i = 0; i < petFeeds.length; i++) {
    
                var updatePetFeed = {
                status: 'cancelled',
                operator_id: 'updatePet',
            };

            var updatePetFeed = await PetFeedServices.update(petFeeds[i]._id,updatePetFeed);
            console.log('updatePetFeed: ' + JSON.stringify(updatePetFeed));
          
    }
  

var isFirstFeedProcessed = false
    for (let i = 0; i < updatePetSchedule.frequency; i++) {
        const currentTime = new Date();
        const targetTime = new Date();
        const timeParts = updatePetSchedule.timings[i].split(":");
        const hour = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        targetTime.setUTCHours(hour);
        targetTime.setUTCMinutes(minutes);
      
      

        if (currentTime < targetTime) {
            
            var newPetFeed = {
                pet_schedule_id: updatePetSchedule._id,
                timing:updatePetSchedule.timings[i],
                amount: updatePetSchedule.portion,
                schedule_time:targetTime,
                operator_id: 'updatePet',
            };
            if (!isFirstFeedProcessed) {
                newPetFeed.status = "upcoming";
              }
              else{
                newPetFeed.status = "created";
              }

            var newPetFeed = await PetFeedServices.create(newPetFeed);
            console.log('newPetFeed: ' + JSON.stringify(newPetFeed));
            if (newPetFeed == null) {
                return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
            }
            isFirstFeedProcessed=true;

        }
    }


    return res.status(200).send({ status: "success", pet: updatePet, pet_food_amount: updateFoodAmount, pet_schedule: updatePetSchedule, message: "Updated pet successfully!" });


}

exports.updatePetSchedule = async function (req, res, next) {
    // console.log('In updatePetSchedule');
    console.log('req.body: ' + JSON.stringify(req.body));
    if ((req.body.pet_schedule_id == null) || (req.body.portion == null) || (req.body.frequency == null) || (req.body.timings == null) ) {

        console.log("pet_schedule_id:" + req.body.pet_schedule_id + "portion:" + req.body.portion + "frequency:" + req.body.frequency + "timings:" + req.body.timings );
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
 
   
    var petSchedule = await PetSchedulesServices.getById(req.body.pet_schedule_id );
    console.log('petSchedule: ' + JSON.stringify(petSchedule));
    if (petSchedule == null) {
        console.log("in petSchedule");
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end' });
    }

    var updatePetSchedule = {
        portion: req.body.portion,
        frequency:parseInt(req.body.frequency),
        timings:req.body.timings,
        operator_id: 'updatePetSchedule',
    };

 
    var updatePetSchedule = await PetSchedulesServices.update(petSchedule._id,updatePetSchedule);
    console.log('updatePetSchedule: ' + JSON.stringify(updatePetSchedule));
   
    var petFeeds = await PetFeedServices.getTodayRemaining(updatePetSchedule._id);
    console.log('petFeeds: ' + JSON.stringify(petFeeds));
    for (let i = 0; i < petFeeds.length; i++) {
    
                var updatePetFeed = {
                status: 'cancelled',
                operator_id: 'updatePet',
            };

            var updatePetFeed = await PetFeedServices.update(petFeeds[i]._id,updatePetFeed);
            console.log('updatePetFeed: ' + JSON.stringify(updatePetFeed));
          
    }
  

var isFirstFeedProcessed = false
    for (let i = 0; i < updatePetSchedule.frequency; i++) {
        const currentTime = new Date();
        const targetTime = new Date();
        const timeParts = updatePetSchedule.timings[i].split(":");
        const hour = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        targetTime.setUTCHours(hour);
        targetTime.setUTCMinutes(minutes);
      
      

        if (currentTime < targetTime) {
            
            var newPetFeed = {
                pet_schedule_id: updatePetSchedule._id,
                timing:updatePetSchedule.timings[i],
                amount: updatePetSchedule.portion,
                schedule_time:targetTime,
                operator_id: 'updatePet',
            };
            if (!isFirstFeedProcessed) {
                newPetFeed.status = "upcoming";
              }
              else{
                newPetFeed.status = "created";
              }

            var newPetFeed = await PetFeedServices.create(newPetFeed);
            console.log('newPetFeed: ' + JSON.stringify(newPetFeed));
            if (newPetFeed == null) {
                return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
            }
            isFirstFeedProcessed=true;

        }
    }


    return res.status(200).send({ status: "success",  pet_schedule: updatePetSchedule, message: "Updated pet Schedule successfully!" });


}