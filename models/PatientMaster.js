const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const tblHospital = require('./HospitalModel'); // Import the HospitalGroup model
const path = require('path');
const fs = require('fs');

let config;

try {
  const configPath = path.join(__dirname, '../config/employeeConfig.json');
  const configFile = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configFile);

} catch (error) {

  console.error('Error loading employeeConfig.json:', error);
  throw error; // Ensure errors are thrown to halt further execution if config loading fails
}


const PatientMaster = sequelize.define('Patient_masternew', {
  PatientID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  EMRNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Ensure EMRNumber is unique
  },
  HospitalGroupIDR: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: tblHospital,
      key: 'HospitalGroupIDR'
    }
  },
  HospitalID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: tblHospital,
      key: 'HospitalID'
    }
  },
  PatientFirstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true // Ensure this field is not empty
    }
  },
  PatientMiddleName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  PatientLastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true // Ensure this field is not empty
    }
  },
  Age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0, // Ensure age is a non-negative integer
      notNull: true // Ensure this field is not null
    }
  },
  DOB: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true, // Ensure this field is a valid date
      notNull: true // Ensure this field is not null
    }
  },
  BloodGroup: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isBloodGroup(value) {
        if (!config || !config.BloodGroup) {
          throw new Error('Configuration for Gender is missing or invalid.');
        }
        const validBloodGroup = Object.keys(config.BloodGroup).map(Number);
        if (!validBloodGroup.includes(value)) {
          throw new Error(`Invalid gender value: ${value}. Valid values are: ${validBloodGroup.join(', ')}`);
        }
      },
    }
  },
  // Gender: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  //   validate: {
  //     isIn: [['Male', 'Female', 'Other']], // Ensure valid gender
  //     notEmpty: true // Ensure this field is not empty
  //   }
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
  Phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^[0-9]{10}$/, // Validate phone number format
      notEmpty: true // Ensure this field is not empty
    }
  },
  WhatsappNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[0-9]{10}$/ // Validate WhatsApp number format
    }
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true, // Ensure this field is a valid email address
      notEmpty: true // Ensure this field is not empty
    }
  },
  AcceptedPolicy: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false // Set default value to false
  },
  IsCommunicationAllowed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false // Set default value to false
  },
  PatientAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true // Ensure this field is not empty
    }
  },
  EmergencyContactName: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      notEmpty: true // Ensure this field is not empty if provided
    }
  },
  EmergencyContactPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[0-9]{10}$/, // Validate phone number format
      notEmpty: true // Ensure this field is not empty if provided
    }
  },
  InsuranceProvider: {
    type: DataTypes.STRING,
    allowNull: true
  },
  InsurancePolicyNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  MedicalHistory: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  CurrentMedications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  MaritalStatus: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      isValidMaritalStatus(value) {
        if (!config || !config.MaritalStatus) {
          throw new Error('Configuration for MaritalStatus is missing or invalid.');
        }
        const validMaritalStatus = Object.keys(config.MaritalStatus).map(Number);
        if (!validMaritalStatus.includes(value)) {
          throw new Error(`Invalid MaritalStatus value: ${value}. Valid values are: ${validMaritalStatus.join(', ')}`);
        }
      },
    }
  },
  Occupation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Nationality: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      isValidNationality(value) {
        if (!config || !config.Nationality) {
          throw new Error('Configuration for Gender is missing or invalid.');
        }
        const validNationality = Object.keys(config.Nationality).map(Number);
        if (!validNationality.includes(value)) {
          throw new Error(`Invalid Nationality value: ${value}. Valid values are: ${validNationality.join(', ')}`);
        }
      },
    }
  },
  Language: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true // Allow createdBy to be nullable
  }
  ,
    Reserve1 : {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Reserve2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Reserve3: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    Reserve4: {
      type: DataTypes.STRING(30),
      allowNull: true
    }
  
    // sequelize,
    // modelName: 'PatientMaster',
    // tableName: 'Patient_master',
    // timestamps: true,
    // hooks: {
    //   beforeValidate: (patient, options) => {
    //     // Generate EMRNumber if not provided
    //     if (!patient.EMRNumber) {
    //       patient.EMRNumber = generateEMRNumber(patient.HospitalGroupID);
    //     }
    //   }
    // }
}, {
  tableName: 'Patient_masternew', // Specify the table name if different from the model name
  timestamps: true // Enable timestamps (createdAt, updatedAt)
});


