"use strict";

module.exports = (sequelize, DataTypes) => {
  const ClassPlan = sequelize.define(
    "class_plans",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      service_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      monthly_rate_6m: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30, // Rs 30 / month
      },
      monthly_rate_12m: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 19, // Rs 19 / month
      },
      six_month_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 211, // Rs 211 incl GST
      },
      yearly_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 269, // Rs 269 incl GST
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "class_plans",
    }
  );

  return ClassPlan;
};
