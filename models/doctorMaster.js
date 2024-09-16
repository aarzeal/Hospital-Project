const { DataTypes } = require('sequelize');
// const sequelize = require('../database/connection'); // Adjust the path as needed
const Hospital = require('./HospitalModel'); // Adjust the path to your hospital model

module.exports = (sequelize) => {
const DoctorMaster = sequelize.define('DoctorMaster', {
  DoctorID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  FirstName: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  MiddleName: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  LastName: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  Qualification: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Specialization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  Address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  WhatsAppNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  MobileNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  HospitalID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // references: {
    //   model: 'tblhospital', // Adjust to the actual name of your hospital table
    //   key: 'HospitalID'
    // }
  },
  DateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  LicenseNumber: {
    
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  YearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // HospitalGroupIDR: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  //   // references: {
  //   //   model: 'tblhospital', // Adjust to the actual name of your hospital table
  //   //   key: 'HospitalGroupIDR'
  //   // }
  // },
  IsActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  CreatedBy: {
    type: DataTypes.INTEGER,
    // allowNull: false
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
  }
}, {
  tableName: 'tblDoctorMaster',
  timestamps: false
});

return DoctorMaster;
};
