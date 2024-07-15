const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EmpCategory = sequelize.define('EmpCategory', {
    EmployeeCategoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    EmployeeCategoryName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    EmployeeCategoryCode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    IsAnnualAllowanceApplicable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    IsNoticePeriodApplicable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    NoticePeriodType: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    NoticePeriodValue: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true
    },
    IsProbationPeriodApplicable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    ProbationPeriodType: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    ProbationPeriodValue: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true
    },
    IsRoundingApplicable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    RoundingType: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    IsNonActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    NonCompulsoryLeave: {
      type: DataTypes.DECIMAL(7, 2),
      allowNull: true
    },
    SalaryHeadLedgerIDR: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    SalaryPayableLedgerIDR: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    HospitalGroupIDR: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'tblEmpCategory',
    timestamps: false
  });

  // Define associations
  EmpCategory.associate = (models) => {
    EmpCategory.belongsTo(models.tblHospitalGroup, {
      foreignKey: 'HospitalGroupIDR',
      targetKey: 'HospitalGroupID'
    });
  };

  return EmpCategory;
};




// const { DataTypes, Model } = require('sequelize');
// const sequelize = require('../database/dynamicConnection'); // Adjust the path as per your project structure

// class EmpCategory extends Model {}

// EmpCategory.init({
//   EmployeeCategoryID: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//     allowNull: false
//   },
//   EmployeeCategoryName: {
//     type: DataTypes.STRING(50),
//     allowNull: false
//   },
//   EmployeeCategoryCode: {
//     type: DataTypes.STRING(20),
//     allowNull: true
//   },
//   IsAnnualAllowanceApplicable: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false
//   },
//   IsNoticePeriodApplicable: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false
//   },
//   NoticePeriodType: {
//     type: DataTypes.TINYINT,
//     allowNull: true
//   },
//   NoticePeriodValue: {
//     type: DataTypes.DECIMAL(18, 2),
//     allowNull: true
//   },
//   IsProbationPeriodApplicable: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false
//   },
//   ProbationPeriodType: {
//     type: DataTypes.TINYINT,
//     allowNull: true
//   },
//   ProbationPeriodValue: {
//     type: DataTypes.DECIMAL(18, 2),
//     allowNull: true
//   },
//   IsRoundingApplicable: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false
//   },
//   RoundingType: {
//     type: DataTypes.TINYINT,
//     allowNull: true
//   },
//   IsNonActive: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false
//   },
//   NonCompulsoryLeave: {
//     type: DataTypes.DECIMAL(7, 2),
//     allowNull: true
//   },
//   SalaryHeadLedgerIDR: {
//     type: DataTypes.INTEGER,
//     allowNull: true // Adjust as per your requirements
//   },
//   SalaryPayableLedgerIDR: {
//     type: DataTypes.INTEGER,
//     allowNull: true // Adjust as per your requirements
//   },
//   HospitalGroupIDR: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'tblHospitalGroup', // Assuming this is your HospitalGroup model/table
//       key: 'HospitalGroupID'
//     }
//   }
// }, {
//   sequelize,
//   modelName: 'EmpCategory',
//   tableName: 'tblEmpCategory',
//   timestamps: false // Set to true if you want timestamps fields
// });
// tblEmpCategory.hasMany(Table2);

// module.exports = EmpCategory;
