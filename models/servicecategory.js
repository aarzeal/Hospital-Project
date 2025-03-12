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
    , createdBy: {
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
    tableName: 'tbl_service_category',
    timestamps: false
  });

  return servicecategory;
};
