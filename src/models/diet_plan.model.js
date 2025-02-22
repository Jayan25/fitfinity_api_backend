'use strict';

module.exports = (sequelize, DataTypes) => {
  const diet_plan = sequelize.define("diet_plan", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM(
        "weight and muscle gain",
        "weight and fat loss",
        "thyroid and diabetic",
        "meal plan"
      ),
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plan_for: {
      type: DataTypes.ENUM("myself", "others"),
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    height: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weight: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    goal: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    diet_type: {
      type: DataTypes.ENUM("vegitarian", "non-vegitarian"),
      allowNull: false,
    },
    daily_physical_activity: {
      type: DataTypes.ENUM("low", "sedentary", "moderate"),
      allowNull: false,
    },
    allergy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plan_type: {
      type: DataTypes.ENUM("1month", "3month"),
      allowNull: false,
    },
    final_price: {
      type: DataTypes.STRING,
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
    tableName: "diet_plan",
  });

  return diet_plan;
};
