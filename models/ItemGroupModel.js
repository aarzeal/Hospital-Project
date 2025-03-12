
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Itemgroup = sequelize.define(
    "Itemgroup", {
    Item_Group_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    group_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    parent_groupIDR: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hospitalIDR: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
   
    Non_Active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    
    HospitalGroupIDR: {
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
    tableName: 'tbl_Item_Group',
    timestamps: false
  });

  return Itemgroup;
};

