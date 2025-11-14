const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");
const { authentication } = require("../utils/jwtUtils.js");
const adminController = require("../controllers/admin.controller.js")
const admin = require("../validations/admin.js")


// login
router.post("/login", validate(admin.loginValidation), adminController.login);

//trainer
router.get("/trainer-list", validate(admin.trainerListValidation), adminController.getAllTrainers);
router.get("/trainer-detail/:id",authentication, adminController.getTrainerDetails);
router.delete("/delete-trainer/:id",authentication, adminController.deleteTrainer);
router.patch("/block-trainer/:id",authentication, validate(admin.blockUnblockValidation), adminController.blockUnblock);
router.patch("/update-document/:id",authentication,validate(admin.verifyDocumnetValidation), adminController.updateDocument);
router.patch("/verify-kyc-step-trainer/:id",authentication,validate(admin.verifyTrainerValidation), adminController.verifyTrainerKyc);


//user
router.get("/user-list",authentication, adminController.getAllUsers);
router.get("/userDetail/:id",authentication, adminController.getUsersDetail);

//enquiry
router.get("/natal-enquiry",authentication,  adminController.getAllNatalEnquiry);
router.get("/corporate-enquiry",authentication,  adminController.getAllCorporateEnquiry);
router.get("/fitness-payment",authentication,  adminController.getAllFitnessgPayment);
router.get("/yoga-payment",authentication, adminController.getAllYogaPayment);
router.get("/diet-payment",authentication,  adminController.getAlldietPlanPayment);

// manully connect the trainer with user
router.post("/connect-trainer",validate(admin.connectWithTrainerValidation), adminController.connectUserWithTrainer);




module.exports = router;


