// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const UserModules = sequelize.define('UserModules', {
//     modules_Id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     modules_name: {
//       type: DataTypes.STRING,
//       allowNull: false
//     }
//     ,
//     hospitalId: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     }
//   }, {
//     tableName: 'userModules',
//     timestamps: false
//   });
//   UserModules.hasMany(UserSubModules, { as: 'submodules', foreignKey: 'moduleId' });

//   return UserModules;
// };
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserModules = sequelize.define('UserModules', {
    modules_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    modules_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hospitalId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'userModules',
    timestamps: false
  });

  return UserModules;
};

