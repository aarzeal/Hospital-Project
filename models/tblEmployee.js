

// const { DataTypes } = require('sequelize');
// const path = require('path');
// const fs = require('fs');
// const Skill = require('./skillMaster');

// let config;

// try {
//   const configPath = path.join(__dirname, '../config/employeeConfig.json');
//   const configFile = fs.readFileSync(configPath, 'utf8');
//   config = JSON.parse(configFile);

// } catch (error) {

//   console.error('Error loading employeeConfig.json:', error);
//   throw error; // Ensure errors are thrown to halt further execution if config loading fails
// }


// module.exports = (sequelize) => {
//   const Employee = sequelize.define('Employee', {
//     EmployeeID: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     FName: {
//       type: DataTypes.STRING(40),
//       allowNull: false
//     },
//     MName: {
//       type: DataTypes.STRING(40),
//       allowNull: false
//     },
//     LName: {
//       type: DataTypes.STRING(40),
//       allowNull: false
//     },
//     // SkillSetIDR: {
//     //   type: DataTypes.INTEGER,
//     //   allowNull: false
//     //   // Add reference to Skill model if needed
//     // },
//     SpecialtyIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'tblspecialty', // Adjusted to match your actual table name
//         key: 'SpecialtyId',
//         onDelete: 'CASCADE', // or other appropriate action
//   onUpdate: 'CASCADE' // or other appropriate action
//       }
//     },
   
//     Gender: {
//       type: DataTypes.TINYINT,
//       allowNull: false,
//       validate: {
//         isValidGender(value) {
//           if (!config || !config.Gender) {
//             throw new Error('Configuration for Gender is missing or invalid.');
//           }
//           const validGenders = Object.keys(config.Gender).map(Number);
//           if (!validGenders.includes(value)) {
//             throw new Error(`Invalid gender value: ${value}. Valid values are: ${validGenders.join(', ')}`);
//           }
//         },
//       }
//     },
//     EmployeeGroup: {
//       type: DataTypes.TINYINT,
//       allowNull: true
//     },
//     BloodGroupIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       validate: {
//         isBloodGroup(value) {
//           if (!config || !config.BloodGroup) {
//             throw new Error('Configuration for Gender is missing or invalid.');
//           }
//           const validBloodGroup = Object.keys(config.BloodGroup).map(Number);
//           if (!validBloodGroup.includes(value)) {
//             throw new Error(`Invalid gender value: ${value}. Valid values are: ${validBloodGroup.join(', ')}`);
//           }
//         },
//       }

//       // Assuming BloodGroupIDR is an INTEGER with predefined values in your application
//     },
//     DepartmentIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'tbldepartment', // Replace with your actual table name
//         key: 'DepartmentId',   // Replace with your actual primary key column name in tbldepartment
//       }
//     },
    
//     DesignationIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'tbldesignation', // Ensure this table exists
//         key: 'DesignationId'
//       },
//     },
   
