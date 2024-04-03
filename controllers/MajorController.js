var UsersService = require('../models/major_models/Users');
var UserCredentialService = require('../models/major_models/UserCredential');
var UserSessionServices = require('../models/major_models/UserSessions');
var RefSessionTypesService = require('../models/major_models/refSessionTypes');
var UserFilesService = require('../models/major_models/UserFiles');
var RefUserTypesService = require('../models/major_models/refUserTypes');

const { GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');
const moment = require('moment');
const crypto = require('crypto');

var genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};
exports.loginUser = async function (req, res, next) {
    // console.log('In loginUser');

    console.log('req.body: ' + JSON.stringify(req.body));
    if (req.body.username == null || req.body.password == null) {

        console.log("username:" + req.body.username + "password:" + req.body.password);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var existingUser = await UsersService.getByUsername(req.body.username);
    if (existingUser == null) {
        return res.status(200).send({ status: 403, message: 'User with this username does not exist' });
    }
    //console.log("USER:"+existingUser);
    if (existingUser.is_locked) {
        return res.status(200).send({ status: 403, message: 'User Account has been locked please try again after some time.' });

    }
    existingUserCredential = await UserCredentialService.getByUser_id(existingUser._id);
    if (existingUserCredential == null) {
        return res.status(200).send({ status: 403, message: 'Password seems to have expired please reset your password.' });
    }



    var userpassword = req.body.password;
    // console.log("existing user cred:" + JSON.stringify(existingUserCredential));
    var hash = existingUserCredential.credential.hash;


    //console.log('UserPassword = ' + userpassword);
    //console.log('Passwordhash = ' + hash);
    var failed_attempts = existingUser.unsuccessful_attempts;
    var is_wrong = false;
    var is_locked = false;
    if (userpassword != hash) {
        is_wrong = true;

        failed_attempts++;

        if (existingUser.unsuccessful_attempts >= 3) {
            is_locked = true;

        }

    }

    var updateUser = {
        unsuccessful_attempts: failed_attempts,
        is_locked: is_locked,
        last_login_attempt: moment.parseZone(new Date()).utcOffset("+05:30")._d,
        operator_id: 'loginUser',
    };
    var updateUser = await UsersService.update(existingUser._id, updateUser);
    //console.log("user:"+JSON.stringify(updateUser));

    if (is_locked) {
        return res.status(200).send({ status: 403, message: 'Incorrect password, too many unsuccessful_attempts please try again after 30 minutes. ' });
    }
    console.log("is wrong: " + is_wrong);
    if (is_wrong) {
        return res.status(200).send({ status: 403, message: 'Incorrect password' });
    }


    //check existing session


    var token = genRandomString(25);
    var sessionType = await RefSessionTypesService.getByCode('LOGIN');
    if (sessionType == null) {
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });
    }

    var existingUserSession = await UserSessionServices.getByUserIdSessionTypeId(existingUser._id, sessionType._id);
    if (existingUserSession !== null) {
        await UserSessionServices.expire(existingUserSession)
    }
    var newUserSession = {
        user_id: existingUser._id,
        token: token,
        session_type_id: sessionType._id,
        operator_id: 'loginUser',
    };

    var newUserSession = await UserSessionServices.create(newUserSession);
    console.log('newUserSession: ' + JSON.stringify(newUserSession));

    var userType = await RefUserTypesService.getById(updateUser.user_type_id);
    if(userType==null){
        return res.status(200).send({ status: 403, message: 'There seems to be an error at our end.' });

    }

    return res.status(200).send({ status: "success", user_session: newUserSession, user_type:userType,user: updateUser, message: "Welcome back " + updateUser.name });


}

