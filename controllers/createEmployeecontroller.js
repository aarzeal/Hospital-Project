const path = require('path');
const fs = require('fs');
const { Employee } = require('../models/tblEmployee'); // Adjust the import path as per your project structure
const logger = require('../logger'); // Replace with your logger implementation
const { error } = require('console');
const { validationResult } = require('express-validator');



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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now(); 
      logger.info('Validation errors occurred', errors);
      return res.status(400).json({
          meta: {
              statusCode: 400,
              errorCode: 912,
              executionTime: `${end - start}ms`
          },
          error: {
              message: 'Validation errors occurred',
              details: errors.array().map(err => ({
                  field: err.param,
                  message: err.msg
              }))
          }
      });
  }
  
  const {  FName, MName, LName, SkillSetIDR, Gender, EmployeeGroup, BloodGroupIDR,
        DepartmentIDR, DesignationIDR, NationalityIDR, ReligionIDR, CastIDF,
        QualificationIDR, EmployeeCategoryIDR, EmployeeCode, EmployeeNo, UniqueTAXNo,
        EmployeePhoto, WagesIDF, DateOfBirth, DateOfJoining, DateOfLeaving, MaritalStatus,
        DrRegistrationNumber, CandidateCode, ProbApplicable, ProbPeriodDate, ProbComplete,
        SalaryPlanIDF, RulePlanIDF, BankLedgerIDF, HoursPerDay, BankAcNo, SSFApplicable,
        SSFNo, NoOfChildren, NoOfDependant, IsEmployeeRetire, IsSalaryOnHold, HealthCardNo,
        PassPortNo, PassPortExpDate, EmployeeType, DutyScheduleType, RelationWithMName,
        ReasonOfLeaving, EmpBankIDR, GovernmentPlan, PracticeNumber, Reserve1, Reserve2, Reserve3, Reserve4 } = req.body;
  const HospitalIDR = req.hospitalId;

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    await Employee.sync();
    const newEmployee = await Employee.create({
      FName,
            MName,
            LName,
            SkillSetIDR,
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
            PracticeNumber, Reserve1, Reserve2, Reserve3, Reserve4
    });
    logger.info('Created new department successfully');
    const end = Date.now(); 
    res.status(200).json({
      meta: { statusCode: 200, executionTime: `${end - start}ms`},
      data: newEmployee
    });
  } catch (error) {
    logger.error(`Error creating department: ${error.message}`);
    const end = Date.now(); 
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1025 , executionTime: `${end - start}ms`},
      error: { message: 'Failed to create department due to a server error. Please ensure all fields are correctly filled and try again.' }
    });
  } 
};
exports.getEmployee = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employee = await Employee.findByPk(id);

    if (!employee) {
      logger.warn(`Employee with ID ${id} not found`);
      const end = Date.now(); 
      return res.status(404).json({
        meta: { statusCode: 404 ,errorCode:1026, executionTime: `${end - start}ms`},
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
    const end = Date.now(); 
    res.status(200).json({
      
      meta: { statusCode: 200 , executionTime: `${end - start}ms`},
      data: employeeData
    });
  } catch (error) {
    const end = Date.now(); 
    logger.error(`Error fetching employee: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1027, executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch employee data due to a server error.' }
    });
  }
};
// Update Employee
exports.updateEmployee = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const updateData = req.body;

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employee = await Employee.findByPk(id);

    if (!employee) {
      const end = Date.now(); 
      return res.status(404).json({
        meta: { statusCode: 404, errroCode :1028 , executionTime: `${end - start}ms`},
        error: { message: 'Employee not found' }
      });
    }

    await employee.update(updateData);
    logger.info('Updated employee successfully');
    const end = Date.now(); 
    res.status(200).json({
      meta: { statusCode: 200 },
      message: 'Updated employee successfully' ,
      data: employee

    });
  } catch (error) {
    const end = Date.now(); 
    logger.error(`Error updating employee: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1029 , executionTime: `${end - start}ms`},
      error: { message: 'Failed to update employee due to a server error.' }
    });
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employee = await Employee.findByPk(id);

    if (!employee) {
      const end = Date.now(); 
      return res.status(404).json({
        meta: { statusCode: 404  , errorCode :1030, executionTime: `${end - start}ms`},
        error: { message: 'Employee not found' }
      });
    }

    await employee.destroy();
    logger.info('Deleted employee successfully');
    const end = Date.now(); 
    res.status(200).json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      message: 'Deleted employee successfully'
    });
  } catch (error) {
    logger.error(`Error deleting employee: ${error.message}`);
    const end = Date.now(); 
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1031, executionTime: `${end - start}ms` },
      error: { message: 'Failed to delete employee due to a server error.' }
    });
  }
};



exports.getEmployeeWithPagination = async (req, res) => {
  const start = Date.now();
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employees = await Employee.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const employeeData = employees.rows.map(employee => {
      const data = employee.toJSON();
      data.Gender = config.Gender[String(data.Gender)] || "Unknown";
      data.BloodGroupIDR = config.BloodGroup[String(data.BloodGroupIDR)] || "Unknown";
      data.NationalityIDR = config.Nationality[String(data.NationalityIDR)] || "Unknown";
      data.ReligionIDR = config.Religion[String(data.ReligionIDR)] || "Unknown";
      data.CastIDF = config.Cast[String(data.CastIDF)] || "Unknown";
      data.QualificationIDR = config.Qualification[String(data.QualificationIDR)] || "Unknown";
      data.MaritalStatus = config.MaritalStatus[String(data.MaritalStatus)] || "Unknown";
      return data;
    });
    const end = Date.now(); 

    res.status(200).json({
      meta: {
        statusCode: 200,
         executionTime: `${end - start}ms`,
        totalItems: employees.count,
        totalPages: Math.ceil(employees.count / limit),
        currentPage: parseInt(page)
      },
      data: employeeData
    });
  } catch (error) {
    const end = Date.now(); 
    logger.error(`Error fetching employees with pagination: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1032 , executionTime: `${end - start}ms`},
      error: { message: 'Failed to fetch employees with pagination due to a server error.' }
    });
  }
}

exports.getAllEmployees = async (req, res) => {
  const start = Date.now();

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employees = await Employee.findAll();

    if (!employees || employees.length === 0) {
      const end = Date.now(); 
      logger.warn('No employees found');
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1033 , executionTime: `${end - start}ms`},
        error: { message: 'No employees found' }
      });
    }

    const employeeData = employees.map(employee => {
      const data = employee.toJSON();
      data.Gender = config.Gender[String(data.Gender)] || "Unknown";
      data.BloodGroupIDR = config.BloodGroup[String(data.BloodGroupIDR)] || "Unknown";
      data.NationalityIDR = config.Nationality[String(data.NationalityIDR)] || "Unknown";
      data.ReligionIDR = config.Religion[String(data.ReligionIDR)] || "Unknown";
      data.CastIDF = config.Cast[String(data.CastIDF)] || "Unknown";
      data.QualificationIDR = config.Qualification[String(data.QualificationIDR)] || "Unknown";
      data.MaritalStatus = config.MaritalStatus[String(data.MaritalStatus)] || "Unknown";
      return data;
    });
    const end = Date.now(); 

    res.status(200).json({
      meta: { statusCode: 200 , executionTime: `${end - start}ms`},
      data: employeeData
    });
  } catch (error) {
    logger.error(`Error fetching all employees: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1034, executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch employees due to a server error.' }
    });
  }
};