//     NationalityIDR: {
//       type: DataTypes.TINYINT,
//       allowNull: false,
//       validate: {
//         isValidNationality(value) {
//           if (!config || !config.Nationality) {
//             throw new Error('Configuration for Gender is missing or invalid.');
//           }
//           const validNationality = Object.keys(config.Nationality).map(Number);
//           if (!validNationality.includes(value)) {
//             throw new Error(`Invalid Nationality value: ${value}. Valid values are: ${validNationality.join(', ')}`);
//           }
//         },
//       }
//     },
//     ReligionIDR: {
//       type: DataTypes.TINYINT,
//       allowNull: false,
//       validate: {
//         isValidReligion(value) {
//           if (!config || !config.Religion) {
//             throw new Error('Configuration for Religion is missing or invalid.');
//           }
//           const validReligion = Object.keys(config.Religion).map(Number);
//           if (!validReligion.includes(value)) {
//             throw new Error(`Invalid Religion value: ${value}. Valid values are: ${validReligion.join(', ')}`);
//           }
//         },
//       }
//     },
//     CastIDF: {
//       type: DataTypes.TINYINT,
//       allowNull: false,
//       validate: {
//         isValidCast(value) {
//           if (!config || !config.Cast) {
//             throw new Error('Configuration for Cast is missing or invalid.');
//           }
//           const validCast = Object.keys(config.Cast).map(Number);
//           if (!validCast.includes(value)) {
//             throw new Error(`Invalid Cast value: ${value}. Valid values are: ${validCast.join(', ')}`);
//           }
//         },
//       }
//     },
//     QualificationIDR: {
//       type: DataTypes.TINYINT,
//       allowNull: false,
//       validate: {
//         isValidQualification(value) {
//           if (!config || !config.Qualification) {
//             throw new Error('Configuration for Qualification is missing or invalid.');
//           }
//           const validQualification = Object.keys(config.Qualification).map(Number);
//           if (!validQualification.includes(value)) {
//             throw new Error(`Invalid Qualification value: ${value}. Valid values are: ${validGenders.join(', ')}`);
//           }
//         },
//       }
//     },
//     EmployeeCategoryIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'tblempcategory', // Replace with your actual table name
//         key: 'EmployeeCategoryID',   // Replace with your actual primary key column name in tbldepartment
//       }
//     },
//     EmployeeCode: {
//       type: DataTypes.STRING(20),
//       allowNull: false
//     },
//     EmployeeNo: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     UniqueTAXNo: {
//       type: DataTypes.STRING(20),
//       allowNull: false
//     },
//     EmployeePhoto: {
//       type: DataTypes.STRING(200),
//       allowNull: true
//     },
//     WagesIDF: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//       // Add reference to Wages model if needed
//     },
//     DateOfBirth: {
//       type: DataTypes.DATEONLY,
//       allowNull: false
//     },
//     DateOfJoining: {
//       type: DataTypes.DATEONLY,
//       allowNull: false
//     },
//     DateOfLeaving: {
//       type: DataTypes.DATEONLY,
//       allowNull: true
      
//     },
//     MaritalStatus: {
//       type: DataTypes.TINYINT,
//       allowNull: false,
//       validate: {
//         isValidMaritalStatus(value) {
//           if (!config || !config.MaritalStatus) {
//             throw new Error('Configuration for MaritalStatus is missing or invalid.');
//           }
//           const validMaritalStatus = Object.keys(config.MaritalStatus).map(Number);
//           if (!validMaritalStatus.includes(value)) {
//             throw new Error(`Invalid MaritalStatus value: ${value}. Valid values are: ${validMaritalStatus.join(', ')}`);
//           }
//         },
//       }
//     },
//     DrRegistrationNumber: {
//       type: DataTypes.STRING(20),
//       allowNull: true
//     },
//     CandidateCode: {
//       type: DataTypes.STRING(50),
//       allowNull: true
//     },
//     ProbApplicable: {
//       type: DataTypes.BOOLEAN,
//       allowNull: true
//     },
//     ProbPeriodDate: {
//       type: DataTypes.DATEONLY,
//       allowNull: true
//     },
//     ProbComplete: {
//       type: DataTypes.BOOLEAN,
//       allowNull: true
//     },
//     SalaryPlanIDF: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//       // Add reference to SalaryPlan model if needed
//     },
//     RulePlanIDF: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//       // Add reference to RulePlan model if needed
//     },
//     BankLedgerIDF: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//       // Add reference to BankLedger model if needed
//     },
//     HoursPerDay: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     },
//     BankAcNo: {
//       type: DataTypes.STRING(50),
//       allowNull: true
//     },
//     SSFApplicable: {
//       type: DataTypes.BOOLEAN,
//       allowNull: true
//     },
//     SSFNo: {
//       type: DataTypes.STRING(50),
//       allowNull: true
//     },
//     NoOfChildren: {
//       type: DataTypes.TINYINT,
//       allowNull: false
//     },
//     NoOfDependant: {
//       type: DataTypes.TINYINT,
//       allowNull: false
//     },
//     IsEmployeeRetire: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false
//     },
//     IsSalaryOnHold: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false
//     },
//     HealthCardNo: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     PassPortNo: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     PassPortExpDate: {
//       type: DataTypes.DATEONLY,
//       allowNull: true
//     },
//     EmployeeType: {
//       type: DataTypes.TINYINT,
//       allowNull: true
//     },
//     DutyScheduleType: {
//       type: DataTypes.TINYINT,
//       allowNull: true
//     },
//     HospitalIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       // references: {
//       //   model: 'tblhospital', // Replace with your actual table name
//       //   key: 'HospitalID',   // Replace with your actual primary key column name in tbldepartment
//       // }
//       // Add reference to Hospital model if needed
//     },
//     RelationWithMName: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     ReasonOfLeaving: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     EmpBankIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//       // Add reference to Bank model if needed
//     },
//     GovernmentPlan: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     PracticeNumber: {
//       type: DataTypes.STRING(30),
//       allowNull: false
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
//       type: DataTypes.STRING(30),
//       allowNull: true
//     },
//     Reserve4: {
//       type: DataTypes.STRING(30),
//       allowNull: true
//     },
    
    







