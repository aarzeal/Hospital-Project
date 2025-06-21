const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const LabTestNotes = sequelize.define(
    "tbl_lab_test_notes",
    {
      lab_test_notes_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lab_test_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_lab_test_report: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      lab_test_report_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lab_test_note: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      remarks: {
        type: DataTypes.STRING,
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
      tableName: "tbl_lab_test_notes",
      timestamps: true,
    }
  );
  return LabTestNotes;
};
