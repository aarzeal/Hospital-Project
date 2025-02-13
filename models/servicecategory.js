// const { DataTypes } = require("sequelize");
// const sequelize = require("../database/connection");
// const HospitalGroup = require("./HospitalGroup");

// const service_category = sequelize.define(
//   "service_category",
  // {
  //   service_category_id: {
  //     type: DataTypes.INTEGER,
  //     autoIncrement: true,
  //     primaryKey: true,
  //   },
  //   service_category_name: {
  //     type: DataTypes.STRING(50),
  //     allowNull: false,
  //   },
   
//     hospital_group_IDR: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: {
//           model: HospitalGroup, // FK reference to tblhospitalgroup
//           key: "HospitalGroupID",
//         },
      
//       },
//   },
//   {
//     tableName: "tbl_service_category",
//     timestamps: false,
//   }
// );

// service_category.belongsTo(HospitalGroup, { foreignKey: "hospital_group_IDR", as: "hospitalGroup" });



// module.exports = service_category;





const { DataTypes } = require('sequelize');
const HospitalGroup = require('./HospitalGroup'); // Ensure correct path

module.exports = (sequelize) => {
  const ServiceCategory = sequelize.define(
    'ServiceCategory',
    {
      service_category_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      service_category_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      hospital_group_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: HospitalGroup, // Ensure this is a valid Sequelize model
          key: 'HospitalGroupID',
        },
      },
    },
    {
      tableName: 'tblservice_category',
      timestamps: false,
    }
  );

  return ServiceCategory;
};

