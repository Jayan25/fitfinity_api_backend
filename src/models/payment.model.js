const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      r_payment_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      r_order_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      r_signature: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      method: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      json_response: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      booked_service_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      service_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true, 
      tableName: "payments",
    }
  );

  return Payment;
};
