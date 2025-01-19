'use strict';

module.exports = (sequelize, DataTypes) => {
  const TrainerDocument = sequelize.define('TrainerDocument', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    trainer_id: {
      type: DataTypes.BIGINT, // Match with Trainers.id
      allowNull: false,
    },
    document_type: {
      type: DataTypes.ENUM('aadhar', 'pan', 'certificate', 'training_photo'),
      allowNull: true,
      defaultValue: null,
    },
    document_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verfication_status: { 
      type: DataTypes.ENUM('not uploaded', 'pending', 'success', 'failed'),
      allowNull: true,
      defaultValue: 'not uploaded',
    },
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'TrainerDocument', // Corrected table name
  });

  TrainerDocument.associate = (models) => {
    TrainerDocument.belongsTo(models.Trainers, {
      foreignKey: 'trainer_id',
      targetKey: 'id',
      as: 'trainer',
      constraints: false,
    });
  };

  return TrainerDocument;
};
