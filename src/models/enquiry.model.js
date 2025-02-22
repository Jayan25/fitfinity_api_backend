'use strict';

module.exports = (sequelize, DataTypes) => {
  const enquiry = sequelize.define("enquiry", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requirement: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: true,  
    },
    enquiry_for: {
      type: DataTypes.ENUM("natal", "corporate","help"),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    }
  }, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "enquiry",
  });

  enquiry.associate = (models) => {
    enquiry.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      constraints: false,
    });
  };

  return enquiry;
};
