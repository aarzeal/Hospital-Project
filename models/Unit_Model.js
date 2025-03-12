
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Unit = sequelize.define(
    "Unit", {
    unit_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    unit_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    decimal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hospitalIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
     
    },
hospitalGroupIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
     
    },
 
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
   
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
   
    },
    updatedAt: {  // ✅ Override Sequelize default behavior
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {  // ✅ Manually set createdAt as a timestamp
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

  
  }, {
    tableName: 'tbl_unit',
    timestamps: false
  });

  return Unit;
};

