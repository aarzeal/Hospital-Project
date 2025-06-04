const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const LabTestMethod = sequelize.define(
    "tbl_labtestmethod",
    {
      lab_test_method_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lab_test_method_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      lab_test_method_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      remark: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hospital_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hospital_group_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_By: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Created_At: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_By: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Updated_At: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "tbl_labtestmethod",
      timestamps: false,
    }
  );
  return LabTestMethod;
};
