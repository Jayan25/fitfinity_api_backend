const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Payment = sequelize.define(
    "Payment",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      trainer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      service_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      payment_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "INR",
      },
      service_booking_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      diet_plan_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      // NEW: fitness_plan_id to associate payments created for fitness plans
      fitness_plan_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "payments",
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
    });

    Payment.belongsTo(models.Trainers, {
      foreignKey: "trainer_id",
      as: "trainer",
    });

    Payment.belongsTo(models.service_bookings, {
      foreignKey: "service_booking_id",
      as: "service_booking",
    });

    Payment.belongsTo(models.diet_plan, {
      foreignKey: "diet_plan_id",
      as: "diet_plan",
    });

    // NEW: association to fitness_plan
    Payment.belongsTo(models.fitness_plan, {
      foreignKey: "fitness_plan_id",
      as: "fitness_plan",
    });
  };

  return Payment;
};
