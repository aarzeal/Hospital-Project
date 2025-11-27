const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const RolePermission = sequelize.define(
    "role_permission_table",   // Model name
    {
      role_permission_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_role",
          key: "role_id",
        },
      },

      module_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "userModules",
          key: "modules_Id",
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

      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "permissions",
          key: "permission_id",
        },
      },

      // SAME AS ROLE TABLE
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
      tableName: "role_permission_table", // final table name
      timestamps: true, // createdAt & updatedAt
    }
  );

  // Associations
  RolePermission.associate = (models) => {
    RolePermission.belongsTo(models.tbl_role, {
      foreignKey: "role_id",
      as: "role",
    });

    RolePermission.belongsTo(models.UserModules, {
      foreignKey: "module_id",
      as: "module",
    });

    RolePermission.belongsTo(models.UserSubModules, {
      foreignKey: "submodule_id",
      as: "submodule",
    });

    RolePermission.belongsTo(models.Permission, {
      foreignKey: "permission_id",
      as: "permission",
    });
  };

  return RolePermission;
};
