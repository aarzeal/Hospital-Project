const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const servicecategory = sequelize.define('Service_category', {
    servicecategoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
   
    servicecategoryname: {
      type: DataTypes.STRING,
      allowNull: false,
   
    }
    ,
   
    HospitalGroupIDR: {
      type: DataTypes.STRING,
      allowNull: false,
   
    }

  }, {
    tableName: 'tbl_service_category',
    timestamps: false
  });

  return servicecategory;
};