exports.getSalt = async function (req, res, next) {
    // console.log('In loginUser');

    console.log('req.body: ' + JSON.stringify(req.body));
    if (req.body.username == null) {

        console.log("username:" + req.body.username);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var existingUser

    existingUser = await UsersService.getByUsername(req.body.username);
    if (existingUser == null) {
        return res.status(200).send({ status: 403, message: 'User with this username does not exist' });
    }



    existingUserCredential = await UserCredentialService.getByUser_id(existingUser._id);
    if (existingUserCredential == null) {
        return res.status(200).send({ status: 403, message: 'Password seems to have expired please reset your password.' });
    }





    return res.status(200).send({ status: "success", salt: existingUserCredential.credential.salt });


}

exports.logout = async function (req, res, next) {
    // console.log('In loginUser');

    console.log('req.body: ' + JSON.stringify(req.body));
    if (req.body.token == null) {

        console.log("username:" + req.body.username);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var userSession = await UserSessionServices.getByToken(req.body.token);
    if (userSession == null) {
        console.log("Session has expired");
        return res.status(200).send({ status: 500, message: 'Session has expired. Please login again.' });
    }

    userSession = await UserSessionServices.expire(userSession);




    return res.status(200).send({ status: "success", message:"Logged out successfully." });


}

exports.uploadFile = async function (req, res, next) {
    // console.log('Request Headers:', req.headers);
     console.log('Request Body:', req.body);
 
     if (req.body.token == null || req.files.image == null || req.body.name == null || req.body.age == null || req.body.gender  == null|| req.body.symptoms == null) {
         return res.status(200).send({ status: 400, message: 'Missing parameters' });
     }
 
     var userSession = await UserSessionServices.getByToken(req.body.token);
     if (userSession == null) {
         console.log("Session has expired");
         return res.status(200).send({ status: 500, message: 'Session has expired. Please login again.' });
     }
 
     var user = await UsersService.getById(userSession.user_id);
     if (user == null) {
         console.log("User not found");
         return res.status(200).send({ status: 400, message: 'Technical error' });
     }
 
     const bucket = new GridFSBucket(myDBMajor, { bucketName: "image_bucket" });
     const uploadedFile = req.files.image;
     const uploadFileName = req.files.image.name;
     const fileName = "./assets/" + uploadFileName;
     // console.log('filename: ' + filename);
     uploadedFile.mv(fileName, function (err) {
         if (err) {
             console.log(err);
             return res.status(200).send({ status: 400, message: 'Technical error' });
 
         }
         const uploadStream = bucket.openUploadStream(req.files.image.name);
     const readStream = fs.createReadStream(fileName);
 
     readStream.pipe(uploadStream)
         .on('error', (err) => {
             console.error('Error uploading file to GridFS:', err);
             return res.status(200).send({ status: 400, message: 'Error uploading file' });
         })
         .on('finish', async () => {
 
             var imageFile = {
                 name: req.files.image.name,
                 user_id: user._id,
                 operator_id: "uploadFile",
                 patient_name: req.body.name,
                 patient_age: req.body.age,
                 patient_gender: req.body.gender,
                 patient_symptoms:req.body.symptoms,
                 predicted_result: "Negative",
                 accuracy:"90",
                 actual_result: "",
                 file_id: uploadStream.id // Store the GridFS file ID
             }
 
             imageFile = await UserFilesService.create(imageFile);
 
            
             return res.status(200).send({ status: "success", message: "Patient details uploaded successfully" });
         });
 
     });
 
 
 };
 
 

exports.addUser = async function (req, res, next) {
    // console.log('In addUser');
    const mobile = parseInt(req.body.mobile)

    console.log('req.body: ' + JSON.stringify(req.body));
    if (mobile == null|| req.body.token == null|| req.body.name == null ||req.body.email == null || req.body.salt == null || req.body.password == null || req.body.username == null || req.body.user_type_code == null) {
        console.log("mobile:"+mobile+"token:"+req.body.token+"email:"+req.body.email+"name:"+req.body.name+"password:"+req.body.password+"salt:"+req.body.salt+"username:"+req.body.username+"user_type_code:"+req.body.user_type_code);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var userSession = await UserSessionServices.getByToken(req.body.token);
    if(userSession == null){
        return res.status(200).send({ status: 500, message: 'Session has expired, Please login again to continue.' });
    }
    var loggedinUser = await UsersService.getById(userSession.user_id);
    if(loggedinUser == null){
        console.log("in loggedinUser");

        return res.status(200).send({ status: 403, message: 'Technical error.' });

    }

    var loggedinUserType = await RefUserTypesService.getById(loggedinUser.user_type_id);
    if(loggedinUserType == null){
        console.log("in loggedinUserType");
        return res.status(200).send({ status: 403, message: 'Technical error.' });
    }
    if(loggedinUserType.code !== "ADMIN"){
        return res.status(200).send({ status: 403, message: 'You do not have required authority.' });
    }

    var existingUser = await UsersService.getByMobile(mobile);
    if (existingUser !== null) {
        return res.status(200).send({ status: 403, message: 'Mobile number is already in use.' });
    }

        existingUser = await UsersService.getByEmail(req.body.email);
        if (existingUser !== null) {
            return res.status(200).send({ status: 403, message: 'Email address is already in use.' });
        }
        existingUser = await UsersService.getByUsername(req.body.username);
        if (existingUser !== null) {
            return res.status(200).send({ status: 403, message: 'Username is already in use.' });
        }
        userType = await RefUserTypesService.getByCode(req.body.user_type_code);
        if (userType == null) {
            console.log("in userType");
            return res.status(200).send({ status: 403, message: 'Technical error.' });
        }

    var credential = { salt: req.body.salt, hash: req.body.password };
    var newUser = {
        name: req.body.name,
        mobile: mobile,
        email:  req.body.email,
        username: req.body.username,
        user_type_id: userType._id,
        owner_id:loggedinUser._id,
        operator_id: 'addUser',
    };
    console.log('newUser: ' + JSON.stringify(newUser));

    var newUser = await UsersService.create(newUser);
    console.log('newUser: ' + JSON.stringify(newUser));



    var newUserCredential = {
        user_id: newUser._id,
        credential: credential,
        operator_id: 'addUser',
    };

    var newUserCredential = await UserCredentialService.create(newUserCredential);
    console.log('newUserCredential: ' + JSON.stringify(newUserCredential));
   

    return res.status(200).send({ status: "success", user: newUser, message: "Signup successful!" });


}







exports.getPatientHistory = async function (req, res, next) {
    // console.log('In getAllCountries');
    // console.log('req.body: ' + JSON.stringify(req.body));
    if (req.body.token == null) {

        console.log("token:" + req.body.token);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var userSession = await UserSessionServices.getByToken(req.body.token);
    if (userSession == null) {
        console.log("Session has expired");
        return res.status(200).send({ status: 500, message: 'Session has expired. Please login again.' });
    }
    var user = await UsersService.getById(userSession.user_id);
    if (user == null) {
        console.log("User not found ");
        return res.status(200).send({ status: 403, message: 'Technical error' });
    }

    
    const records = await UserFilesService.getAllByUser_id(user._id);
     //console.log('records: ' + JSON.stringify(records));

    return res.status(200).send({ status: 'success', message:"Patient history retrieved successfully",patient_records: records });
}

exports.getUserDetails = async function (req, res, next) {
    // console.log('In getAllCountries');
    // console.log('req.body: ' + JSON.stringify(req.body));
    if (req.body.token == null) {

        console.log("token:" + req.body.token);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var userSession = await UserSessionServices.getByToken(req.body.token);
    if (userSession == null) {
        console.log("Session has expired");
        return res.status(200).send({ status: 500, message: 'Session has expired. Please login again.' });
    }
    var user = await UsersService.getById(userSession.user_id);
    if (user == null) {
        console.log("User not found ");
        return res.status(200).send({ status: 403, message: 'Technical error' });
    }

    
    const records = await UsersService.getAllUsersByOwner_id(user._id);
    for (const record of records) {
        var userCredential = await UserCredentialService.getByUser_id(record._id);
        if (userCredential == null) {
            console.log("User Credential not found ");
            return res.status(200).send({ status: 403, message: 'Technical error' });
        }
        var userType = await RefUserTypesService.getById(record.user_type_id);
        if (userType == null) {
            console.log("User Type  not found ");
            return res.status(200).send({ status: 403, message: 'Technical error' });
        }
        record.user_credential = userCredential;
        record.user_type = userType;

      }
     console.log('records: ' + JSON.stringify(records));

    return res.status(200).send({ status: 'success', message:"User details retrieved successfully",user_records: records });
}

exports.getPatientImage = async function (req, res, next) {
    // console.log('In getAllCountries');
    console.log('req.body: ' + JSON.stringify(req.body));
    if (req.body.token == null || req.body.patient_id == null) {

        //console.log("token:" + req.body.token);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var userSession = await UserSessionServices.getByToken(req.body.token);
    if (userSession == null) {
        console.log("Session has expired");
        return res.status(200).send({ status: 500, message: 'Session has expired. Please login again.' });
    }
    var userFile = await UserFilesService.getById(req.body.patient_id);
    if (userFile == null) {
        console.log("File not found ");
        return res.status(200).send({ status: 403, message: 'File not found' });
    }

    const bucket = new GridFSBucket(myDBMajor, { bucketName: "image_bucket" });
    const name = userFile.file_id+userFile.name
    const outFileName = "./assets/out/" + name;
    const fileId = new ObjectId(userFile.file_id);
    const downloadStream = bucket.openDownloadStream(fileId);
    const fileStream = fs.createWriteStream(outFileName);

    downloadStream.pipe(fileStream)
    .on('error', (err) => {
        console.error('Error downloading file from GridFS:', err);
        return res.status(200).send({ status: 403, message: 'Technical error' });
    })
    .on('finish', () => {
        console.log('File downloaded successfully');
        const imageUrl = `http://localhost:3000/assets/out/${name}`;
       // console.log(imageUrl);
        return res.status(200).send({ status: 'success', message:"Image retrieved successfully",image_url: imageUrl });

    });

}
exports.deletePatientDetails = async function (req, res, next) {
    // console.log('In getAllCountries');
    console.log('req.body: ' + JSON.stringify(req.body));
    if (req.body.token == null || req.body.patient_id == null) {

        //console.log("token:" + req.body.token);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var userSession = await UserSessionServices.getByToken(req.body.token);
    if (userSession == null) {
        console.log("Session has expired");
        return res.status(200).send({ status: 500, message: 'Session has expired. Please login again.' });
    }
    var userFile = await UserFilesService.getById(req.body.patient_id);
    if (userFile == null) {
        console.log("Patient not found ");
        return res.status(200).send({ status: 403, message: 'Patient not found' });
    }
    userFile = await UserFilesService.update(userFile._id,{is_active:false});
   
        return res.status(200).send({ status: 'success', message:"Deleted patient details successfully" });

    

}
exports.deleteUser = async function (req, res, next) {
    // console.log('In getAllCountries');
    console.log('req.body: ' + JSON.stringify(req.body));
    if (req.body.token == null || req.body.user_id == null) {

        //console.log("token:" + req.body.token);
        return res.status(200).send({ status: 403, message: 'Missing paramters' });

    }
    var userSession = await UserSessionServices.getByToken(req.body.token);
    if (userSession == null) {
        console.log("Session has expired");
        return res.status(200).send({ status: 500, message: 'Session has expired. Please login again.' });
    }
    var user = await UsersService.getById(req.body.user_id);
    if (user == null) {
        console.log("Patient not found ");
        return res.status(200).send({ status: 403, message: 'User not found' });
    }
    user = await UsersService.update(user._id,{is_deleted:true});
   
        return res.status(200).send({ status: 'success', message:"Deleted User successfully" });

    

}