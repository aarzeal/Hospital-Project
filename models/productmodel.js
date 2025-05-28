const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Product = sequelize.define('invProductCompany', {
    id: {
         type: DataTypes.INTEGER, 
         autoIncrement: true, 
         primaryKey: true 
        },
    productName: {
         type: DataTypes.STRING, 
         allowNull: false 
        },
    price: {
         type: DataTypes.FLOAT, 
         allowNull: false 
        }
  }, {
    tableName: 'invProductCompany',
    timestamps: false
  });

  return Product;
};
