const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ApisList = sequelize.define('ApisList', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Apisname: {
    type: DataTypes.STRING,
    allowNull: false
  }
  ,Method: {
    type: DataTypes.STRING,
    
  }
}, {
  timestamps: true // This will add `createdAt` and `updatedAt` fields
});

module.exports = ApisList;
