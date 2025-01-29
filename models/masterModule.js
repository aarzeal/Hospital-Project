const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection"); // Your Sequelize instance

const Module = sequelize.define(
  "Module",
  {
    module_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    module_name: { type: DataTypes.STRING },
  },
  { tableName: "modules", timestamps: false }
);

module.exports = Module;
