const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const LabTest = sequelize.define(
    "tbl_labtest",
    {
      lab_test_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lab_test_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      lab_test_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cpt_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lab_test_method_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      lab_test_unit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_multi_column: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      field_type: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_length: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      from_range: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      to_range: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_calculated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      formula: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      calculation_test_IDR: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      remark: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      used_for_calculation: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      detail_type: {
        type: DataTypes.INTEGER,
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
      //   created_at: {
      //     type: DataTypes.DATE,
      //     // defaultValue: DataTypes.NOW,
      //   },
      updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      //   updated_at: {
      //     type: DataTypes.DATE,
      //   },
    },
    {
      tableName: "tbl_labtest",
      timestamps: true,
    }
  );
  return LabTest;
};
