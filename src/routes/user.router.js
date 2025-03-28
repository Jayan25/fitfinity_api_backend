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
router.post("/dietPlan", authentication, userController.dietPlan);
router.post("/update-lat-lon", authentication,validate(user.latlonValidation), userController.latlonUpdation);
router.post("/natalEnquiry",  userController.natalEnquiry);
router.post("/corporatePlan",  userController.corporatePlan);
router.post("/helpAndSupport", authentication,validate(common.helpAndSuppoprt), commonController.helpAndSupport);
router.get("/user-transaction", authentication,  userController.transaction);
router.get("/user-diet-transaction", authentication,  userController.dietTransaction);
router.get("/ongoing-enquiry", authentication,  userController.ongoingEnquiry);

// payment gateway apis
// router.post("/create-order",authentication, userController.createOrder);
router.post("/razorpay-webhook", userController.razorpayWebhook);

module.exports = router;
