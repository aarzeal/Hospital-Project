const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./userModel');

const HospitalGroup = sequelize.define('tblHospitalGroup', {
  HospitalGroupID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  HospitalGroupName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  LicensedHospitalCount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  CreatedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  CreatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'UserID'
    }
  }
}, {
  tableName: 'tblHospitalGroup',
  timestamps: false
});

module.exports = HospitalGroup;