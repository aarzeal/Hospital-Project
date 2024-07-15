const path = require('path');
const fs = require('fs');
const { Employee } = require('../models/tblEmployee'); // Adjust the import path as per your project structure
const logger = require('../logger'); // Replace with your logger implementation
const { error } = require('console');



let config;

try {
  const configPath = path.join(__dirname, '../config/employeeConfig.json');
  const configFile = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configFile);

} catch (error) {

  console.error('Error loading employeeConfig.json:', error);
  throw error; // Ensure errors are thrown to halt further execution if config loading fails
}

exports.createEmployee = async (req, res) => {
  const start = Date.now();
  const {  FName, MName, LName, SkillSetIDF, Gender, EmployeeGroup, BloodGroupIDR,
        DepartmentIDR, DesignationIDR, NationalityIDR, ReligionIDR, CastIDF,
        QualificationIDR, EmployeeCategoryIDR, EmployeeCode, EmployeeNo, UniqueTAXNo,
        EmployeePhoto, WagesIDF, DateOfBirth, DateOfJoining, DateOfLeaving, MaritalStatus,
        DrRegistrationNumber, CandidateCode, ProbApplicable, ProbPeriodDate, ProbComplete,
        SalaryPlanIDF, RulePlanIDF, BankLedgerIDF, HoursPerDay, BankAcNo, SSFApplicable,
        SSFNo, NoOfChildren, NoOfDependant, IsEmployeeRetire, IsSalaryOnHold, HealthCardNo,
        PassPortNo, PassPortExpDate, EmployeeType, DutyScheduleType, RelationWithMName,
        ReasonOfLeaving, EmpBankIDR, GovernmentPlan, PracticeNumber } = req.body;
  const HospitalIDR = req.hospitalId;

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    await Employee.sync();
    const newEmployee = await Employee.create({
      FName,
            MName,
            LName,
            SkillSetIDF,
            Gender, // Map numeric Gender to actual value
            EmployeeGroup,
            BloodGroupIDR, // Map numeric BloodGroupIDR to actual value
            DepartmentIDR,
            DesignationIDR,
            NationalityIDR, // Map numeric NationalityIDR to actual value
            ReligionIDR, // Map numeric ReligionIDR to actual value
            CastIDF, // Map numeric CastIDF to actual value
            QualificationIDR, // Map numeric QualificationIDR to actual value
            EmployeeCategoryIDR,
            EmployeeCode,
            EmployeeNo,
            UniqueTAXNo,
            EmployeePhoto,
            WagesIDF,
            DateOfBirth,
            DateOfJoining,
            DateOfLeaving,
            MaritalStatus, // Map numeric MaritalStatus to actual value
            DrRegistrationNumber,
            CandidateCode,
            ProbApplicable,
            ProbPeriodDate,
            ProbComplete,
            SalaryPlanIDF,
            RulePlanIDF,
            BankLedgerIDF,
            HoursPerDay,
            BankAcNo,
            SSFApplicable,
            SSFNo,
            NoOfChildren,
            NoOfDependant,
            IsEmployeeRetire,
            IsSalaryOnHold,
            HealthCardNo,
            PassPortNo,
            PassPortExpDate,
            EmployeeType,
            DutyScheduleType,
            HospitalIDR,
            RelationWithMName,
            ReasonOfLeaving,
            EmpBankIDR,
            GovernmentPlan,
            PracticeNumber
    });
    logger.info('Created new department successfully');
    res.status(201).json({
      meta: { statusCode: 201 },
      data: newEmployee
    });
  } catch (error) {
    logger.error(`Error creating department: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1003 },
      error: { message: 'Failed to create department due to a server error. Please ensure all fields are correctly filled and try again.' }
    });
  } 
};
exports.getEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employee = await Employee.findByPk(id);

    if (!employee) {
      logger.warn(`Employee with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404 },
        error: { message: 'Employee not found' }
      });
    }

    const employeeData = employee.toJSON();
    const genderKey = String(employeeData.Gender);
    console.log('Gender Key:', genderKey);
    console.log('Config:', config.Gender);

    // Check if genderKey exists in config.Gender
    if (config.Gender.hasOwnProperty(genderKey)) {
      employeeData.Gender = config.Gender[genderKey];
    } else {
      employeeData.Gender = "Unknown";
    }
    employeeData.BloodGroupIDR = config.BloodGroup[String(employeeData.BloodGroupIDR)] || "Unknown";
    employeeData.NationalityIDR = config.Nationality[String(employeeData.NationalityIDR)] || "Unknown";
    employeeData.ReligionIDR = config.Religion[String(employeeData.ReligionIDR)] || "Unknown";
    employeeData.CastIDF = config.Cast[String(employeeData.CastIDF)] || "Unknown";
    employeeData.QualificationIDR = config.Qualification[String(employeeData.QualificationIDR)] || "Unknown";
    employeeData.MaritalStatus = config.MaritalStatus[String(employeeData.MaritalStatus)] || "Unknown";

    res.status(200).json({
      meta: { statusCode: 200 },
      data: employeeData
    });
  } catch (error) {
    logger.error(`Error fetching employee: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1002 },
      error: { message: 'Failed to fetch employee data due to a server error.' }
    });
  }
};
// Update Employee
exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        meta: { statusCode: 404 },
        error: { message: 'Employee not found' }
      });
    }

    await employee.update(updateData);
    logger.info('Updated employee successfully');
    res.status(200).json({
      meta: { statusCode: 200 },
      data: employee
    });
  } catch (error) {
    logger.error(`Error updating employee: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1004 },
      error: { message: 'Failed to update employee due to a server error.' }
    });
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        meta: { statusCode: 404 },
        error: { message: 'Employee not found' }
      });
    }

    await employee.destroy();
    logger.info('Deleted employee successfully');
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting employee: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1005 },
      error: { message: 'Failed to delete employee due to a server error.' }
    });
  }
};
























