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
// const { DataTypes } = require("sequelize");


// module.exports = (sequelize) => {
//   return sequelize.define(
//     "Module",
//     {
//       modules_Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//       modules_name: { type: DataTypes.STRING, allowNull: false },
//       status: { type: DataTypes.BOOLEAN, defaultValue: true }
//     },
//     { tableName: "usermodules", timestamps: false }
//   );
// };

