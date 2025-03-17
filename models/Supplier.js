
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Supplier = sequelize.define(
    "Supplier", {
        supplier_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    supplier_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    supplier_Code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    contact_Person: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_Person2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Remarks: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    GST_Number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    TIN_Number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    CST_Number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    service_Tax_Number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    pan_Number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    VAT_Number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    web_site: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    
ledger_IDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
     
    },
is_PurchesInvoice_SMS: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
     
    },
billPass_SMS: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
     
    },
update_onWhatapp: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
     
    },
    
    address1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.INTEGER,
      allowNull: true,
   
    },
    state: {
      type: DataTypes.INTEGER,
      allowNull: true,
    
    },
    country: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
   zip: {
      type: DataTypes.INTEGER,
      allowNull: true
     
    },
    phone1: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    phone2: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    Mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
   
    },
    whatapp_Number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    
    },
    email: {
      type: DataTypes.STRING,
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
    tableName: 'tbl_supplier',
    timestamps: false
  });

  return Supplier;
};

