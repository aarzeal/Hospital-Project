const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Role = sequelize.define(
    "tbl_role",
    {
      role_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      role_name: {
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
      tableName: "tbl_role",
      timestamps: true, // createdAt + updatedAt automatic
    }
  );

  return Role;
};
