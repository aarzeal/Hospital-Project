const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const LabTestCategory = sequelize.define(
    "tbl_lab_test_category",
    {
      lab_test_category_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lab_test_category_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lab_test_category_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fit_to_hundred: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remarks: {
        type: DataTypes.STRING,
        allowNull: true,
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
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "tbl_lab_test_category",
      timestamps: true,
    }
  );
  return LabTestCategory;
};
