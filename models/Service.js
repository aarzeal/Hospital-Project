const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");
const AccLedger = require("./AccLedger");
const servicecategory = require("./servicecategory");
const HospitalGroup = require("./HospitalGroup");

const Service = sequelize.define(
  "Service",
  {
    service_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    service_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    service_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    service_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    service_category_IDR: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      references: {
        model: servicecategory, // Foreign Key reference
        key: "service_category_id",
      },
    },
    service_charge_applicable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    service_tax_applicable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    non_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ledger_IDR: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: AccLedger, // Foreign Key reference
        key: "ledger_id",
      },
   
    },
    hospital_group_IDR: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: HospitalGroup, // Foreign Key reference
        key: "hospitalGRoupId",
      },
      
    },
  },
  {
    tableName: "tbl_services",
    timestamps: false,
  }
);

// Define Relationships
Service.belongsTo(AccLedger, { foreignKey: "ledger_IDR", as: "ledger" });
Service.belongsTo(servicecategory, { foreignKey: "service_category_IDR", as: "servicecategory" });
Service.belongsTo(HospitalGroup, { foreignKey: "hospital_group_IDR", as: "hospitalGroup" });



module.exports = Service;
// const { DataTypes } = require('sequelize');
// module.exports = (sequelize) => {
//     return sequelize.define("Service", {
//       service_id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       service_code: {
//         type: DataTypes.STRING(50),
//         allowNull: false,
//       },
//       service_name: {
//         type: DataTypes.STRING(100),
//         allowNull: false,
//       },
//       service_type: {
//         type: DataTypes.STRING(50),
//         allowNull: false,
//       },
//       service_category_IDR: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//       },
//       service_charge_applicable: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false,
//       },
//       service_tax_applicable: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false,
//       },
//       non_active: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false,
//       },
//       ledger_IDR: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//       },
//       HospitalGroupIDR: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//     }, {
//       tableName: "tbl_services",
//       timestamps: false,
//     });
//   };