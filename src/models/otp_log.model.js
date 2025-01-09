const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OtpLog = sequelize.define(
    "OtpLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true, // Adds createdAt and updatedAt
      tableName: "otp_logs", // MySQL table name
    }
  );

  return OtpLog;
};
