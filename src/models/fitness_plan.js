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
      type: {
        type: DataTypes.ENUM("muscle building", "weight loss"),
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
