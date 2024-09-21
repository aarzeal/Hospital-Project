const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection'); // Assuming you have your Sequelize instance in a db.js file

const Currency = sequelize.define('tblcurrency', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  currencyName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  currencyCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'tblcurrency',
  timestamps: false // If you don’t have createdAt and updatedAt fields in the table
});

module.exports = Currency;
