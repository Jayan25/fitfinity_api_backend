const jwt = require("jsonwebtoken");

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "Users",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      mobile_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remember_token: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('A', 'U', 'T'),
        allowNull: false,
        defaultValue: 'U',
      },
      ref_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      country_shortcode: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      country_code: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(16),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      otp: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null,
      },
      lon: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "users",

    }
  );
  Users.associate = (models) => {
    Users.hasMany(models.Payment, {
      foreignKey: "user_id",
      as: "payments",
    });
  
    Users.hasMany(models.service_bookings, {
      foreignKey: "user_id",
      as: "service_bookings",
      constraints: false, 
    });
  };

  return Users;
};

