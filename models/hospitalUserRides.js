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
        model: 'Users', // Ensure this matches the actual table name
        key: 'userId'
      }
    },
    submodule_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'UserSubModules', // Ensure this matches the actual table name
        key: 'submodule_id'
      }
    },
    modules_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'UserModules', // Ensure this matches the actual table name
        key: 'modules_Id'
      }
    },
  }, {
    tableName: 'UserRides',
    timestamps: false
  });

  return UserRides;
};
