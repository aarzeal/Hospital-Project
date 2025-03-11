// const { DataTypes } = require("sequelize");
// const sequelize = require("../database/connection");
// const HospitalGroup = require("./HospitalGroup");

// const AccLedger = sequelize.define(
//   "AccLedger",
//   {
//     ledger_id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     ledger_name: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     ledger_alias: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     ledger_cheque: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     maintain_bill_wise: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false,
//     },
//     isdiscount_ledger: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false,
//     },
//     remark: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     is_tax_aplicable: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false,
//     },
//     taxplan_IDR: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },
//     creditperied: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     hospital_group_IDR: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: {
//           model: HospitalGroup, // FK reference to tblhospitalgroup
//           key: "HospitalGroupID",
//         },
//         // onUpdate: "CASCADE",
//         // onDelete: "SET NULL",
//       },
//   },
//   {
//     tableName: "tbl_acc_ledger",
//     timestamps: false,
//   }
// );

// AccLedger.belongsTo(HospitalGroup, { foreignKey: "hospital_group_IDR", as: "hospitalGroup" });

// // const syncTable = async () => {
// //     try {
// //       await sequelize.authenticate();
// //       console.log("Database connection established successfully.");
      
// //       await sequelize.sync({ alter: true }); // Create or update table structure
// //       console.log("tbl_acc_ledger table synchronized successfully.");
// //     } catch (error) {
// //       console.error("Error syncing tbl_acc_ledger:", error);
// //     }
// //   };
  
// //   syncTable();

// module.exports = AccLedger;

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AccLedger = sequelize.define(
    "AccLedger", {
    ledger_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ledger_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ledger_alias: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ledger_cheque: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    maintain_bill_wise: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isdiscount_ledger: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    remark: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_tax_aplicable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    taxplan_IDR: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    creditperied: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    HospitalGroupIDR: {
      type: DataTypes.STRING,
      allowNull: false,
   
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
   
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
   
    },
    updatedAt: {  // ✅ Override Sequelize default behavior
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {  // ✅ Manually set createdAt as a timestamp
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
   

  
  }, {
    tableName: 'tbl_acc_ledger',
    timestamps: false
  });

  return AccLedger;
};

