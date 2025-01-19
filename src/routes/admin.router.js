const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");
const { authentication } = require("../utils/jwtUtils.js");
const adminController = require("../controllers/admin.controller.js")
const admin = require("../validations/admin.js")


// login
router.post("/login", validate(admin.loginValidation), adminController.login);
router.get("/trainer-list",authentication, validate(admin.trainerListValidation), adminController.getAllTrainers);
router.get("/trainer-detail/:id",authentication, adminController.getTrainerDetails);
router.delete("/delete-trainer/:id",authentication, adminController.deleteTrainer);
router.patch("/block-trainer/:id",authentication, validate(admin.blockUnblockValidation), adminController.blockUnblock);
router.patch("/update-document/:id",authentication,validate(admin.verifyDocumnetValidation), adminController.updateDocument);


module.exports = router;


