const { DataTypes } = require('sequelize');
const Hospital = require('./HospitalModel'); // Adjust the path to your hospital model

module.exports = (sequelize) => {
  const Designation = sequelize.define('Designation', {
    DesignationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Designationname: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    DesignationCode: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    CreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    EditedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    EditedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    HospitalIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: {
      //   model: 'tblhospital', // Adjust to the actual name of your hospital table
      //   key: 'HospitalID'
      // }
    }
  }, {
    tableName: 'tbldesignation',
    timestamps: false
  });

  return Designation;
};
