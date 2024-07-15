

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
    SkillSetIDF: {
      type: DataTypes.INTEGER,
      allowNull: false
      // Add reference to Skill model if needed
    },
    // Gender: {
    //   type: DataTypes.TINYINT,
    //   allowNull: false
    //   // Assuming Gender is a TINYINT with predefined values in your application
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
            throw new Error('Configuration for Gender is missing or invalid.');
          }
          const validBloodGroup = Object.keys(config.BloodGroup).map(Number);
          if (!validBloodGroup.includes(value)) {
            throw new Error(`Invalid gender value: ${value}. Valid values are: ${validBloodGroup.join(', ')}`);
          }
        },
      }

      // Assuming BloodGroupIDR is an INTEGER with predefined values in your application
    },
    DepartmentIDR: {
      type: DataTypes.INTEGER,
      allowNull: false
      // Add reference to Department model if needed
    },
    DesignationIDR: {
      type: DataTypes.INTEGER,
      allowNull: false
      // Add reference to Designation model if needed
    },
   
    NationalityIDR: {
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
            throw new Error(`Invalid Qualification value: ${value}. Valid values are: ${validGenders.join(', ')}`);
          }
        },
      }
    },
    EmployeeCategoryIDR: {
      type: DataTypes.INTEGER,
      allowNull: false
      // Add reference to EmployeeCategory model if needed
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
      type: DataTypes.STRING(200),
      allowNull: true
    },
    WagesIDF: {
      type: DataTypes.INTEGER,
      allowNull: false
      // Add reference to Wages model if needed
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
      // Add reference to SalaryPlan model if needed
    },
    RulePlanIDF: {
      type: DataTypes.INTEGER,
      allowNull: false
      // Add reference to RulePlan model if needed
    },
    BankLedgerIDF: {
      type: DataTypes.INTEGER,
      allowNull: false
      // Add reference to BankLedger model if needed
    },
    HoursPerDay: {
      type: DataTypes.INTEGER,
      allowNull: false
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
      // Add reference to Hospital model if needed
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
      allowNull: false
      // Add reference to Bank model if needed
    },
    GovernmentPlan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    PracticeNumber: {
      type: DataTypes.STRING(30),
      allowNull: false
    }
  }, {
    tableName: 'tblEmployee',
    timestamps: false
  });

  return Employee;
};
