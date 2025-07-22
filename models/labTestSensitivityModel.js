const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const LabTestSensitivity   = sequelize.define(
    "tbl_lab_test_sensitivity",
    {
      lab_test_sensitivity_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sensivity_pattern: {
        type: DataTypes.STRING(50),
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
      tableName: "tbl_lab_test_sensitivity",
      timestamps: true,
      createdAt: "CreatedAt",
      updatedAt: "UpdatedAt",
    }
  );
  return LabTestSensitivity;
};
