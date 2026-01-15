const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const RoleFieldPermission = sequelize.define(
    "RoleFieldPermission",   
    {
      role_field_permission_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

       field_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

         role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_role",
          key: "role_id",
        },
      },

        submodule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "userSubModules",
          key: "submodule_id",
        },
      },

       // ✅ ENUM PERMISSION
      permission: {
        type: DataTypes.ENUM(
          "create",
          "read",
          "update",
          "delete",
          "display",
          "no_access",  // ✅ Added for blacklist approach
          "disable",
        ),
        allowNull: false,
      },

        field_type: {
        type: DataTypes.STRING, // text, dropdown, checkbox, radio, multiselect, file, etc
        allowNull: false,
      },


      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
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

       tableName: "role_fields_permission_table",
    timestamps: true,
    }
  );

  RoleFieldPermission.associate = (models) => {

    RoleFieldPermission.belongsTo(models.tbl_role, {
      foreignKey: "role_id",
      as: "role",
    });

    RoleFieldPermission.belongsTo(models.UserSubModules, {
      foreignKey: "submodule_id",
      as: "submodule",
    });
  };

  return RoleFieldPermission;
};
