
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Item = sequelize.define(
    "Item", {
    Item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Item_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    Item_alias: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    Item_Description: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    Item_Code: {
      type: DataTypes.STRING,
      allowNull: true,
     
    },
    Non_Active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    
    HospitalGroupIDR: {
      type: DataTypes.STRING,
      allowNull: false,
   
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

  
  }, {
    tableName: 'tbl_Item',
    timestamps: true
  });

  return Item;
};

