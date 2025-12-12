const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const UserPermission = sequelize.define(
    "UserPermission",   // Model name
    {
      user_permission_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      // tableName: "role_permission_table", // final table name
      // timestamps: true, // createdAt & updatedAt
       tableName: "user_permission_table",
    timestamps: true,
    // freezeTableName: true,  // ✅ ADD THIS LINE
    }
  );

  // Associations
  UserPermission.associate = (models) => {
    UserPermission.belongsTo(models.users, {
      foreignKey: "userId",
      as: "user",
    });


    UserPermission.belongsTo(models.UserSubModules, {
      foreignKey: "submodule_id",
      as: "submodule",
    });

    UserPermission.belongsTo(models.Permission, {
      foreignKey: "permission_id",
      as: "permission",
    });
  };

  return UserPermission;
};
