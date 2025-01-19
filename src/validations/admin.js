const { Joi } = require("express-validation");
const { param } = require("../routes/trainer.router");
const { query } = require("express");

module.exports = {

    loginValidation: {
        body: Joi.object(
            {
                email: Joi.string().required(),
                password: Joi.string().required(),
            }
        )
    },
    trainerListValidation: {
        body: Joi.object(
            {
                search: Joi.string().optional(),
                limit: Joi.number().optional(),
                offset: Joi.number().optional()

            }
        )
    },
    blockUnblockValidation: {
        body: Joi.object(
            {
                // id: Joi.number().required(),
                status: Joi.string().valid("Blocked", "Unblocked").required()

            }
        )
    },
    verifyDocumnetValidation: {
        body: Joi.object(
            {
                verification_status: Joi.string().valid("success", "failed").required()
            }
        )
    },

}