// exports.createEmployee = async (req, res) => {
//   const {
//     FName, MName, LName, SkillSetIDF, Gender, EmployeeGroup, BloodGroupIDR,
//     DepartmentIDR, DesignationIDR, NationalityIDR, ReligionIDR, CastIDF,
//     QualificationIDR, EmployeeCategoryIDR, EmployeeCode, EmployeeNo, UniqueTAXNo,
//     EmployeePhoto, WagesIDF, DateOfBirth, DateOfJoining, DateOfLeaving, MaritalStatus,
//     DrRegistrationNumber, CandidateCode, ProbApplicable, ProbPeriodDate, ProbComplete,
//     SalaryPlanIDF, RulePlanIDF, BankLedgerIDF, HoursPerDay, BankAcNo, SSFApplicable,
//     SSFNo, NoOfChildren, NoOfDependant, IsEmployeeRetire, IsSalaryOnHold, HealthCardNo,
//     PassPortNo, PassPortExpDate, EmployeeType, DutyScheduleType, HospitalIDR, RelationWithMName,
//     ReasonOfLeaving, EmpBankIDR, GovernmentPlan, PracticeNumber
//   } = req.body;
//   const startTime = Date.now();

//   // Load config file
//   const configPath = path.join(__dirname, '../config/employeeConfig.json');
//   const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

//   try {
//     const Employee = require('../models/tblEmployee')(req.sequelize);

//     // Ensure the table exists
//     // await Employee.sync();

//     // Validate and map fields using config values
//     const mappedEmployeeData = {
//       FName,
//       MName,
//       LName,
//       SkillSetIDF,
//       Gender: config.Gender[Gender], // Map numeric Gender to actual value
//       EmployeeGroup,
//       BloodGroupIDR: config.BloodGroupIDR[BloodGroupIDR], // Map numeric BloodGroupIDR to actual value
//       DepartmentIDR,
//       DesignationIDR,
//       NationalityIDR: config.NationalityIDR[NationalityIDR], // Map numeric NationalityIDR to actual value
//       ReligionIDR: config.ReligionIDR[ReligionIDR], // Map numeric ReligionIDR to actual value
//       CastIDF: config.CastIDF[CastIDF], // Map numeric CastIDF to actual value
//       QualificationIDR: config.QualificationIDR[QualificationIDR], // Map numeric QualificationIDR to actual value
//       EmployeeCategoryIDR,
//       EmployeeCode,
//       EmployeeNo,
//       UniqueTAXNo,
//       EmployeePhoto,
//       WagesIDF,
//       DateOfBirth,
//       DateOfJoining,
//       DateOfLeaving,
//       MaritalStatus: config.MaritalStatus[MaritalStatus], // Map numeric MaritalStatus to actual value
//       DrRegistrationNumber,
//       CandidateCode,
//       ProbApplicable,
//       ProbPeriodDate,
//       ProbComplete,
//       SalaryPlanIDF,
//       RulePlanIDF,
//       BankLedgerIDF,
//       HoursPerDay,
//       BankAcNo,
//       SSFApplicable,
//       SSFNo,
//       NoOfChildren,
//       NoOfDependant,
//       IsEmployeeRetire,
//       IsSalaryOnHold,
//       HealthCardNo,
//       PassPortNo,
//       PassPortExpDate,
//       EmployeeType,
//       DutyScheduleType,
//       HospitalIDR,
//       RelationWithMName,
//       ReasonOfLeaving,
//       EmpBankIDR,
//       GovernmentPlan,
//       PracticeNumber
//     };

