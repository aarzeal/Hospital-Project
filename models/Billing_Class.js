
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const billing_class = sequelize.define(
    "billing_class", {
    billing_Class_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    billing_Class_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    billing_Class_Code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    contact_Person: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    billing_Class_Category: {
      type: DataTypes.STRING,
      allowNull: false,
     
    },
ledger_IDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
    },
    is_Cashless: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    Cost_Base: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_Reimbursement: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    is_Pharamcy_Cash_Allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    is_Pharamcy_Cashless_Allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
   
    },
    cashless_Applicable_On: {
      type: DataTypes.STRING,
      allowNull: true,
    
    },
    issTax_Applicable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
   sTax_On_Billtype: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sTax_On_OPD: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    sTax_On_IPD: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    sTax_On_CheckUp: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
   
    }
    ,
    is_Copay_AllowedOn_OPD: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    
    },
    is_Copay_AllowedOn_IPD: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    is_Copay_AllowedOn_Pharamcy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
      type: DataTypes.STRING,
      allowNull: false,
   
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
   zip: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
    },
    phone1: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    phone2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Mobile: {
      type: DataTypes.INTEGER,
      allowNull: false,
   
    },
    whatapp_Number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
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
    currancy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rate_baseOn: {
      type: DataTypes.STRING,
      allowNull: false,
   
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
   
    },

  
  }, {
    tableName: 'tbl_billing_class',
    timestamps: true
  });

  return billing_class;
};

