const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection"); // Your Sequelize instance

const Module = sequelize.define(
  "Submodule",
  {
    submodule_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    submodule_name: { type: DataTypes.STRING },
  },
  { tableName: "submodule", timestamps: false }
);

module.exports = Module;
