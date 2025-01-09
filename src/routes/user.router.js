const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");
const userController=require("../controllers/user.controller.js")
const user=require("../validations/user.js")


router.post("/userRegister",validate(user.userRegisterValidation), userController.SignUp);




module.exports = router;
