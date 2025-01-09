const { Joi } = require("express-validation");

module.exports = {

    userRegisterValidation:{
        body:Joi.object(
        {
            name:Joi.string().required(),
            email:Joi.string().required(),
            mobile:Joi.string().required(),
            password:Joi.string().required(),
            lat: Joi.number().required().min(-90).max(90), 
            lon: Joi.number().required().min(-180).max(180),
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
    }

}