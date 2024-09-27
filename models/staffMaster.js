// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const StaffMaster = sequelize.define('StaffMaster', {
//     Id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     FirstName: {
//       type: DataTypes.STRING(40),
//       allowNull: false
//     },
//     MiddleName: {
//       type: DataTypes.STRING(40),
//       allowNull: true
//     },
//     LastName: {
//       type: DataTypes.STRING(40),
//       allowNull: false
//     },
//     Email: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
      
//       validate: {
//         isEmail: true
//       }
//       // unique: {
//       //   name: 'email',
//       //   msg: 'The email address is already registered.'
//       // },
//     },
//     Address: {
//       type: DataTypes.TEXT,
//       allowNull: true
//     },
//     Age: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     DOB: {
//       type: DataTypes.DATEONLY,
//       allowNull: true
//     },
//     BloodGroup: {
//       type: DataTypes.STRING(5),
//       allowNull: true
//     },
//     Gender: {
//       type: DataTypes.STRING(10),
//       allowNull: false
//     },
//     EmergencyContactName: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     EmergencyContactPhone: {
//       type: DataTypes.STRING(15),
//       allowNull: true
//     },
//     MaritalStatus: {
//       type: DataTypes.STRING(20),
//       allowNull: true
//     },
//     Nationality: {
//       type: DataTypes.STRING(50),
//       allowNull: true
//     },
//     Language: {
//       type: DataTypes.STRING(50),
//       allowNull: true
//     },
//     MobileNumber: {
//       type: DataTypes.STRING(15),
//       allowNull: true
//     },
//     Qualification: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     Experience: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     // Specialization: {
//     //   type: DataTypes.STRING(100),
//     //   allowNull: true

//     // },
//     Specialization: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: 'tblspecialty', // Name of the referenced table
//         key: 'SpecialtyId'     // Primary key in the referenced table
//       },
//       allowNull: true
//     },

//     WhatsAppNumber: {
//       type: DataTypes.STRING(15),
//       allowNull: true
//     },
//     HospitalIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       // references: {
//       //   model: 'tblhospital',
//       //   key: 'HospitalID'
//       // }
//     },
//     HospitalGroupIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     IsActive: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: true
//     },
//     CreatedBy: {
//       type: DataTypes.STRING(100),
     
//     },
//     CreatedAt: {
//       type: DataTypes.DATE,
      
      
//     },
//     EditedBy: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     EditedAt: {
//       type: DataTypes.DATE,
//       allowNull: true
//     },
//     Reserve1 : {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     Reserve2: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     Reserve3: {
//       type: DataTypes.STRING(250),
//       allowNull: true
//     },
//     Reserve4: {
//       type: DataTypes.STRING(250),
//       allowNull: true
//     }
//   }, {
//     tableName: 'tblStaffMaster',
//     timestamps: false
//   });

//   return StaffMaster;
// };


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

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StaffMaster = sequelize.define('StaffMaster', {
    Id: {
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
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    Address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DOB: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    // BloodGroup: {
    //   type: DataTypes.STRING(5),
    //   allowNull: true
    // },
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
            throw new Error(`Invalid BloodGroup value: ${value}. Valid values are: ${validBloodGroup.join(', ')}`);
          }
        },
      }
    },
    // Gender: {
    //   type: DataTypes.STRING(10),
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
    EmergencyContactName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    EmergencyContactPhone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    // MaritalStatus: {
    //   type: DataTypes.STRING(20),
    //   allowNull: true
    // },


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
    // Nationality: {
    //   type: DataTypes.STRING(50),
    //   allowNull: true
    // },

    Nationality: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        isValidNationality(value) {
          if (!config || !config.Nationality) {
            throw new Error('Configuration for Nationality is missing or invalid.');
          }
          const validNationalities = Object.keys(config.Nationality).map(Number);
          if (!validNationalities.includes(value)) {
            throw new Error(`Invalid Nationality value: ${value}. Valid values are: ${validNationalities.join(', ')}`);
          }
        },
      }
    },





    Language: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    MobileNumber: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    Qualification: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Experience: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Specialization: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tblspecialty', // Ensure this table exists
        key: 'SpecialtyId'
      },
      allowNull: true
    },
    WhatsAppNumber: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    HospitalIDR: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    HospitalGroupIDR: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    CreatedBy: {
      type: DataTypes.STRING(100),
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    EditedBy: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    EditedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Reserve1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Reserve2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Reserve3: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    Reserve4: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    tableName: 'tblStaffMaster', // Make sure this matches your actual table name in the database
    timestamps: false
  });

  StaffMaster.associate = (models) => {
    StaffMaster.belongsTo(models.Specialty, {
      foreignKey: 'Specialization', // Foreign key in the StaffMaster table
      as: 'Specialty'                // Alias for the association
    });
  };

  return StaffMaster;
  
};
