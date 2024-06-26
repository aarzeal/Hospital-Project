const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const empMaster = sequelize.define('empMaster', {
    empid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    add1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    add2: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mobile: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    emergency_contact: {
      type: DataTypes.STRING,
      allowNull: false
    },
    
    alternative_contact: {
      type: DataTypes.STRING,
      
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    region: {
      type: DataTypes.STRING,

    },
    country: {
      type: DataTypes.STRING,
     
    },
  }, {
    tableName: 'empmaster',
    timestamps: false
  });

  return empMaster;
};
// sequelize.sync()
//   .then(() => {
//     console.log('empmaster table has been successfully created, if it did not already exist.');
//   })
//   .catch(error => {
//     console.error('Unable to create the table:', error);
//   });