// models/ApisRates.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection'); // Adjust the path as necessary
const CountAPI = require('./ApisCounts'); // Import CountAPI model for association


const ApisRates = sequelize.define('ApisRates', {
    Apiname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    HospitalId: {
      type: DataTypes.INTEGER,
    //   references: {
    //     model: CountAPI,
    //     key: 'hospitalId',
    //   },
    
      allowNull: false,
    },
  }, {
    timestamps: false,
  });
  
//   CountAPI.hasMany(ApisRates, {
//     foreignKey: 'HospitalId',
//     as: 'apiRates',
//   });
  
//   ApisRates.belongsTo(CountAPI, {
//     foreignKey: 'HospitalId',
//     as: 'countApi',
//   });
  
  module.exports = ApisRates;