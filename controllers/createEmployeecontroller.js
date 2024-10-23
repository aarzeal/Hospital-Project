const path = require('path');
const fs = require('fs');
const { Employee } = require('../models/tblEmployee'); // Adjust the import path as per your project structure
const logger = require('../logger'); // Replace with your logger implementation
const { error } = require('console');
const { validationResult } = require('express-validator');
const requestIp = require('request-ip');

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 1035 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

let config;

try {
  const configPath = path.join(__dirname, '../config/employeeConfig.json');
  const configFile = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configFile);

} catch (error) {

  console.error('Error loading employeeConfig.json:', error);
  throw error; // Ensure errors are thrown to halt further execution if config loading fails
}



const multer = require('multer');



// Define multer storage for uploading employee photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../empPhoto');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Construct a filename using the employee's name
    const { FName, MName, LName } = req.body;
    const employeeName = `${FName}_${MName || ''}_${LName}`.replace(/\s+/g, '_').trim(); // Replace spaces with underscores
    const sanitizedFileName = employeeName + path.extname(file.originalname); // Use the original file extension
    cb(null, sanitizedFileName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit
  }
});
const saveBase64Image = (base64String, filename) => {
  // Split the base64 string into parts to get the extension
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  const ext = matches[1].split('/')[1]; // Get the extension
  const data = matches[2]; // Get the base64 data
  const buffer = Buffer.from(data, 'base64'); // Decode the base64 data

  // Create the directory if it doesn't exist
  const uploadPath = path.join(__dirname, '../empPhoto');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Create the full file path with the extension
  const filePath = path.join(uploadPath, `${filename}.${ext}`);
  fs.writeFileSync(filePath, buffer); // Save the file

  return filePath; // Return the saved file path
};

