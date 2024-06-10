const { DataTypes, Model } = require('sequelize');
const createDynamicConnection = require('../database/dynamicConnection');
const Module = require('./HospitalModules'); // Import the Module model

const { sequelize } = createDynamicConnection();

class Submodule extends Model {}

Submodule.init({
  submodule_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  submodule_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  module_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Modules', // Table name of the Module model
      key: 'module_id'
    }
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Submodule',
  tableName: 'submodules', // Set the table name explicitly
  timestamps: false // Disable timestamps (createdAt, updatedAt)
});

// Automatically create the table if it doesn't exist
Submodule.sync({ alter: true });



module.exports = Submodule;
