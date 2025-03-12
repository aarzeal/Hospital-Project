
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define("Service", {
      taxMap_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      item_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tax_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hospital_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
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
      updatedAt: {  // ✅ Override Sequelize default behavior
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {  // ✅ Manually set createdAt as a timestamp
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    
    }, {
      tableName: "tbl_ItemTax_Map",
      timestamps: false,
    });
  };