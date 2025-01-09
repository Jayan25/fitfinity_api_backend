const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Service = sequelize.define(
    "Service",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true, 
      tableName: "services", 
    }
  );
  return Service;
};
