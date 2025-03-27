
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ward = sequelize.define(
    "Ward", {
        ward_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    wardName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wardTypeIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serviceIDR: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    floorIDR: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bedCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bedCapacityperRoom: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isEffective: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    checkinTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    isNUrChargeApplication: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
   
    
   hospital_IDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
   
    },
    hospitalGroup_IDR: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
   
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
   
    },
    Non_Active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
   
    },
    UpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },

  
  }, {
    tableName: 'tbl_Ward',
    timestamps: false
  });

  return Ward;
};

