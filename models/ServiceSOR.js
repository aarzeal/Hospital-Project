
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ServiceSOR = sequelize.define(
    "ServiceSOR", {
        serviceSOR_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    serviceRate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serviceIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    firstEmergancyRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    secondEmergancyRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    classIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isNotApplicable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    fromDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    toDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isEffectiveNow: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    versionNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    isCashPriceList: {
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
    tableName: 'tbl_servicesor',
    timestamps: false
  });

  return ServiceSOR;
};

