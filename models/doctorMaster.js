const { DataTypes } = require('sequelize');
// const sequelize = require('../database/connection'); // Adjust the path as needed
const Hospital = require('./HospitalModel'); // Adjust the path to your hospital model
const path = require('path');
const fs = require('fs');

try {
  const configPath = path.join(__dirname, '../config/employeeConfig.json');
  const configFile = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configFile);

} catch (error) {

  console.error('Error loading employeeConfig.json:', error);
  throw error; // Ensure errors are thrown to halt further execution if config loading fails
}


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
  Qualification: 
  {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      isValidQualification(value) {
        if (!config || !config.Qualification) {
          throw new Error('Configuration for Qualification is missing or invalid.');
        }
        const validQualification = Object.keys(config.Qualification).map(Number);
        if (!validQualification.includes(value)) {
          throw new Error(`Invalid Qualification value: ${value}. Valid values are: ${validQualification.join(', ')}`);
        }
      },
    }
  },
  // {
  //   type: DataTypes.STRING,
  //   allowNull: false
  // },
  // Specialization: {
  //   type: DataTypes.STRING,
  //   allowNull: false
  // },

  Specialization: {
    type: DataTypes.INTEGER,
    references: {
      model: 'tblspecialty', // Name of the referenced table
      key: 'SpecialtyId'     // Primary key in the referenced table
    },
    allowNull: true
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
  // Gender: {
  //   type: DataTypes.STRING,
  //   allowNull: false
  // },
  Gender: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      isValidGender(value) {
        if (!config || !config.Gender) {
          throw new Error('Configuration for Gender is missing or invalid.');
        }
        const validGenders = Object.keys(config.Gender).map(Number);
        if (!validGenders.includes(value)) {
          throw new Error(`Invalid gender value: ${value}. Valid values are: ${validGenders.join(', ')}`);
        }
      },
    }
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