//     // Create the new employee
//     const newEmployee = await Employee.create(mappedEmployeeData);
//     console.log(newEmployee)

//     logger.info(`Created new employee successfully in ${Date.now() - startTime}ms`);
//     res.status(201).json({
//       meta: { statusCode: 201 },
//       data: newEmployee
//     });
//   } catch (error) {
//     logger.error(`Error creating employee: ${error.message} in ${Date.now() - startTime}ms`);
//     res.status(500).json({

//       meta: { statusCode: 500, errorCode: 987 },

//       error: { message: 'Failed to create employee due to a server error. Please ensure all fields are correctly filled and try again.' }
//     });
//   }
// };


// exports.getAllEmployees = async (req, res) => {
//   const startTime = Date.now();

//   try {
//     const Employee = require('../models/tblEmployee')(req.sequelize);

//     const employees = await Employee.findAll();

//     logger.info(`Fetched all employees successfully in ${Date.now() - startTime}ms`);
//     res.status(200).json({
//       meta: { statusCode: 200 },
//       data: employees
//     });
//   } catch (error) {
//     logger.error(`Error fetching employees: ${error.message} in ${Date.now() - startTime}ms`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 988 },
//       error: { message: 'Failed to fetch employees due to a server error. Please try again later.' }
//     });
//   }
// };

// exports.getEmployeeById = async (req, res) => {
//   const { id } = req.params;
//   const startTime = Date.now();

//   try {
//     const Employee = require('../models/tblEmployee')(req.sequelize);

//     const employee = await Employee.findOne({ where: { EmployeeID: id } });

//     if (employee) {
//       logger.info(`Fetched employee with ID ${id} successfully in ${Date.now() - startTime}ms`);
//       return res.status(200).json({
//         meta: { statusCode: 200 },
//         data: employee
//       });
//     }

//     logger.warn(`Employee with ID ${id} not found`);
//     res.status(404).json({
//       meta: { statusCode: 404, errorCode: 1022 },
//       error: { message: `Employee with ID ${id} not found. Please check the ID and try again.` }
//     });
//   } catch (error) {
//     logger.error(`Error fetching employee with ID ${id}: ${error.message} in ${Date.now() - startTime}ms`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 989 },
//       error: { message: 'Failed to fetch employee due to a server error. Please try again later.' }
//     });
//   }
// };

// exports.updateEmployee = async (req, res) => {
//   const { id } = req.params;
//   const {
//     FName, MName, LName, SkillSetIDF, Gender, EmployeeGroup, BloodGroupIDR,
//     DepartmentIDR, DesignationIDR, NationalityIDR, ReligionIDR, CastIDF,
//     QualificationIDR, EmployeeCategoryIDR, EmployeeCode, EmployeeNo, UniqueTAXNo,
//     EmployeePhoto, WagesIDF, DateOfBirth, DateOfJoining, DateOfLeaving, MaritalStatus,
//     DrRegistrationNumber, CandidateCode, ProbApplicable, ProbPeriodDate, ProbComplete,
//     SalaryPlanIDF, RulePlanIDF, BankLedgerIDF, HoursPerDay, BankAcNo, SSFApplicable,
//     SSFNo, NoOfChildren, NoOfDependant, IsEmployeeRetire, IsSalaryOnHold, HealthCardNo,
//     PassPortNo, PassPortExpDate, EmployeeType, DutyScheduleType, HospitalIDR, RelationWithMName,
//     ReasonOfLeaving, EmpBankIDR, GovernmentPlan, PracticeNumber
//   } = req.body;
//   const startTime = Date.now();

