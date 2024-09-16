const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserRides = sequelize.define('UserRights', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId'
      }
    },
    submodule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'UserSubModules',
        key: 'submodule_id'
      }
    },
    modules_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'UserModules',
        key: 'modules_Id'
      }
    }
  }, {
    tableName: 'UserRights',
    timestamps: false
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
