const { Versions } = require("../models/index.js")

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