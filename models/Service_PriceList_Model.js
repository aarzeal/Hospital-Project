const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define("Service_Price_List", {
      service_price_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      service_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      First_Emergency_Rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Second_Emergency_Rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      From_Date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      To_Date: {
        type: DataTypes.DATE,
        allowNull: true,
       
      },
      is_current_Format: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
       
      },
      hospitalIDR: {
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
      
    }, {
      tableName: "tbl_service_price_List",
      timestamps: true,
    });
  };