"use strict";

module.exports = (sequelize, DataTypes) => {
  const ClassSubscription = sequelize.define(
    "class_subscriptions",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      services: {
        type: DataTypes.TEXT, // Stored as JSON string, e.g. ["hiit","zumba"]
        allowNull: false,
      },
      service_names: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      duration_months: {
        type: DataTypes.INTEGER,
        allowNull: false, // 6 or 12
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      order_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      payment_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "success", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "class_subscriptions",
    }
  );

  ClassSubscription.associate = (models) => {
    ClassSubscription.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      constraints: false,
    });
  };

  return ClassSubscription;
};
