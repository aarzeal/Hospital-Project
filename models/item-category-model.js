
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const item_category = sequelize.define(
    "item_category", {
    item_Category_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    item_Category_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    item_Category_Code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_PharamaItem: {
      type:DataTypes.BOOLEAN,
      allowNull: true,
    },
    is_LabItem: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
purches_ledger_IDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
    },
    sale_ledger_IDR: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: false,
      },
    discount_Allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      
    },
    
   hospital_IDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
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
    updatedAt: {  // ✅ Override Sequelize default behavior
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {  // ✅ Manually set createdAt as a timestamp
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

  
  }, {
    tableName: 'tbl_item_category',
    timestamps: false
  });

  return item_category;
};

