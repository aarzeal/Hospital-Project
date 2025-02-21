const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tax_Details = sequelize.define(
    "Tax_Details", {
        Tax_Details_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Tax_IDR:{
        type:DataTypes.INTEGER,
        allowNull:true

    },
    From_Date:{
        type:DataTypes.DATE
    },
    To_Date:{
        type:DataTypes.DATE
    },
    Tax_Details_Leble:{
        type:DataTypes.STRING,
        allowNull:true

    },
    Serial_Number:{
        type:DataTypes.STRING,
        allowNull:true

    },
    Ledger_IDR:{
        type:DataTypes.INTEGER,
        allowNull:true

    },
    Is_Primary_Tax: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    tax_rate: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    
    Calculate_On: {
      type: DataTypes.STRING,
      allowNull: false,
   
    },
    Is_Current: {
      type: DataTypes.INTEGER,
      allowNull: false,
   
    }
  
  }, {
    tableName: 'tbl_Tax_Details',
    timestamps: false
  });

  return Tax_Details;
};
