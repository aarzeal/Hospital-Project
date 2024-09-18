const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Charges = sequelize.define('Charges', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Apiname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hospitalId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  chargeRate: {  // This will store the charge rate for the API
    type: DataTypes.DECIMAL(10, 2),  // Stores charges like 10.50
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Charges;
