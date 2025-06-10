const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const AgeGroup = sequelize.define(
    "tbl_age_group",
    {
      age_group_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      age_group_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      from_age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      to_age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      age_from_type:{
        type:DataTypes.STRING,
        allowNull:false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      is_any_age_group: {
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
      tableName: "tbl_age_group",
      timestamps: true,
    }
  );
  return AgeGroup;
};
