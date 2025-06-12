const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const LabTestRefDetails = sequelize.define(
    "tbl_labtestrefdetails",
    {
        lab_test_ref_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
        lab_test_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
        ref_title:{
        type:DataTypes.STRING,
        allowNull:false,
      },
        ref_detail:{
        type:DataTypes.STRING,
        allowNull:false,
      },
        is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
        hospital_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
        hospital_group_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
        created_by: {
        type: DataTypes.STRING,
      },
        updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      tableName: "tbl_labtestrefdetails",
      timestamps: true,
    }
  );
  return LabTestRefDetails;
};