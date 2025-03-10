const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tax = sequelize.define(
    "Tax", {
    tax_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tax_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    tax_rate: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    
    HospitalIDR: {
      type: DataTypes.STRING,
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
  
  }, {
    tableName: 'tbl_tax',
    timestamps: true
  });

  return Tax;
};
