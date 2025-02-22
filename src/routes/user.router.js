const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");
const userController=require("../controllers/user.controller.js")
const commonController=require("../controllers/common.controller.js")
const user=require("../validations/user.js")
const common=require("../validations/common.js")
const {authentication} = require("../utils/jwtUtils.js");

router.post("/userRegister",validate(user.userRegisterValidation), userController.SignUp);
router.post("/userLogin",validate(user.userLoginValidation), userController.userLogin);
router.post("/createOrUpdateBooking",authentication,validate(user.serviceBookingValidation), userController.createOrUpdateServiceBooking);
router.post("/update-lat-lon", authentication,validate(user.latlonValidation), userController.latlonUpdation);
router.post("/natalEnquiry", authentication, userController.natalEnquiry);
router.post("/corporatePlan", authentication, userController.corporatePlan);
router.post("/dietPlan", authentication, userController.dietPlan);
router.post("/helpAndSupport", authentication,validate(common.helpAndSuppoprt), commonController.helpAndSupport);
router.get("/transaction", authentication,  userController.transaction);

module.exports = router;
