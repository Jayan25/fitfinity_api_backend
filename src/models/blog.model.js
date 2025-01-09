const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Blog = sequelize.define(
    "Blog",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      short_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      data_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true, // Adds createdAt and updatedAt automatically
      tableName: "blogs", // MySQL table name
    }
  );

  return Blog;
};
