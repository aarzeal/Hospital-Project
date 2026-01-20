const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const UserFieldPermission = sequelize.define(
    "UserFieldPermission",
    {
      user_field_permission_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      field_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

     userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "userId",
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

      // ✅ SAME ENUM (keep consistency)
      permission: {
        type: DataTypes.ENUM(
          "create",
          "read",
          "update",
          "delete",
          "display",
          "no_access",
          "disable"
        ),
        allowNull: false,
      },

      field_type: {
        type: DataTypes.STRING, // text, dropdown, checkbox etc
        allowNull: false,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
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
      tableName: "user_fields_permission_table",
      timestamps: true,
    }
  );

  UserFieldPermission.associate = (models) => {

    UserFieldPermission.belongsTo(models.users, {
      foreignKey: "userId",
      as: "user",
    });


    UserFieldPermission.belongsTo(models.UserSubModules, {
      foreignKey: "submodule_id",
      as: "submodule",
    });
  };

  return UserFieldPermission;
};
