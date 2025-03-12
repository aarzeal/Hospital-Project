const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define("fin_year_Details", {
      fin_year_Detail_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fin_code_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      
      startMonth: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      
      endMonth: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      lock: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      is_Active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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
      tableName: "tbl_fin_year_Details",
      timestamps: false,
    });
  };