const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HelpSupport = sequelize.define(
    "HelpSupport",
    {
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      trainer_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: "trainers",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      userType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      query: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "inprogress", "resolved"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      timestamps: true,
      tableName: "help_support",
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  HelpSupport.associate = (models) => {
    HelpSupport.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      constraints: false,
    });

    HelpSupport.belongsTo(models.Trainers, {
      foreignKey: "trainer_id",
      as: "trainer",
      constraints: false,
    });
  };

  return HelpSupport;
};
