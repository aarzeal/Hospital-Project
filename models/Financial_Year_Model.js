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
      updatedAt: {  // ✅ Override Sequelize default behavior
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {  // ✅ Manually set createdAt as a timestamp
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      
      
    }, {
      tableName: "tbl_fin_year",
      timestamps: false,
    });
  };