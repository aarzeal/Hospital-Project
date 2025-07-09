const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const LabTestCategoryDetails = sequelize.define(
    "tbl_lab_test_category_details",
    {
      lab_test_category_details_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lab_test_category_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lab_test_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      tableName: "tbl_lab_test_category_details",
      timestamps: true,
    }
  );
  return LabTestCategoryDetails;
};
