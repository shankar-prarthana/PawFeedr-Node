var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var fileupload = require('express-fileupload');
require('dotenv').config();

var PetController = require('../controllers/PetController');

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

router.use(fileupload());
router.use(function (req, res, next) {
    process.env.TZ = 'Asia/Calcutta'; // Set the desired timezone
  
    // Continue processing the next middleware/route handler
    next();
  });
  
router.post('/addPet', PetController.addPet);
router.post('/getPet', PetController.getPet);
router.post('/getPetHome', PetController.getPetHome);
router.post('/getPetHistory', PetController.getPetHistory);
router.post('/getPetSchedule', PetController.getPetSchedule);
router.post('/getProfile', PetController.getProfile);
router.post('/removePet', PetController.removePet);
router.post('/cancelFeed', PetController.cancelFeed);
router.post('/updatePet', PetController.updatePet);

module.exports = router;