const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserRides = sequelize.define('UserRides', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
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
      type: DataTypes.STRING,
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
    },
  }, {
    tableName: 'UserRides',
    timestamps: false
  });

  return UserRides;
};
