'use strict';

module.exports = (sequelize, DataTypes) => {
  const connection_data = sequelize.define("connection_data", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    otp: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    trainer_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    service_booking_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT, // better than INTEGER for status codes
      allowNull: false,
      defaultValue: 0, // 0: sent, 1: accepted, 2: rejected,3:completed
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "connection_data",
  });

  // ➕ Associations
  connection_data.associate = (models) => {
    connection_data.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
    });

    connection_data.belongsTo(models.Trainers, {
      foreignKey: "trainer_id",
      as: "trainer",
    });
    connection_data.belongsTo(models.Trainers, {
      foreignKey: "service_booking_id",
      as: "service_booking",
    });
  };

  return connection_data;
};
