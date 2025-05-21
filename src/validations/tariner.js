const { Joi } = require("express-validation");

module.exports = {

    registerValidation: {
        body: Joi.object(
            {
                name: Joi.string().required(),
                email: Joi.string().required(),
                phone: Joi.string().required(),
                password: Joi.string().required(),
                gender: Joi.string().required(),
                current_address: Joi.string().required(),
                pin: Joi.string().required(),
                service_type: Joi.string().valid(
                    'Fitness Trainer', 'Yoga Trainer', 'Weight Loss & Toning Trainer',
                    'Kickboxing Trainer', 'MMA Trainer', 'Cardio Fitness Trainer',
                    'Weight & Resistance Trainer', 'Group Session Trainer', 'Strength Trainer'
                ).required()
                    .min(1),

            }
        )
    },
    kycValidation: {
        body: Joi.object({
            kyc_step: Joi.number().valid(1, 2).required(),
            education: Joi.when("kyc_step", {
                is: 1,
                then: Joi.string().required(),
                otherwise: Joi.optional(""),
            }),
            alternate_phone: Joi.when("kyc_step", {
                is: 1,
                then: Joi.string().required(),
                otherwise: Joi.optional(""),
            }),
            addhar_address: Joi.when("kyc_step", {
                is: 1,
                then: Joi.string().required(),
                otherwise: Joi.optional(""),
            }),
            experience: Joi.when("kyc_step", {
                is: 1,
                then: Joi.number().required(),
                otherwise: Joi.optional(""),
            }),
            bank_name: Joi.when("kyc_step", {
                is: 1,
                then: Joi.string().required(),
                otherwise: Joi.optional(""),
            }),
            account_no: Joi.when("kyc_step", {
                is: 1,
                then: Joi.string().required(),
                otherwise: Joi.optional(""),
            }),
            ifsc_code: Joi.when("kyc_step", {
                is: 1,
                then: Joi.string().required(),
                otherwise: Joi.optional(""),
            }),
            account_holder_name: Joi.when("kyc_step", {
                is: 1,
                then: Joi.string().required(),
                otherwise: Joi.optional(""),
            }),
            service_type: Joi.when("kyc_step", {
                is: 1,
                then: Joi.array()
                    .items(
                        Joi.string().valid(
                            'Fitness Trainer', 'Yoga Trainer', 'Weight Loss & Toning Trainer',
                            'Kickboxing Trainer', 'MMA Trainer', 'Cardio Fitness Trainer',
                            'Weight & Resistance Trainer', 'Group Session Trainer', 'Strength Trainer'
                        )
                    )
                    .required()
                    .min(1),
                otherwise: Joi.optional(),
            }),
            documents: Joi.when("kyc_step", {
                is: 2,
                then: Joi.array().required().min(1),
                otherwise: Joi.optional(""),
            }),

        }),
    },
    loginValidation: {
        body: Joi.object(
            {
                email: Joi.string().required(),
                password: Joi.string().required(),
            }
        )
    },
    latlonValidation: {
        body: Joi.object({
            lat: Joi.number().required().min(-90).max(90), 
            lon: Joi.number().required().min(-180).max(180),
        }),
    },
    
}








