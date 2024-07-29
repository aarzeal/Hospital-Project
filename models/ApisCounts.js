const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const CountAPI = sequelize.define('CountAPI', {
  Apiname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdby: {
    type: DataTypes.INTEGER, // Assuming createdby is the ID of the user who created the entry
    allowNull: true
  },
  ApiMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },

  HospitalId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ip: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  browser: {
    type: DataTypes.STRING,
    allowNull: true
  },
  os: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  createdAt: 'createdAt', // Customize the name of the createdAt field
  updatedAt: 'updatedAt'  // Customize the name of the updatedAt field
});

module.exports = CountAPI;
