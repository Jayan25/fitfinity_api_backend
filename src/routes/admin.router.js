const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");
const { authentication } = require("../utils/jwtUtils.js");
const adminController = require("../controllers/admin.controller.js")
const admin = require("../validations/admin.js")


// login
router.post("/login", validate(admin.loginValidation), adminController.login);

//trainer
router.get("/trainer-list",authentication, validate(admin.trainerListValidation), adminController.getAllTrainers);
router.get("/trainer-detail/:id",authentication, adminController.getTrainerDetails);
router.delete("/delete-trainer/:id",authentication, adminController.deleteTrainer);
router.patch("/block-trainer/:id",authentication, validate(admin.blockUnblockValidation), adminController.blockUnblock);
router.patch("/update-document/:id",authentication,validate(admin.verifyDocumnetValidation), adminController.updateDocument);
router.patch("/verify-kyc-step-trainer/:id",authentication,validate(admin.verifyTrainerValidation), adminController.verifyTrainerKyc);


//user
router.get("/user-list",authentication, validate(admin.userListValidation), adminController.getAllUsers);

//enquiry
router.get("/natal-enquiry",authentication, validate(admin.userListValidation), adminController.getAllNatalEnquiry);
router.get("/corporate-enquiry",authentication, validate(admin.userListValidation), adminController.getAllCorporateEnquiry);
router.get("/fitness-payment",authentication, validate(admin.userListValidation), adminController.getAllFitnessgPayment);
router.get("/yoga-payment",authentication, validate(admin.userListValidation), adminController.getAllYogaPayment);
router.get("/diet-payment",authentication, validate(admin.userListValidation), adminController.getAlldietPlanPayment);

module.exports = router;


