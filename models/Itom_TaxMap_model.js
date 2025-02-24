const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tax_Details = sequelize.define(
    "Tax_Details", {
        Itom_Taxmap_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Itom_IDR:{
        type:DataTypes.INTEGER,
        allowNull:true

    },
    Tax_Plan_IDR:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    Hospital_IDR:{
        type:DataTypes.INTEGER,
        allowNull:true
    },

  }, {
    tableName: 'tbl_Itom_Taxmap',
    timestamps: false
  });

  return Tax_Details;
};
