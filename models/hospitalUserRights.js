// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const UserRides = sequelize.define('UserRights', {
//     Id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'Users',
//         key: 'userId'
//       }
//     },
//     submodule_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'UserSubModules',
//         key: 'submodule_id'
//       }
//     },
//     modules_Id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'UserModules',
//         key: 'modules_Id'
//       }
//     }
//   }, {
//     tableName: 'UserRights',
//     timestamps: false
//   });

//   // Associations
//   UserRides.associate = (models) => {
//     UserRides.belongsTo(models.UserModules, {
//       as: 'module',
//       foreignKey: 'modules_Id'
//     });
//     UserRides.belongsTo(models.UserSubModules, {
//       as: 'submodule',
//       foreignKey: 'submodule_id'
//     });
//   };

//   return UserRides;
// };

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserRides = sequelize.define('UserRights', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,        // sir ke table me auto increment tha
      field: 'UserRightID'        // sir ke naam se map
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'UserID'
      },
      field: 'UserID'
    },
    submodule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SubModules',
        key: 'SubModuleID'
      },
      field: 'SubModuleID'
    },
    modules_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'UserModules',
        key: 'modules_Id'
      }
    },

    // ⭐ NEW FIELD 1 → PermissionID
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Permissions',
        key: 'PermissionID'
      },
      field: 'PermissionID'
    },

    // ⭐ NEW FIELD 2 → IsAllowed
    isAllowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'IsAllowed'
    }

  }, {
    tableName: 'UserRights',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['UserID', 'SubModuleID', 'PermissionID']
      }
    ]
  });

  // Associations
  UserRides.associate = (models) => {
    UserRides.belongsTo(models.UserModules, {
      as: 'module',
      foreignKey: 'modules_Id'
    });

    UserRides.belongsTo(models.UserSubModules, {
      as: 'submodule',
      foreignKey: 'submodule_id'
    });

    UserRides.belongsTo(models.Permissions, {
      as: 'permission',
      foreignKey: 'permissionId'
    });
  };

  return UserRides;
};



// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const UserRides = sequelize.define('UserRights', {
//     Id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'Users',
//         key: 'userId'
//       }
//     },
//     submodule_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'UserSubModules',
//         key: 'submodule_id'
//       }
//     },
//     modules_Id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'UserModules',
//         key: 'modules_Id'
//       }
//     }
//   }, {
//     tableName: 'UserRights',
//     timestamps: false
//   });

//   // Associations
//   UserRides.associate = (models) => {
//     UserRides.belongsTo(models.UserModules, {
//       as: 'module',
//       foreignKey: 'modules_Id'
//     });
//     UserRides.belongsTo(models.UserSubModules, {
//       as: 'submodule',
//       foreignKey: 'submodule_id'
//     });
//   };

//   return UserRides;
// };
