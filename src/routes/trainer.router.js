const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");
const { authentication } = require("../utils/jwtUtils.js");
const trainerController = require("../controllers/trainer.controller.js")
const trainer = require("../validations/tariner.js")
const common=require("../validations/common.js")
const commonController=require("../controllers/common.controller.js")
router.post("/trainerRegister", validate(trainer.registerValidation), trainerController.SignUp);

router.post("/login", validate(trainer.loginValidation), trainerController.login);

router.post("/kyc-step", authentication, validate(trainer.kycValidation), trainerController.kyc);

router.get("/trainer-status", authentication, trainerController.trainerStatus);


//get profile data
router.post("/update-lat-lon", authentication,validate(trainer.latlonValidation), trainerController.latlonUpdation);

router.get("/profile-detail", authentication, trainerController.profileData);

router.post("/generate-signed-url",  trainerController.generateSignedUrl);
router.post("/version",  trainerController.generateSignedUrl);
router.get("/trainer-transaction", authentication,  trainerController.transaction);
router.get("/enquiry", authentication,  trainerController.enquiry);
router.get("/ongoing-enquiry", authentication,  trainerController.ongoingEnquiry);
router.post("/helpAndSupport", validate(common.helpAndSuppoprt), commonController.helpAndSupport);


//1 Accept enquiry api, 

// after riching at the learner home, will click on statr session and then a opt will be sent to user register
// email, trainer will put the opt on his app where a popup will be shown to fill up the otp, once the otp is verified,
// after session ends the trainer will click on stop and then a  ppaymeny link will be sent 

//2 enquiry start and stop api
//3 accept OTP api and send OTP on email
module.exports = router;
