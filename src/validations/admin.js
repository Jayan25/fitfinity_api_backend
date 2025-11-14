const { Joi } = require("express-validation");
const { param } = require("../routes/trainer.router");
const { query } = require("express");

module.exports = {
  loginValidation: {
    body: Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  },
  trainerListValidation: {
    body: Joi.object({
      search: Joi.string().optional(),
      limit: Joi.number().optional(),
      offset: Joi.number().optional(),
    }),
  },
  blockUnblockValidation: {
    body: Joi.object({
      // id: Joi.number().required(),
      status: Joi.string().valid("Blocked", "Unblocked").required(),
    }),
  },
  verifyDocumnetValidation: {
    body: Joi.object({
      verification_status: Joi.string().valid("success", "failed").required(),
    }),
  },
  verifyTrainerValidation: {
    body: Joi.object({
      kyc_status: Joi.string().valid("done", "failed").required(),
    }),
  },
  userListValidation: {
    body: Joi.object({
      search: Joi.string().optional(),
      limit: Joi.number().optional(),
      offset: Joi.number().optional(),
    }),
  },
  connectWithTrainerValidation: {
    body: Joi.object({
      user_id: Joi.string().optional().allow(""),
      trainer_id: Joi.string().optional().allow(""),
      service_booking_step: Joi.number().valid(1, 2, 3).required(),
      booking_name: Joi.string().required(),

      service_type: Joi.when("service_booking_step", {
        is: 1,
        then: Joi.string().valid("fitness", "yoga", "diet").required(),
        otherwise: Joi.forbidden(),
      }),
      preferred_time_to_be_served: Joi.when("service_booking_step", {
        is: 1,
        then: Joi.string().required(),
      }),
      training_for: Joi.when("service_booking_step", {
        is: 1,
        then: Joi.string()
          .valid("male", "female", "couple", "group")
          .required(),
        otherwise: Joi.forbidden(),
      }),
      trial_date: Joi.when("service_booking_step", {
        is: 1,
        then: Joi.date().iso().required(),
        otherwise: Joi.forbidden(),
      }),
      trial_time: Joi.when("service_booking_step", {
        is: 1,
        then: Joi.string().required(),
      }),

      // Step 2: Trainer Type
      trainer_type: Joi.when("service_booking_step", {
        is: 1,
        then: Joi.string()
          .valid("basic", "standard", "premium", "couple/group")
          .required(),
        otherwise: Joi.forbidden(),
      }),

      // Step 3: Training Needed For
      training_needed_for: Joi.when("service_booking_step", {
        is: 1,
        then: Joi.string().valid("self", "other").required(),
        otherwise: Joi.forbidden(),
      }),
      address: Joi.when("service_booking_step", {
        is: 1,
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
      }),
      landmark: Joi.when("service_booking_step", {
        is: 1,
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
      }),

      area: Joi.when("service_booking_step", {
        is: 1,
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
      }),
      pincode: Joi.when("service_booking_step", {
        is: 1,
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
      }),

      //  name and contact_number only required when "training_needed_for" is "other"
      name: Joi.when("training_needed_for", {
        is: "other",
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
      }),
      contact_number: Joi.when("training_needed_for", {
        is: "other",
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
      }),

      // training_needed_for: Joi.when("service_booking_step", {
      //     is: 4,
      //     then: Joi.string().valid("self", "other").required(),
      //     otherwise: Joi.forbidden(),
      // }),

      //if payment is about to complete
    }),
  },
};
