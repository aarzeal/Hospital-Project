const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const LabSampleType = sequelize.define(
    "tbl_lab_sample_type",
    {
      lab_sample_type_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lab_sample_type: {
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
      tableName: "tbl_lab_sample_type",
      timestamps: true,
    }
  );
  return LabSampleType;
};