// Update createEmployee to include the image upload
exports.createEmployee = [
  upload.single('EmployeePhoto'), // Use the multer middleware for handling employee photo uploads

  async (req, res) => {
    const start = Date.now();
    const errors = validationResult(req);
    const clientIp = await getClientIp(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1036;

      // Log the validation errors
      logger.logWithMeta("warn", `Validation errors occurred: ${errors.array().map(err => err.msg).join(', ')}`, {
        errorCode,
        errorMessage: 'Validation errors occurred',
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode,
          executionTime,
        },
        error: {
          message: 'Validation errors occurred',
          details: errors.array().map(err => ({
            field: err.param,
            message: err.msg,
          })),
        },
      });
    }

    // Destructure fields from the request body
    const {
      FName, MName, LName, SpecialtyIDR, Gender, EmployeeGroup, BloodGroupIDR,
      DepartmentIDR, DesignationIDR, NationalityIDR, ReligionIDR, CastIDF,
      QualificationIDR, EmployeeCategoryIDR, EmployeeCode, EmployeeNo, UniqueTAXNo,
      WagesIDF, DateOfBirth, DateOfJoining, DateOfLeaving, MaritalStatus,
      DrRegistrationNumber, CandidateCode, ProbApplicable, ProbPeriodDate, ProbComplete,
      SalaryPlanIDF, RulePlanIDR, BankLedgerIDR, HoursPerDay, BankAcNo, SSFApplicable,
      SSFNo, NoOfChildren, NoOfDependant, IsEmployeeRetire, IsSalaryOnHold, HealthCardNo,
      PassPortNo, PassPortExpDate, EmployeeType, DutyScheduleType, RelationWithMName,
      ReasonOfLeaving, EmpBankIDR, GovernmentPlan, PracticeNumber, Reserve1, Reserve2, Reserve3, Reserve4 
    } = req.body;

    const HospitalIDR = req.hospitalId;

    try {
      const Employee = require('../models/tblEmployee')(req.sequelize);
      await Employee.sync();

      // Handle EmployeePhoto field
      let EmployeePhotoPath = null;
      if (req.file) {
        EmployeePhotoPath = req.file.path; // Get the uploaded file path
      } else if (req.body.EmployeePhoto) {
        // Handle base64 image if provided in the request body
        EmployeePhotoPath = saveBase64Image(req.body.EmployeePhoto, req.body.EMRNumber);
      }

      // Create a new employee record
      const newEmployee = await Employee.create({
        FName,
        MName,
        LName,
        SpecialtyIDR,
        Gender,
        EmployeeGroup,
        BloodGroupIDR,
        DepartmentIDR,
        DesignationIDR,
        NationalityIDR,
        ReligionIDR,
        CastIDF,
        QualificationIDR,
        EmployeeCategoryIDR,
        EmployeeCode,
        EmployeeNo,
        UniqueTAXNo,
        EmployeePhoto: EmployeePhotoPath, // Save the path to the EmployeePhoto
        WagesIDF,
        DateOfBirth,
        DateOfJoining,
        DateOfLeaving,
        MaritalStatus,
        DrRegistrationNumber,
        CandidateCode,
        ProbApplicable,
        ProbPeriodDate,
        ProbComplete,
        SalaryPlanIDF,
        RulePlanIDR,
        BankLedgerIDR,
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
        PracticeNumber,
        Reserve1,
        Reserve2,
        Reserve3,
        Reserve4
      });

      const end = Date.now();
      const executionTime = `${end - start}ms`;

      // Log successful employee creation
      logger.logWithMeta("info", `Created new Employee successfully`, {
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({
        meta: {
          statusCode: 200,
          executionTime,
        },
        data: newEmployee,
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1037;

      // Log the error
      logger.logWithMeta("error", `Error creating Employee: ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode,
          executionTime,
        },
        error: {
          message: 'Failed to create Employee due to a server error. Please ensure all fields are correctly filled and try again.',
        },
      });
    }
  }
];


// exports.createEmployee = async (req, res) => {
//   const start = Date.now();
//   const errors = validationResult(req);
//   const clientIp = await getClientIp(req);

//   // Check for validation errors
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 1036;

//     // Log the validation errors
//     logger.logWithMeta("warn", `Validation errors occurred: ${errors.array().map(err => err.msg).join(', ')}`, {
//       errorCode,
//       errorMessage: 'Validation errors occurred',
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'], // HTTP method
//     });

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode,
//         executionTime,
//       },
//       error: {
//         message: 'Validation errors occurred',
//         details: errors.array().map(err => ({
//           field: err.param,
//           message: err.msg,
//         })),
//       },
//     });
//   }

//   // Destructure fields from the request body
//   const {
//     FName, MName, LName, SpecialtyIDR, Gender, EmployeeGroup, BloodGroupIDR,
//     DepartmentIDR, DesignationIDR, NationalityIDR, ReligionIDR, CastIDF,
//     QualificationIDR, EmployeeCategoryIDR, EmployeeCode, EmployeeNo, UniqueTAXNo,
//     EmployeePhoto, WagesIDF, DateOfBirth, DateOfJoining, DateOfLeaving, MaritalStatus,
//     DrRegistrationNumber, CandidateCode, ProbApplicable, ProbPeriodDate, ProbComplete,
//     SalaryPlanIDF, RulePlanIDF, BankLedgerIDF, HoursPerDay, BankAcNo, SSFApplicable,
//     SSFNo, NoOfChildren, NoOfDependant, IsEmployeeRetire, IsSalaryOnHold, HealthCardNo,
//     PassPortNo, PassPortExpDate, EmployeeType, DutyScheduleType, RelationWithMName,
//     ReasonOfLeaving, EmpBankIDR, GovernmentPlan, PracticeNumber, Reserve1, Reserve2, Reserve3, Reserve4 
//   } = req.body;

//   const HospitalIDR = req.hospitalId;

//   try {
//     const Employee = require('../models/tblEmployee')(req.sequelize);
//     await Employee.sync();

//     // Create a new employee record
//     const newEmployee = await Employee.create({
//       FName,
//       MName,
//       LName,
//       SpecialtyIDR,
//       Gender,
//       EmployeeGroup,
//       BloodGroupIDR,
//       DepartmentIDR,
//       DesignationIDR,
//       NationalityIDR,
//       ReligionIDR,
//       CastIDF,
//       QualificationIDR,
//       EmployeeCategoryIDR,
//       EmployeeCode,
//       EmployeeNo,
//       UniqueTAXNo,
//       EmployeePhoto,
//       WagesIDF,
//       DateOfBirth,
//       DateOfJoining,
//       DateOfLeaving,
//       MaritalStatus,
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
//       PracticeNumber,
//       Reserve1,
//       Reserve2,
//       Reserve3,
//       Reserve4
//     });

//     const end = Date.now();
//     const executionTime = `${end - start}ms`;

//     // Log successful employee creation
//     logger.logWithMeta("info", `Created new Employee successfully`, {
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'], // HTTP method
//     });

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//       },
//       data: newEmployee,
//     });
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 1037;

//     // Log the error
//     logger.logWithMeta("error", `Error creating Employee: ${error.message}`, {
//       errorCode,
//       errorMessage: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'], // HTTP method
//     });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode,
//         executionTime,
//       },
//       error: {
//         message: 'Failed to create Employee due to a server error. Please ensure all fields are correctly filled and try again.',
//       },
//     });
//   }
// };



// exports.createEmployee = async (req, res) => {
//   const start = Date.now();
//   const errors = validationResult(req);
//   const clientIp = await getClientIp(req);
  
//   // Handle validation errors
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 1036;

//     // Log the validation warning
//     logger.logWithMeta("warn", `Validation errors occurred: ${errors.array()}`, {
//       errorCode,
//       errorMessage: 'Validation errors occurred',
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers['user-agent'],
//     });

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 1036,
//         executionTime,
//       },
//       error: {
//         message: 'Validation errors occurred',
//         details: errors.array().map(err => ({
//           field: err.param,
//           message: err.msg,
//         })),
//       },
//     });
//   }

//   // Extract employee data from request body
//   const { 
//     FName, MName, LName, SpecialtyIDR, Gender, EmployeeGroup, BloodGroupIDR,
//     DepartmentIDR, DesignationIDR, NationalityIDR, ReligionIDR, CastIDF,
//     QualificationIDR, EmployeeCategoryIDR, EmployeeCode, EmployeeNo, UniqueTAXNo,
//     EmployeePhoto, WagesIDF, DateOfBirth, DateOfJoining, DateOfLeaving, MaritalStatus,
//     DrRegistrationNumber, CandidateCode, ProbApplicable, ProbPeriodDate, ProbComplete,
//     SalaryPlanIDF, RulePlanIDF, BankLedgerIDF, HoursPerDay, BankAcNo, SSFApplicable,
//     SSFNo, NoOfChildren, NoOfDependant, IsEmployeeRetire, IsSalaryOnHold, HealthCardNo,
//     PassPortNo, PassPortExpDate, EmployeeType, DutyScheduleType, RelationWithMName,
//     ReasonOfLeaving, EmpBankIDR, GovernmentPlan, PracticeNumber, Reserve1, Reserve2, Reserve3, Reserve4 
//   } = req.body;
  
//   const HospitalIDR = req.hospitalId; // Assuming this is set correctly in your middleware

//   try {
//     // Ensure your model is imported correctly and initialized
//     const Employee = require('../models/tblEmployee')(req.sequelize);

//     // Create a new employee record
//     const newEmployee = await Employee.create({
//       FName, MName, LName, SpecialtyIDR, Gender, EmployeeGroup,
//       BloodGroupIDR, DepartmentIDR, DesignationIDR, NationalityIDR,
//       ReligionIDR, CastIDF, QualificationIDR, EmployeeCategoryIDR,
//       EmployeeCode, EmployeeNo, UniqueTAXNo, EmployeePhoto, WagesIDF,
//       DateOfBirth, DateOfJoining, DateOfLeaving, MaritalStatus,
//       DrRegistrationNumber, CandidateCode, ProbApplicable, ProbPeriodDate,
//       ProbComplete, SalaryPlanIDF, RulePlanIDF, BankLedgerIDF,
//       HoursPerDay, BankAcNo, SSFApplicable, SSFNo, NoOfChildren,
//       NoOfDependant, IsEmployeeRetire, IsSalaryOnHold, HealthCardNo,
//       PassPortNo, PassPortExpDate, EmployeeType, DutyScheduleType,
//       HospitalIDR, RelationWithMName, ReasonOfLeaving, EmpBankIDR,
//       GovernmentPlan, PracticeNumber, Reserve1, Reserve2, Reserve3, Reserve4,
//     });

//     const end = Date.now();
//     const executionTime = `${end - start}ms`;

//     // Log the success message
//     logger.logWithMeta("info", `Created new Employee successfully`, {
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers['user-agent'],
//     });

//     res.status(201).json({
//       meta: { statusCode: 201, executionTime },
//       data: newEmployee,
//     });

//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 1037;

//     // Log the error
//     logger.logWithMeta("error", `Error creating Employee: ${error.message}`, {
//       errorCode,
//       errorMessage: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers['user-agent'],
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime },
//       error: { 
//         message: 'Failed to create Employee due to a server error. Please ensure all fields are correctly filled and try again.' 
//       },
//     });
//   }
// };
exports.getEmployee = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const clientIp = await getClientIp(req);

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employee = await Employee.findByPk(id);

    if (!employee) {
      // logger.warn(`Employee with ID ${id} not found`);
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1038;
  
      // Log the warning
      logger.logWithMeta("warn", `Employee with ID ${id} not found ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      return res.status(404).json({
        meta: { statusCode: 404 ,errorCode:1038, executionTime: `${end - start}ms`},
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
    const executionTime = `${end - start}ms`;
   

    // Log the warning
    logger.logWithMeta("warn", ` Employee  get successfully`, {


      executionTime,
      hospitalId: req.hospitalId,
      

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });

    

    res.status(200).json({
      
      meta: { statusCode: 200 , executionTime: `${end - start}ms`},
      data: employeeData
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1039;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching employee: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error fetching employee: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1039, executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch employee data due to a server error.' }
    });
  }
};
// Update Employee
exports.updateEmployee = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const clientIp = await getClientIp(req);
  const updateData = req.body;

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employee = await Employee.findByPk(id);

    if (!employee) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1040;
  
      // Log the warning
      logger.logWithMeta("warn", `Employee not found: ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      return res.status(404).json({
        meta: { statusCode: 404, errroCode :1040 , executionTime: `${end - start}ms`},
        error: { message: 'Employee not found' }
      });
    }

    await employee.update(updateData);
    // logger.info('Updated employee successfully');
    const end = Date.now();
    const executionTime = `${end - start}ms`;
   

    // Log the warning
    logger.logWithMeta("warn", ` Updated employee successfully`, {


      executionTime,
      hospitalId: req.hospitalId,
      

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    res.status(200).json({
      meta: { statusCode: 200 },
      message: 'Updated employee successfully' ,
      data: employee

    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1041;

    // Log the warning
    logger.logWithMeta("warn", `Error updating employee:${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error updating employee: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1041 , executionTime: `${end - start}ms`},
      error: { message: 'Failed to update employee due to a server error.' }
    });
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employee = await Employee.findByPk(id);

    if (!employee) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1042;
  
      // Log the warning
      logger.logWithMeta("warn", `Employee not found:${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      return res.status(404).json({
        meta: { statusCode: 404  , errorCode :1042, executionTime: `${end - start}ms`},
        error: { message: 'Employee not found' }
      });
    }

    await employee.destroy();
    // logger.info('Deleted employee successfully');
    const end = Date.now();
    const executionTime = `${end - start}ms`;
   

    // Log the warning
    logger.logWithMeta("warn", ` Deleted employee successfully`, {


      executionTime,
      hospitalId: req.hospitalId,
      

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    res.status(200).json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      message: 'Deleted employee successfully'
    });
  } catch (error) {
    // logger.error(`Error deleting employee: ${error.message}`);
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1043;

    // Log the warning
    logger.logWithMeta("warn", `Error deleting employee:${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1043, executionTime: `${end - start}ms` },
      error: { message: 'Failed to delete employee due to a server error.' }
    });
  }
};



exports.getEmployeeWithPagination = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
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
    const executionTime = `${end - start}ms`;
   

    // Log the warning
    logger.logWithMeta("warn", `  employee get with pagination successfully`, {


      executionTime,
      hospitalId: req.hospitalId,
      

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
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
    const executionTime = `${end - start}ms`;
    const errorCode = 1044;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching employees with pagination::${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error fetching employees with pagination: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1044 , executionTime: `${end - start}ms`},
      error: { message: 'Failed to fetch employees with pagination due to a server error.' }
    });
  }
}

exports.getAllEmployees = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);

  try {
    const Employee = require('../models/tblEmployee')(req.sequelize);
    const employees = await Employee.findAll();

    if (!employees || employees.length === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1045;
  
      // Log the warning
      logger.logWithMeta("warn", `No employees found:${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.warn('No employees found');
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1045 , executionTime: `${end - start}ms`},
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
    const executionTime = `${end - start}ms`;
   

    // Log the warning
    logger.logWithMeta("warn", `   get All employee  successfully`, {


      executionTime,
      hospitalId: req.hospitalId,
      

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });

    res.status(200).json({
      meta: { statusCode: 200 , executionTime: `${end - start}ms`},
      data: employeeData
    });
  } catch (error) {
    const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1046;
  
      // Log the warning
      logger.logWithMeta("warn", `Error fetching all employees::${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
    // logger.error(`Error fetching all employees: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1046, executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch employees due to a server error.' }
    });
  }
};


