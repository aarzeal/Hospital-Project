
// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const UserSubModules = sequelize.define('UserSubModules', {
//     submodule_id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     submodule_name: {
//       type: DataTypes.STRING,
//       allowNull: false
//     } ,
//     modules_Id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'userModules', // Table name of the Module model
//         key: 'modules_Id'
//       }
//     },
    
//     url: {
//       type: DataTypes.STRING,
     
//     }
//     ,
//     hospitalId: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     }
//   }, {
//     tableName: 'usersubmodules',
//     timestamps: false
//   });

//   return UserSubModules;
// };

// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const UserSubModules = sequelize.define('UserSubModules', {
//     submodule_id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     submodule_name: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     modules_Id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'userModules',
//         key: 'modules_Id'
//       }
//     },
//     url: {
//       type: DataTypes.STRING,
//     },
//     hospitalId: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     }
//   }, {
//     tableName: 'usersubmodules',
//     timestamps: false
//   });

//   return UserSubModules;
// };

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserSubModules = sequelize.define('UserSubModules', {
    submodule_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    submodule_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    modules_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'UserModules',
        key: 'modules_Id'
      }
    },
    url: {
      type: DataTypes.STRING
    },
    hospitalId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'userSubModules',
    timestamps: false
  });

  return UserSubModules;
};
