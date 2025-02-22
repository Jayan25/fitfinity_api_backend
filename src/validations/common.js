const { Joi } = require("express-validation");
const { param } = require("../routes/trainer.router");
const { query } = require("express");

module.exports = {

    helpAndSuppoprt: {
        body: Joi.object(
            {
                userType: Joi.string().required().valid(
                    'Trainer', 'User'
                ),
                user_id: Joi.string().optional().allow(""),
                trainer_id: Joi.string().optional().allow(""), 
                query: Joi.string().required(), 
                
            }
        )
    },
  

}