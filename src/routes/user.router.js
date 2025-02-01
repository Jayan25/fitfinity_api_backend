const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");
const userController=require("../controllers/user.controller.js")
const user=require("../validations/user.js")
const {authentication} = require("../utils/jwtUtils.js");

router.post("/userRegister",validate(user.userRegisterValidation), userController.SignUp);
router.post("/userLogin",validate(user.userLoginValidation), userController.userLogin);
router.post("/update-lat-lon", authentication,validate(user.latlonValidation), userController.latlonUpdation);

module.exports = router;
