const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

let config = {
  host: "127.0.0.1",
  username: "root",
  password: "",
  database: "fitfinity_local",
  dialect: "mysql",
};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

const modelFiles = fs.readdirSync(__dirname).filter((file) => {
  return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
});

modelFiles.forEach((file) => {
  try {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  } catch (error) {
    console.error(`Error loading model file: ${file}`, error);
  }
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
