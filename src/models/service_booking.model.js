'use strict';

module.exports = (sequelize, DataTypes) => {
  const service_bookings = sequelize.define("service_bookings", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_name :{
      type: DataTypes.STRING,
      allowNull:false,
    },

    user_id: {
      type: DataTypes.BIGINT, // No references
      allowNull: false,
    },
    trainer_id: {
      type: DataTypes.BIGINT, // No references
      allowNull: true,
    },
    booking_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    service_type: {
      type: DataTypes.ENUM("fitness", "yoga", "diet"),
      allowNull: false,
    },
    preferred_time_to_be_served: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    training_for: {
      type: DataTypes.ENUM("male", "female", "couple", "group"),
      allowNull: false,
    },
    trial_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    trial_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    trainer_type: {
      type: DataTypes.ENUM("basic", "standard", "premium", "couple/group"),
      allowNull: false,
    },
    training_needed_for: {
      type: DataTypes.ENUM("self", "other"),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "inprocess", "failed", "success"),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    landmark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trial_taken: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    service_taken: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    service_booking_step: {
      type: DataTypes.ENUM("1", "2", "3", "4"),
      allowNull: false,
    }
  }, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "service_bookings",
  });

  service_bookings.associate = (models) => {
    // Relation with User (without enforcing FK in DB)
    service_bookings.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      constraints: false, // Prevents enforcing foreign key at the DB level
    });

    // Relation with Trainer (without enforcing FK in DB)
    service_bookings.belongsTo(models.Trainers, {
      foreignKey: "trainer_id",
      as: "trainer",
      constraints: false, // Prevents enforcing foreign key at the DB level
    });

    service_bookings.hasMany(models.Payment, {
      foreignKey: "service_booking_id",
      as: "payments",
    });
    
  };

  return service_bookings;
};
