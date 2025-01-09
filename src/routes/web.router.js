const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");
const {authentication} = require("../utils/jwtUtils.js");
const trainerController=require("../controllers/trainer.controller.js")
const userController=require("../controllers/user.controller.js")
const trainer=require("../validations/tariner.js")
const user=require("../validations/user.js")


// User
router.post("/userRegister",validate(user.userRegisterValidation), userController.SignUp);
router.post("/userLogin",authentication,validate(user.userLoginValidation), userController.userLogin);
// router.post("/userLogin",validate(user.userRegisterValidation), userController.SignUp);




// Trainer
router.post("/trainerRegister", validate(trainer.registerValidation), trainerController.SignUp);

router.post("/login", validate(trainer.loginValidation), trainerController.login);

router.post("/kyc-step", authentication, validate(trainer.kycValidation), trainerController.kyc);

router.get("/trainer-status", authentication, trainerController.trainerStatus);

router.get("/update-lat-lon", authentication,validate(trainer.latlonValidation), trainerController.latlonUpdation);

//get profile data
router.post("/update-lat-lon", authentication,validate(trainer.latlonValidation), trainerController.latlonUpdation);

router.get("/profile-detail", authentication, trainerController.profileData);


module.exports=router