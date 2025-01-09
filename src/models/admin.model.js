const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Admins=sequelize.define(
    "Admins",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true, 
      tableName: "admins",
      paranoid: true, 
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at"
    }
  );

  return Admins;
};
