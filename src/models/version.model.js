const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Versions = sequelize.define(
    "Versions",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      device_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      user_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        default:"user"
      },
      version: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      force_update: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      tableName: "versions", 
      timestamps: false
    }
  );

  return Versions;
};
