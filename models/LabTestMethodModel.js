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
        allowNull: false,
      },
      lab_test_method_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remark: {
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
      // created_at: {
      //   type: DataTypes.DATE,
      //   defaultValue: DataTypes.NOW,
      //},
      updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // updated_at: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      // },
    },
    {
      tableName: "tbl_labtestmethod",
      timestamps: true,
    }
  );
  return LabTestMethod;
};
