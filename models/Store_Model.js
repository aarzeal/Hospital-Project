const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define("store", {
      store_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      store_name: {
        type: DataTypes.STRING(250),
        allowNull: false,
        unique: true,
      },
      store_code:{
        type: DataTypes.STRING(250),
      allowNull: false,
      unique: true,
      },    
      store_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      parent_Store_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_Main_store: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      is_Stock_Closing_Daily: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
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
      updatedAt: {  
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {  
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    }, 
    {
      tableName: "tbl_store",
      timestamps: false,
    });
  };