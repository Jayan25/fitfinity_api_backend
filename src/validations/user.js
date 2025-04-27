const { Joi } = require("express-validation");

module.exports = {

    userRegisterValidation:{
        body:Joi.object(
        {
            fullname:Joi.string().required(),
            email:Joi.string().required(),
            mobile:Joi.string().required(),
            password:Joi.string().required(),
            // lat: Joi.number().required().min(-90).max(90), 
            // lon: Joi.number().required().min(-180).max(180),
        }
        )
    },
    userLoginValidation:{
        body:Joi.object(
        {
            email:Joi.string().required(),
            password:Joi.string().required(),
        }
        )
    },
    serviceBookingValidation: {
        body: Joi.object({
            service_booking_step: Joi.number().valid(1, 2, 3).required(),
            booking_name: Joi.string().required(),

            service_type: Joi.when("service_booking_step", {
                is: 1,
                then: Joi.string().valid("fitness", "yoga", "diet").required(),
                otherwise: Joi.forbidden(),
            }),
            preferred_time_to_be_served: Joi.when("service_booking_step", {
                is: 1,
                then:Joi.string().required(),
            }),
            training_for: Joi.when("service_booking_step", {
                is: 1,
                then: Joi.string().valid("male", "female", "couple", "group").required(),
                otherwise: Joi.forbidden(),
            }),
            trial_date: Joi.when("service_booking_step", {
                is: 1,
                then: Joi.date().iso().required(),
                otherwise: Joi.forbidden(),
            }),
            trial_time: Joi.when("service_booking_step", {
                is: 1,
                then:Joi.string().required(),
            }),
          
           

            // Step 2: Trainer Type
            trainer_type: Joi.when("service_booking_step", {
                is: 1,
                then: Joi.string().valid("basic", "standard", "premium", "couple/group").required(),
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
    latlonValidation: {
        body: Joi.object({
            lat: Joi.number().required().min(-90).max(90), 
            lon: Joi.number().required().min(-180).max(180),
        }),
    },
    natalEnquiryValidation: {
        body: Joi.object({
            name: Joi.string().required(), 
            email: Joi.string().required(), 
            address: Joi.string().required(), 
            phone: Joi.string().required(), 
            requirement: Joi.string().required(), 
        }),
    },
    corporatePlanValidation: {
        body: Joi.object({
            name: Joi.string().required(), 
            email: Joi.string().required(), 
            phone: Joi.string().required(), 
            requirement: Joi.string().required(), 
            company_name: Joi.string().required(), 
        }),
    },

}