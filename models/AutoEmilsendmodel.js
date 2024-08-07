const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Report = sequelize.define('Report', {
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Report;
