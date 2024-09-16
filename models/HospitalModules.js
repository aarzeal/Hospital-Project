
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
//     },
//     hospitalId: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     }
//   }, {
//     tableName: 'userModules',
//     timestamps: false
//   });

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

  // Associations
  UserModules.associate = (models) => {
    UserModules.hasMany(models.UserSubModules, {
      as: 'submodules',
      foreignKey: 'modules_Id'
    });
  };

  return UserModules;
};

