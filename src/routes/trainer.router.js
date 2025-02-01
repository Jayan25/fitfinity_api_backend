const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");
const { authentication } = require("../utils/jwtUtils.js");
const trainerController = require("../controllers/trainer.controller.js")
const trainer = require("../validations/tariner.js")

router.post("/trainerRegister", validate(trainer.registerValidation), trainerController.SignUp);

router.post("/login", validate(trainer.loginValidation), trainerController.login);

router.post("/kyc-step", authentication, validate(trainer.kycValidation), trainerController.kyc);

router.get("/trainer-status", authentication, trainerController.trainerStatus);

router.get("/update-lat-lon", authentication,validate(trainer.latlonValidation), trainerController.latlonUpdation);

//get profile data
router.post("/update-lat-lon", authentication,validate(trainer.latlonValidation), trainerController.latlonUpdation);

router.get("/profile-detail", authentication, trainerController.profileData);

router.post("/generate-signed-url",  trainerController.generateSignedUrl);

module.exports = router;
