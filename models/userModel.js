const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const User = sequelize.define('User', {
  UserID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // other columns can be defined here
}, {
  tableName: 'User',
  timestamps: false
});

module.exports = User;
