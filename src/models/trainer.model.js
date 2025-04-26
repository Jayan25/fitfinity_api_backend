'use strict';

module.exports = (sequelize, DataTypes) => {
  const Trainers = sequelize.define('Trainers', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
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
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: false,
      defaultValue: 'Male',
    },
    pin: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    alternate_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    current_address: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    addhar_address: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    education: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    experience: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    account_holder_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    account_no: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    ifsc_code: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    service_type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    kyc_status: {
      type: DataTypes.ENUM('pending', 'inprocess', 'done', 'failed'),
      allowNull: true,
      defaultValue: 'pending',
    },
    fcm_token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    block_status: {
      type: DataTypes.ENUM('Blocked', 'Unblocked'),
      allowNull: true,
      defaultValue: 'Unblocked',
    },
    kyc_reject_reason: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    kyc_step: {
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
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'trainers',
  });

  Trainers.associate = (models) => {
    Trainers.hasMany(models.TrainerDocument, {
      foreignKey: 'trainer_id',
      as: 'trainer_documents',
      constraints: false,
    });

    Trainers.hasMany(models.service_bookings, {
      foreignKey: "trainer_id",
      as: "service_bookings",
      constraints: false, 
    });
    Trainers.hasMany(models.Payment, {
      foreignKey: "trainer_id",
      as: "payments",
    });
  }
  

  return Trainers;
}
