var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var fileupload = require('express-fileupload');
require('dotenv').config();

var UserController = require('../controllers/UserController');

var acceptMethods = function (req, res, next) {
    res.setHeader('X-Frame-Options', 'sameorigin');
    res.setHeader("Access-Control-Allow-Headers", " Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Origin", process.env.allowOrg);
    res.setHeader('X-Powered-By', 'App v1.5');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-control', ' no-cache, no-store, must-revalidate, pre-check=0, post-check=0, max-age=0, s-maxage=0');
    res.setHeader('Expires', '0');
    res.setHeader("Referrer-Policy", "origin");
    next();
}
router.use(acceptMethods);

router.use(bodyParser.urlencoded({ limit: '500mb', extended: false, parameterLimit: 1000000 }));
router.use(bodyParser.json({ limit: '500mb' }));
router.use(function (req, res, next) {
  process.env.TZ = 'Asia/Kolkata';
  
    // Continue processing the next middleware/route handler
    next();
  });
  
router.use(fileupload());
router.post('/validateMobileNumber', UserController.validateMobileNumber);
router.post('/verifyOTP', UserController.verifyOTP);
router.post('/resetPasswordValidation', UserController.resetPasswordValidation);
router.post('/resetPassword', UserController.resetPassword);
router.post('/getExistingSession', UserController.getExistingSession);
router.post('/signupUser', UserController.signupUser);
router.post('/loginUser', UserController.loginUser);
router.post('/saveUserDeviceToken', UserController.saveUserDeviceToken);
router.post('/sendInAppNotification',UserController.sendInAppNotification);
router.post('/logout', UserController.logout);
router.post('/changeMobile', UserController.changeMobile);
router.post('/getUserNotification', UserController.getUserNotification);
router.post('/updateUser', UserController.updateUser);
router.post('/updateUserNotification', UserController.updateUserNotification);
router.post('/saveArduinoDevice', UserController.saveArduinoDevice);
router.post('/getArduinoDevice', UserController.getArduinoDevice);
router.post('/removeArduinoDevice', UserController.removeArduinoDevice);


module.exports = router;