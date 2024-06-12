const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hospitalId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'users',
    timestamps: false
  });

  return User;
};
