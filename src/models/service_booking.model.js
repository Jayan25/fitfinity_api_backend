'use strict';

module.exports = (sequelize, DataTypes) => {
  const ServiceBooking = sequelize.define(
    "ServiceBooking",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      service_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY, 
        allowNull: false,
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
      },
      time_of_birth: {
        type: DataTypes.TIME, 
      },
      star: {
        type: DataTypes.STRING,
      },
      gotram: {
        type: DataTypes.STRING,
      },
      requirement_of_puja: {
        type: DataTypes.TEXT,
      },
      problem: {
        type: DataTypes.TEXT,
      },
      muhurtham: {
        type: DataTypes.STRING,
      },
      muhurtham_place: {
        type: DataTypes.STRING,
      },
      details: {
        type: DataTypes.TEXT,
      },
      address: {
        type: DataTypes.TEXT,
      },
      currency_type: {
        type: DataTypes.STRING,
        defaultValue: "IND",
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
      },
      number_of_gows: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true, 
      tableName: "service_bookings", 
    }
  );

  return ServiceBooking;
};
