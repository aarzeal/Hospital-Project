const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define("financial_year", {
      fin_year_code_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fin_year: {
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
      tableName: "tbl_fin_year",
      timestamps: true,
    });
  };