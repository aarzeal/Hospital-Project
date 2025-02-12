const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");
const HospitalGroup = require("./HospitalGroup");

const AccLedger = sequelize.define(
  "AccLedger",
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
          model: HospitalGroup, // FK reference to tblhospitalgroup
          key: "HospitalGroupID",
        },
      
      },
  },
  {
    tableName: "tbl_service_category",
    timestamps: false,
  }
);

AccLedger.belongsTo(HospitalGroup, { foreignKey: "hospital_group_IDR", as: "hospitalGroup" });



module.exports = AccLedger;