//   // Load config file
//   const configPath = path.join(__dirname, '');
//   const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

//   try {
//     const Employee = require('../models/tblEmployee')(req.sequelize);

//     // Ensure the table exists
//     await Employee.sync();

//     const [updated] = await Employee.update({
//       FName,
//       MName,
//       LName,
//       SkillSetIDF,
//       Gender: config.Gender[Gender],
//       EmployeeGroup,
//       BloodGroupIDR: config.BloodGroupIDR[BloodGroupIDR],
//       DepartmentIDR,
//       DesignationIDR,
//       NationalityIDR: config.NationalityIDR[NationalityIDR],
//       ReligionIDR: config.ReligionIDR[ReligionIDR],
//       CastIDF: config.CastIDF[CastIDF],
//       QualificationIDR: config.QualificationIDR[QualificationIDR],
//       EmployeeCategoryIDR,
//       EmployeeCode,
//       EmployeeNo,
//       UniqueTAXNo,
//       EmployeePhoto,
//       WagesIDF,
//       DateOfBirth,
//       DateOfJoining,
//       DateOfLeaving,
//       MaritalStatus: config.MaritalStatus[MaritalStatus],
//       DrRegistrationNumber,
//       CandidateCode,
//       ProbApplicable,
//       ProbPeriodDate,
//       ProbComplete,
//       SalaryPlanIDF,
//       RulePlanIDF,
//       BankLedgerIDF,
//       HoursPerDay,
//       BankAcNo,
//       SSFApplicable,
//       SSFNo,
//       NoOfChildren,
//       NoOfDependant,
//       IsEmployeeRetire,
//       IsSalaryOnHold,
//       HealthCardNo,
//       PassPortNo,
//       PassPortExpDate,
//       EmployeeType,
//       DutyScheduleType,
//       HospitalIDR,
//       RelationWithMName,
//       ReasonOfLeaving,
//       EmpBankIDR,
//       GovernmentPlan,
//       PracticeNumber
//     }, {
//       where: { EmployeeID: id }
//     });

//     if (updated) {
//       logger.info(`Updated employee with ID ${id} successfully in ${Date.now() - startTime}ms`);
//       return res.status(200).json({
//         meta: { statusCode: 200 },
//         message: 'Employee updated successfully.'
//       });
//     }

//     logger.warn(`Employee with ID ${id} not found`);
//     res.status(404).json({
//       meta: { statusCode: 404, errorCode: 1022 },
//       error: { message: `Employee with ID ${id} not found. Please check the ID and try again.` }
//     });
//   } catch (error) {
//     logger.error(`Error updating employee with ID ${id}: ${error.message} in ${Date.now() - startTime}ms`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 990 },
//       error: { message: 'Failed to update employee due to a server error. Please try again later.' }
//     });
//   }
// };

// exports.deleteEmployee = async (req, res) => {
//   const { id } = req.params;
//   const startTime = Date.now();

//   try {
//     const Employee = require('../models/tblEmployee')(req.sequelize);

//     const deleted = await Employee.destroy({
//       where: { EmployeeID: id }
//     });

//     if (deleted) {
//       logger.info(`Deleted employee with ID ${id} successfully in ${Date.now() - startTime}ms`);
//       return res.status(200).json({
//         meta: { statusCode: 200 },
//         message: 'Employee deleted successfully.'
//       });
//     }

//     logger.warn(`Employee with ID ${id} not found`);
//     res.status(404).json({
//       meta: { statusCode: 404, errorCode: 1022 },
//       error: { message: `Employee with ID ${id} not found. Please check the ID and try again.` }
//     });
//   } catch (error) {
//     logger.error(`Error deleting employee with ID ${id}: ${error.message} in ${Date.now() - startTime}ms`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 991 },
//       error: { message: 'Failed to delete employee due to a server error. Please try again later.' }
//     });
//   }
// };
