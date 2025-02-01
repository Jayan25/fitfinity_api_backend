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
                then: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
                    "string.pattern.base": "preferred_time_to_be_served must be in HH:MM format",
                }),
                otherwise: Joi.forbidden(),
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
                then: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
                    "string.pattern.base": "trial_time must be in HH:MM format",
                }),
                otherwise: Joi.forbidden(),
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

}