tblHospital.hasMany(PatientMaster, { foreignKey: 'HospitalGroupIDR' });
PatientMaster.belongsTo(tblHospital, { foreignKey: 'HospitalGroupIDR' });

tblHospital.hasMany(PatientMaster, { foreignKey: 'HospitalID' });
PatientMaster.belongsTo(tblHospital, { foreignKey: 'HospitalID' });

async function syncDatabase() {
  await sequelize.sync(); // Ensure the tables are created
}

syncDatabase().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Failed to sync database:', err);
}
);


module.exports = PatientMaster;


// const { DataTypes } = require('sequelize');
// const sequelize = require('../database/connection');
// const Hospital = require('./HospitalModel'); // Import the Hospital model
// const HospitalGroup = require('./HospitalGroup'); // Import the HospitalGroup model

// const definePatientMaster = () => {
//   const PatientMaster = sequelize.define('Patient_master', {
//     PatientID: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     PatientName: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     EMRNumber: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true // Ensure EMRNumber is unique
//     },
//     HospitalID: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: Hospital, // Reference to the Hospital model
//         key: 'HospitalID'
//       }
//     },
//     PatientFirstName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       validate: {
//         notEmpty: true // Ensure this field is not empty
//       }
//     },
//     PatientLastName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       validate: {
//         notEmpty: true // Ensure this field is not empty
//       }
//     },
//     Age: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       validate: {
//         min: 0, // Ensure age is a non-negative integer
//         notNull: true // Ensure this field is not null
//       }
//     },
//     BirthDate: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       validate: {
//         isDate: true, // Ensure this field is a valid date
//         notNull: true // Ensure this field is not null
//       }
//     },
//     BloodGroup: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       validate: {
//         isIn: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']], // Ensure valid blood group
//         notEmpty: true // Ensure this field is not empty
//       }
//     },
//     Gender: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       validate: {
//         isIn: [['Male', 'Female', 'Other']], // Ensure valid gender
//         notEmpty: true // Ensure this field is not empty
//       }
//     },
//     Phone: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       validate: {
//         is: /^[0-9]{10}$/, // Validate phone number format
//         notEmpty: true // Ensure this field is not empty
//       }
//     },
//     WhatsappNumber: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       validate: {
//         is: /^[0-9]{10}$/ // Validate WhatsApp number format
//       }
//     },
//     Email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       validate: {
//         isEmail: true, // Ensure this field is a valid email address
//         notEmpty: true // Ensure this field is not empty
//       }
//     },
//     AcceptedPolicy: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false // Set default value to false
//     },
//     IsCommunicationAllowed: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false // Set default value to false
//     },
//     PatientAddress: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       validate: {
//         notEmpty: true // Ensure this field is not empty
//       }
//     },
//     EmergencyContactName: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       validate: {
//         notEmpty: true // Ensure this field is not empty if provided
//       }
//     },
//     EmergencyContactPhone: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       validate: {
//         is: /^[0-9]{10}$/, // Validate phone number format
//         notEmpty: true // Ensure this field is not empty if provided
//       }
//     },
//     InsuranceProvider: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     InsurancePolicyNumber: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     MedicalHistory: {
//       type: DataTypes.TEXT,
//       allowNull: true
//     },
//     CurrentMedications: {
//       type: DataTypes.TEXT,
//       allowNull: true
//     },
//     Allergies: {
//       type: DataTypes.TEXT,
//       allowNull: true
//     },
//     MaritalStatus: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       validate: {
//         isIn: [['Single', 'Married', 'Divorced', 'Widowed']] // Ensure valid marital status
//       }
//     },
//     Occupation: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     Nationality: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     Language: {
//       type: DataTypes.STRING,
//       allowNull: true
//     }
//   }, {
//     tableName: 'Patient_master', // Specify the table name if different from the model name
//     timestamps: true // Enable timestamps (createdAt, updatedAt)
//   });

//   HospitalGroup.hasMany(Hospital, { foreignKey: 'HospitalGroupIDR' });
//   Hospital.belongsTo(HospitalGroup, { foreignKey: 'HospitalGroupID' });

//   Hospital.hasMany(PatientMaster, { foreignKey: 'HospitalID' });
//   PatientMaster.belongsTo(Hospital, { foreignKey: 'HospitalID' });

//   return PatientMaster;
// }

// module.exports = definePatientMaster;
