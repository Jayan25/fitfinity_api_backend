const { Versions,HelpSupport } = require("../models/index.js")

module.exports.version = async function (req, res) {
    try {
      const result = await Versions.findAll({});
  
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        statusCode: 500,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  module.exports.helpAndSupport = async function (req, res) {
    try {
      
      const { user_id, trainer_id, userType,query } = req.body;
  
      if (!userType || !query) {
        return res.status(400).json({
          statusCode: 400,
          message: "userType and query are required fields",
        });
      }
      const helpEntry = await HelpSupport.create({
        user_id: user_id || null,
        trainer_id: trainer_id || null,
        userType,
        status:"pending",
        query
      });
  
      res.status(201).json({
        statusCode: 201,
        message: "Enquiry submitted successfully"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        statusCode: 500,
        message: error.message || "Internal Server Error",
      });
    }
  };