'use strict';

module.exports = (sequelize, DataTypes) => {
  const fitness_plan = sequelize.define(
    "fitness_plan",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("muscle building", "weight loss"),
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
      height: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      weight: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      any_body_pain: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      any_enquiry: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      goal: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      last_workout: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      daily_physical_activity: {
        type: DataTypes.ENUM("low", "sedentary", "moderate"),
        allowNull: false,
      },
      medical_condition: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      plan_type: {
        type: DataTypes.ENUM("1month", "3month"),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "fitness_plans",
      underscored: true,
    }
  );

  // 🔗 Associations
  fitness_plan.associate = (models) => {
    // Each fitness plan belongs to a user
    fitness_plan.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
    });

    // A fitness plan can have many payments
    // IMPORTANT: this relies on Payment model having a `fitness_plan_id` column
    fitness_plan.hasMany(models.Payment, {
      foreignKey: "fitness_plan_id",
      as: "payments",
    });
  };

  return fitness_plan;
};