//   }, 
  
//   {
//     tableName: 'tblEmployee',
//     timestamps: false
//   });
  
//   // Employee.belongsTo(Skill, { foreignKey: 'SkillSetIDR' });
//   return Employee;
// };
























const { DataTypes } = require('sequelize');
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

module.exports = (sequelize) => {
  const Employee = sequelize.define('Employee', {
    EmployeeID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    FName: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    MName: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    LName: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    SpecialtyIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tblspecialty',
        key: 'SpecialtyId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    },
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
    EmployeeGroup: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    BloodGroupIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isBloodGroup(value) {
          if (!config || !config.BloodGroup) {
            throw new Error('Configuration for BloodGroup is missing or invalid.');
          }
          const validBloodGroup = Object.keys(config.BloodGroup).map(Number);
          if (!validBloodGroup.includes(value)) {
            throw new Error(`Invalid BloodGroup value: ${value}. Valid values are: ${validBloodGroup.join(', ')}`);
          }
        },
      }
    },
    DepartmentIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tbldepartment',
        key: 'DepartmentId',
      }
    },
    DesignationIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tbldesignation',
        key: 'DesignationId'
      },
    },
    NationalityIDR: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        isValidNationality(value) {
          if (!config || !config.Nationality) {
            throw new Error('Configuration for Nationality is missing or invalid.');
          }
          const validNationality = Object.keys(config.Nationality).map(Number);
          if (!validNationality.includes(value)) {
            throw new Error(`Invalid Nationality value: ${value}. Valid values are: ${validNationality.join(', ')}`);
          }
        },
      }
    },
    ReligionIDR: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        isValidReligion(value) {
          if (!config || !config.Religion) {
            throw new Error('Configuration for Religion is missing or invalid.');
          }
          const validReligion = Object.keys(config.Religion).map(Number);
          if (!validReligion.includes(value)) {
            throw new Error(`Invalid Religion value: ${value}. Valid values are: ${validReligion.join(', ')}`);
          }
        },
      }
    },
    CastIDF: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        isValidCast(value) {
          if (!config || !config.Cast) {
            throw new Error('Configuration for Cast is missing or invalid.');
          }
          const validCast = Object.keys(config.Cast).map(Number);
          if (!validCast.includes(value)) {
            throw new Error(`Invalid Cast value: ${value}. Valid values are: ${validCast.join(', ')}`);
          }
        },
      }
    },
    QualificationIDR: {
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
    EmployeeCategoryIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tblempcategory',
        key: 'EmployeeCategoryID',
      }
    },
    EmployeeCode: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    EmployeeNo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    UniqueTAXNo: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    EmployeePhoto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    WagesIDF: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    DateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    DateOfJoining: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    DateOfLeaving: {
      type: DataTypes.DATEONLY,
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
    DrRegistrationNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    CandidateCode: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ProbApplicable: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    ProbPeriodDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ProbComplete: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    SalaryPlanIDF: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    RulePlanIDF: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    BankLedgerIDF: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    HoursPerDay: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    BankAcNo: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    SSFApplicable: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    SSFNo: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    NoOfChildren: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    NoOfDependant: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    IsEmployeeRetire: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    IsSalaryOnHold: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    HealthCardNo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    PassPortNo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    PassPortExpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    EmployeeType: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    DutyScheduleType: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    HospitalIDR: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    RelationWithMName: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ReasonOfLeaving: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    EmpBankIDR: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    GovernmentPlan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    PracticeNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE, // Use DataTypes instead of Sequelize
      allowNull: false,
      defaultValue: sequelize.fn('NOW')
  },
  updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('NOW')
  }
  }, {
    tableName: 'tblEmployee', // Specify your table name here
    // timestamps: false // Set this to false if you don't want updatedAt field
    timestamps: true, // This will automatically add createdAt and updatedAt fields
  createdAt: 'createdAt', // Explicitly map to the createdAt field
  updatedAt: 'updatedAt'  // Explicitly map to the updatedAt field
  });

  return Employee;
};
