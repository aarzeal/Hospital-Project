const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");
const Module = require("./masterModule"); // Import the Module model

const Submodule = sequelize.define(
  "Submodule",
  {
    submodule_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    submodule_name: { type: DataTypes.STRING },
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "modules", // Corrected to match the actual table name
        key: "module_id",
      },
    },
  },
  { tableName: "submodule", timestamps: false }
);

  Module.hasMany(Submodule, { foreignKey: "module_id", onDelete: "CASCADE" });
  Submodule.belongsTo(Module, { foreignKey: "module_id" ,as: "Module"});

module.exports = Submodule;

// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const Module = require("./masterModule")(sequelize); // Ensure proper initialization

//   const Submodule = sequelize.define(
//     "Submodule",
//     {
//       submodule_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//       submodule_name: { type: DataTypes.STRING, allowNull: false },
//       modules_Id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//           model: "usermodules", // Ensure this matches the table name
//           key: "modules_Id",
//         },
//       },
//       status: { type: DataTypes.BOOLEAN, defaultValue: true },
//     },
    
//     { tableName: "usersubmodules", timestamps: false }
//   );

//   // ✅ Define associations
//   Module.hasMany(Submodule, { foreignKey: "module_id", onDelete: "CASCADE" });
//   Submodule.belongsTo(Module, { foreignKey: "module_id" });

//   return Submodule;
// };

