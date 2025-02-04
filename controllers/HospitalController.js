// const { validationResult } = require('express-validator');
// const Hospital = require('../models/HospitalModel');
// const sequelize = require('../database/connection');
// const createUserMasterModel = require('../models/userMaster');
// const createPatientMasterModel = require('../models/paitentMaster');
// const createDynamicConnection = require('../database/dynamicConnection');
// const bcrypt = require('bcrypt');

// // exports.createHospital = async (req, res) => {
// //   const errors = validationResult(req);
// //   if (!errors.isEmpty()) {
// //     return res.status(400).json({
// //       meta: {
// //         statusCode: 400,
// //         errorCode: 908
// //       },
// //       error: {
// //         message: 'Validation errors occurred',
// //         details: errors.array().map(err => ({
// //           field: err.param,
// //           message: err.msg
// //         }))
// //       }

// //     });
// //   }

// //   try {
// //     const hospital = await Hospital.create(req.body);
// //     res.status(200).json({
// //       meta: {
// //         statusCode: 200
// //       },
// //       data: hospital
// //     });
// //   } catch (error) {
// //     res.status(400).json({
// //       meta: {
// //         statusCode: 400,
// //         errorCode: 909
// //       },
// //       error: {
// //         message: 'Error creating hospital: ' + error.message
// //       }
// //     });
// //   }
// // };

//   // exports.createHospital = async (req, res) => {

//   //   const errors = validationResult(req);
//   //   if (!errors.isEmpty()) {
//   //     return res.status(400).json({
//   //       meta: {
//   //         statusCode: 400,
//   //         errorCode: 908
//   //       },
//   //       error: {
//   //         message: 'Validation errors occurred',
//   //         details: errors.array().map(err => ({
//   //           field: err.param,
//   //           message: err.msg
//   //         }))
//   //       }
//   //     });
//   //   }

//   //   try {
//   //     const hospital = await Hospital.create(req.body);

//   //     // Generate database name (e.g., from HospitalName)
//   //     const databaseName = hospital.HospitalDatabase.replace(/\s+/g, '_').toLowerCase();

//   //     // Check if database exists (MySQL specific query)
//   //     // const [databases] = await sequelize.query(`SHOW DATABASES LIKE '${databaseName}'`);

//   //     // if (databases.length === 0) {
//   //       // Create new database
//   //       await sequelize.query(`CREATE DATABASE \`${databaseName}\``);
//   //     // }

//   //     const { sequelize: dynamicDb, testConnection } = createDynamicConnection(databaseName);

//   //     // Define the models for the new database
//   //     // const User_Master = createUserMasterModel(dynamicDb);
//   //     // const Patient_master = createPatientMasterModel(dynamicDb);

//   //     await testConnection();

//   //     await dynamicDb.sync();

//   //     // Associate hospital with database (store the association in your application's database)
//   //     // Add code here if you need to store this association

//   //     res.status(200).json({
//   //       meta: {
//   //         statusCode: 200
//   //       },
//   //       data: hospital
//   //     });
//   //   } catch (error) {
//   //     res.status(400).json({
//   //       meta: {
//   //         statusCode: 400,
//   //         errorCode: 909
//   //       },
//   //       error: {
//   //         message: 'Error creating hospital: ' + error.message
//   //       }
//   //     });
//   //   }
//   // };

//   exports.createHospital = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 908
//         },
//         error: {
//           message: 'Validation errors occurred',
//           details: errors.array().map(err => ({
//             field: err.param,
//             message: err.msg
//           }))
//         }
//       });
//     }

//     try {
//         const hospital = await Hospital.create(req.body);

//         // Generate database name (e.g., from HospitalDatabase field)
//         const databaseName = hospital.HospitalDatabase.replace(/\s+/g, '_').toLowerCase();

//         // Create new database
//         await sequelize.query(`CREATE DATABASE \`${databaseName}\``);

//         const { sequelize: dynamicDb, testConnection } = createDynamicConnection(databaseName);

//         // Test the connection to the new database
//         await testConnection();

//         // Define and sync the UserMaster model in the new database
//         const UserMaster = await createUserMasterModel(dynamicDb);

//         // Sync all models
//         await dynamicDb.sync();

//         res.status(200).json({
//             meta: {
//                 statusCode: 200
//             },
//             data: hospital
//         });
//     } catch (error) {
//         res.status(400).json({
//             meta: {
//                 statusCode: 400,
//                 errorCode: 909
//             },
//             error: {
//                 message: 'Error creating hospital: ' + error.message
//             }
//         });
//     }
// };

const validateJSONContentType = require("../Middleware/jsonvalidation");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../Middleware/sendEmail");
const sendUserEmail = require("../Middleware/sendUserEmail");
const { Op } = require("sequelize");
const express = require("express");
const router = express.Router();

const multer = require('multer');
const {
  createUserValidationRules,
} = require("../validators/hospitalValidator");

const { validationResult } = require("express-validator");
const Hospital = require("../models/HospitalModel");
const sequelize = require("../database/connection");
const createUserMasterModel = require("../models/userMaster");
const createPatientMasterModel = require("../models/PatientMaster");
const createDynamicConnection = require("../database/dynamicConnection");
// const bcrypt = require('bcrypt');
const bcrypt = require("bcryptjs");
const logger = require("../logger"); // Assuming logger is configured properly in '../logger'
const jwt = require("jsonwebtoken");
const { DataTypes } = require("sequelize");
const { User } = require("../models/user");
const CountAPI = require("../models/ApisCounts");
const redis = require("redis");
const path = require('path');
const fs = require('fs');
const {

  redisClient,
  getAsync,
  setAsync,
} = require("../Middleware/redisClient");

const client = redis.createClient();

const requestIp = require("request-ip");
async function getClientIp(req) {
  let clientIp =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (
    clientIp === "::1" ||
    clientIp === "127.0.0.1" ||
    clientIp.startsWith("192.168") ||
    clientIp.startsWith("10.") ||
    clientIp.startsWith("172.")
  ) {
    try {
      const ipResponse = await axios.get("https://api.ipify.org?format=json");
      clientIp = ipResponse.data.ip;
    } catch (error) {
      logger.logWithMeta("Error fetching public IP", {
        error: error.message,
        erroerCode: 900,
      });

      clientIp = "127.0.0.1"; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

const dotenv = require("dotenv");
dotenv.config();
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, '../empPhoto');
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     // Construct a filename using the employee's name
//     const { FName, MName, LName } = req.body;
//     const employeeName = `${FName}_${MName || ''}_${LName}`.replace(/\s+/g, '_').trim(); // Replace spaces with underscores
//     const sanitizedFileName = employeeName + path.extname(file.originalname); // Use the original file extension
//     cb(null, sanitizedFileName);
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 50 * 1024 * 1024 // 50 MB limit
//   }
// });

// const saveBase64Image = (base64String, filename) => {
//   // Match and extract file extension and data
//   const matches = base64String.match(/^data:(.+);base64,(.+)$/);
//   if (!matches || matches.length !== 3) {
//     throw new Error("Invalid base64 string");
//   }

//   const ext = matches[1].split("/")[1]; // Get the extension
//   const data = matches[2]; // Get the base64 data
//   const buffer = Buffer.from(data, "base64"); // Decode the base64 data

//   // Create the directory if it doesn't exist
//   const uploadPath = path.join(__dirname, "../profile");
//   if (!fs.existsSync(uploadPath)) {
//     fs.mkdirSync(uploadPath, { recursive: true });
//   }

//   // Create the full file path with the extension
//   const filePath = path.join(uploadPath, `${filename}.${ext}`);
//   fs.writeFileSync(filePath, buffer); // Save the file

//   return filePath; // Return the saved file path
// };

// exports.createHospital = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   // let end;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 901;

//     // Log the warning
//     logger.logWithMeta("warn", `Validation errors occurred `, {
//       errorCode,
//       // errorMessage: error.message,
//       statusCode: 400,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers["user-agent"], // HTTP method
//     });

//     // logger.info('Validation errors occurred', errors);
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 901,
//         // executionTime: `${end - start}ms`
//       },
//       error: {
//         message: "Validation errors occurred",
//         details: errors.array().map((err) => ({
//           field: err.param,
//           message: err.msg,
//         })),
//       },
//     });
//   }

//   try {
//     const existingHospital = await Hospital.findOne({
//       where: { ManagingCompanyEmail: req.body.ManagingCompanyEmail },
//     });
//     if (existingHospital) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 902;

//       // Log the warning
//       logger.logWithMeta(
//         "warn",
//         `Managing Company Email already exists `,
//         {
//           errorCode,
//           statusCode: 400,
         
//           executionTime,
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers["user-agent"], // HTTP method
//         }
//       );

//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 902,
//           //  executionTime: `${end - start}ms`
//         },
//         error: {
//           message: "Managing Company Email already exists",
//         },
//       });
//     }
//     const hospital = await Hospital.create(req.body);
//     logger.info("Hospital created successfully", {
//       hospitalId: hospital.HospitalID,
//       // executionTime: `${end - start}ms`
//     });

//     // Generate database name (e.g., from HospitalDatabase field)
//     const databaseName = hospital.HospitalDatabase.replace(
//       /\s+/g,
//       "_"
//     ).toLowerCase();
//     logger.info(`Generated database name: ${databaseName}`);

//     // Create new database
//     await sequelize.query(`CREATE DATABASE \`${databaseName}\``);
//     // logger.info(`Database ${databaseName} created successfully`);
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     // Log the warning
//     logger.logWithMeta(
//       "warn",
//       `Database ${databaseName} created successfully`,
//       {
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers["user-agent"], // HTTP method
//       }
//     );

//     // const { sequelize: dynamicDb, testConnection } = createDynamicConnection(databaseName);

//     // Test the connection to the new database
//     // await testConnection();
//     // logger.info(`Connected to database ${databaseName} successfully`);

//     // Define and sync the UserMaster model in the new database
//     // const UserMaster = createUserMasterModel(dynamicDb);

//     // Sync all models
//     // await dynamicDb.sync();
//     logger.info(`Models synchronized successfully in database ${databaseName}`);

//     const uniqueKey = uuidv4();
//     logger.info(`Generated unique key: ${uniqueKey}`);

//     hospital.UniqueKey = uniqueKey;
//     await hospital.save({ fields: ["UniqueKey"] });

//     // Log the warning
//     logger.logWithMeta(
//       "warn",
//       `Unique key stored in hospital record successfully`,
//       {
//         executionTime,
//         statusCode: 200,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers["user-agent"], // HTTP method
//       }
//     );

//     // logger.info(`Unique key stored in hospital record successfully`);
//     // const end = Date.now();
//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         // executionTime: `${end - start}ms`
//       },
//       data: hospital,
//       // data: newHospital,
//         // ...newHospital,
//           // img: logoBase64 
//     });
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 903;

//     // Log the warning
//     logger.logWithMeta("warn", `Error creating hospital `, {
//       errorCode,
//       statusCode: 400,
//       // errorMessage: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers["user-agent"], // HTTP method
//     });
//     // logger.error('Error creating hospital', { error: error.message });
//     res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 903,
//         // executionTime: `${end - start}ms`
//       },
//       error: {
//         message: "Error creating hospital: " + error.message,
//       },
//     });
//   }
// };































// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
    
//     const uploadPath = path.join(__dirname, '../profile');
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   // filename: (req, file, cb) => {
//   //   cb(null, Date.now() + path.extname(file.originalname));
//   // }
//   filename: async (req, file, cb) => {
//     try {
//       // Generate EMRNumber before saving the file to use it as 
//       cb(null, `${'photo'}${path.extname(file.originalname)}`);
//     } catch (err) {
//       logger.logWithMeta('Error storing img file path ', { error: err.message, erroerCode: 975 });

//       cb(err);
//     }
//   }
// });
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 50 * 1024 * 1024 // 50 MB limit
//   }})
// // const upload = multer({ storage });

// // Function to decode base64 image and save it as a file
// const saveBase64Image = (base64String, filename) => {
//   // Split the base64 string into parts to get the extension
//   const matches = base64String.match(/^data:(.+);base64,(.+)$/);
//   if (!matches || matches.length !== 3) {
//     throw new Error('Invalid base64 string');
//   }
//   const ext = matches[1].split('/')[1]; // Get the extension
//   const data = matches[2]; // Get the base64 data
//   const buffer = Buffer.from(data, 'base64'); // Decode the base64 data

//   // Create the directory if it doesn't exist
//   const uploadPath = path.join(__dirname, '../profile');
//   if (!fs.existsSync(uploadPath)) {
//     fs.mkdirSync(uploadPath, { recursive: true });
//   }

//   // Create the full file path with the extension
//   const filePath = path.join(uploadPath, `${filename}.${ext}`);
//   fs.writeFileSync(filePath, buffer); // Save the file

//   return filePath; // Return the saved file path
// };

// exports.createPatient = [
//   // Validation middleware (ensure this is used before multer middleware)
//   // Example: body('name').notEmpty().withMessage('Name is required'),

//   // File upload middleware
  
//   upload.single('HospitalLogo'),

//   async (req, res) => {
//     console.log('Request Body:', req.body);
//     console.log('Uploaded File:', req.file);

//     const start = Date.now();

//     // Check validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const end = Date.now();

//       const executionTime = `${end - start}ms`;
//       const errorCode = 976;
//       const statusCode = 400;
//       // Ensure that error.message is logged separately if needed
//       logger.logWithMeta("warn", `Validation errors occurred`, errors.array(), {
//         errorCode,
//         statusCode,
//         errorMessage: errors.array(), // Include the error message in meta explicitly
//         executionTime,
//         hospitalId: req.hospitalId,
//       });
//       // logger.info('Validation errors occurred', { errors: errors.array(), executionTime: `${end - start}ms` });
//       return res.status(statusCode).json({
//         meta: {
//           statusCode: statusCode,

//           errorCode: 976,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Validation errors occurred',
//           details: errors.array().map(err => ({
//             field: err.param,
//             message: err.msg
//           }))
//         }
//       });
//     }

//     // Get file from request
//     // const img = req.file ? req.file.path : null;

//     // Extract data from request body
//     console.log(req.body)
//     const {
//       HospitalName,
//       HospitalCode,
//       ManagingCompany,
//       ManagingCompanyAdd1,
//       ManagingCompanyAdd2,
//       ManagingCompanyAdd3,
//       ManagingCompanyEmail,
//       ManagingCompanyWebsite,
//       City,
//       Province,
//       Region,
//       Country,
//       HospitalOwner,
//       OwnerName,
//       OwnerAdd1,
//       OwnerAdd2,
//       OwnerAdd3,
//       OwnerCity,
//       OwnerProvince,
//       OwnerRegion,
//       OwnerCountry,
//       OwnerEmail,
//       HospitalIDNo,
//       TaxNumber,
//       ServiceNo,
//       RegistrationNo,
//       VATNumber,
//       GSTNo,
//       TINNo,
//       AccBooksBeginFrom,
//       OtherRegNo,
//       HospitalLogo,
//       HospitalGroupIDR,
//       CreatedDate,
//       Reserve1,
//       Reserve2,
//       Reserve3,
//       Reserve4,
//       Reserve5,
//       Reserve6,
//       HospitalDatabase,
//       Username,
//       Password,
//       MFAEnabled
//     } = req.body;


    

//     try {
//       // Check for existing patient
//       const existingPatient = await Hospital.findOne({
//         where: {
//           [Op.or]: [
            
//             { ManagingCompanyEmail }
//           ]
//         }
//       });

//       if (existingPatient) {


//         const end = Date.now();
//         const executionTime = `${end - start}ms`;
//         const errorCode = 977;
//         const statusCode = 400;

//         // Ensure that error.message is logged separately if needed
//         logger.logWithMeta("warn", `${duplicateField} already exists`, {
//           errorCode,
//           statusCode,
//           executionTime,
//           hospitalId: req.hospitalId,
//         });
//         // logger.info(`${duplicateField} already exists`, { executionTime: `${end - start}ms` });
//         return res.status(statusCode).json({
//           meta: {
//             statusCode: statusCode,
//             errorCode: 977,
//             executionTime: `${end - start}ms`
//           },
//           error: {
//             message: `${duplicateField} already exists`
//           }
//         });
//       }

//       // Generate unique EMR number
//       let savedImagePath = null;
//       let imgBase64 = null;
//       if (HospitalLogo) {
//         // If img is provided as a Base64 string
//         imgBase64 = HospitalLogo.startsWith('data:image/jpeg;base64/') ? HospitalLogo.split(',')[1] : HospitalLogo; // Extract base64 part if needed
//         // imgBase64 = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
//         savedImagePath = saveBase64Image(HospitalLogo, 'pHOTO');
//         console.log("savedImagePath",savedImagePath)
//       } else if (req.file) {
//         // If an image file is uploaded
//         const imgBuffer = fs.readFileSync(req.file.path);
//         imgBase64 = imgBuffer.toString('base64'); // Convert to base64
//       }

//       console.log("imgBase64", imgBase64);
//       console.log("req.hospitalGroupIDR :", req.hospitalGroupId)
//       // Create new patient record
//       const newHospital = await Hospital.create({
//         HospitalName,
//       HospitalCode,
//       ManagingCompany,
//       ManagingCompanyAdd1,
//       ManagingCompanyAdd2,
//       ManagingCompanyAdd3,
//       ManagingCompanyEmail,
//       ManagingCompanyWebsite,
//       City,
//       Province,
//       Region,
//       Country,
//       HospitalOwner,
//       OwnerName,
//       OwnerAdd1,
//       OwnerAdd2,
//       OwnerAdd3,
//       OwnerCity,
//       OwnerProvince,
//       OwnerRegion,
//       OwnerCountry,
//       OwnerEmail,
//       HospitalIDNo,
//       TaxNumber,
//       ServiceNo,
//       RegistrationNo,
//       VATNumber,
//       GSTNo,
//       TINNo,
//       AccBooksBeginFrom,
//       OtherRegNo,
//       HospitalGroupIDR,
//       CreatedDate,
//       Reserve1,
//       Reserve2,
//       Reserve3,
//       Reserve4,
//       Reserve5,
//       Reserve6,
//       HospitalDatabase,
//       Username,
//       Password,
//       MFAEnabled,
      
//         HospitalLogo: savedImagePath
//       });
//       // Get the real IP address of the client
//       let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

//       // // If IP is localhost or private, try fetching the public IP
//       // if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
//       //   try {
//       //     const ipResponse = await axios.get('https://api.ipify.org?format=json');
//       //     clientIp = ipResponse.data.ip;
//       //   } catch (error) {
//       //     logger.error('Error fetching public IP', { error: error.message });
//       //     clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
//       //   }
//       // }

//       // console.log('Client IP:', clientIp);
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       // let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

//       // console.log("clientIp.....",clientIp )
//       // 
//       // // Get API name and method
//       const apiName = req.originalUrl; // This gets the original URL of the request
//       const method = req.method;         // This gets the HTTP method (GET, POST, etc.)






//       // Log the creation of the new patient
//       logger.logWithMeta("info", `Created new patient with ID  in ${executionTime} ms`, {
//         executionTime,    
//         statusCode:200,                     // Execution time in ms
//         // MRNumber: newHospital.EMRNumber,       // EMR Number
//         // hospitalId: req.hospitalId,          // Hospital ID
//         // patientId: newHospital.PatientID,      // Patient ID
//         // patientFirstName: newHospital.PatientFirstName, // Include first name separately if needed
//         // userId: req.userId,                  // User ID (if available)
//         // ip: clientIp,                         // Client IP
//         userAgent: req.headers['user-agent'], // User agent from headers
//         apiName,                              // API name
//         method                                // HTTP method
//       });


//     // Generate database name (e.g., from HospitalDatabase field)
//     const databaseName = Hospital.HospitalDatabase.replace(
//       /\s+/g,
//       "_"
//     ).toLowerCase();
//     logger.info(`Generated database name: ${databaseName}`);

//     // Create new database
//     await sequelize.query(`CREATE DATABASE \`${databaseName}\``);
//     // logger.info(`Database ${databaseName} created successfully`);
//       // const end = Date.now();
//       // logger.info(`Created new patient with ID ${newHospital.PatientID} in ${end - start}ms`);
//       res.status(200).json({
//         meta: {
//           statusCode: 200,
//           executionTime: `${end - start}ms`
//         },
//         data: newHospital,
//         // ...newHospital,
//         HospitalLogo: imgBase64 
//       });
//     } catch (error) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
//       const errorCode = 978;
//       const statusCode = 500;
//       // Log the error
//       logger.logWithMeta("warn", `Error creating patient`, {
//         errorCode,
//         statusCode,
//         error: error.message,
//         executionTime,
//         hospitalId: req.hospitalId,
//         // ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method
//       });

//       // logger.error('Error creating patient', { error: error.message, executionTime: `${end - start}ms` });
//       res.status(statusCode).json({
//         meta: {
//           statusCode: statusCode,
//           errorCode: 978,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Error creating patient: ' + error.message
//         }
//       });
//     }
//   }
// ];
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../profileImg');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/\s+/g, '_'); // Replace spaces in filename
    cb(null, `${timestamp}_${sanitizedFilename}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// Save Base64 Image
const saveBase64Image = (base64String, filename) => {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  const ext = matches[1].split('/')[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');

  const uploadPath = path.join(__dirname, '../profileImg');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const filePath = path.join(uploadPath, `${filename}.${ext}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};

// Controller
// exports.createHospital = [
//   upload.single('HospitalLogo'), // Middleware for handling file upload

//   async (req, res) => {
//     const start = Date.now();
//     const errors = validationResult(req);
   
//     // Check for validation errors
//     if (!errors.isEmpty()) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 976;
//       const statusCode = 400;

//       logger.logWithMeta("warn", "Validation errors occurred", {
//         errors: errors.array(),
//         errorCode,
//         statusCode,
//         executionTime,
//         hospitalId: req.hospitalId,
//       });

//       return res.status(statusCode).json({
//         meta: {
//           statusCode: statusCode,
//           errorCode: 976,
//           executionTime: executionTime
//         },
//         error: {
//           message: 'Validation errors occurred',
//           details: errors.array().map(err => ({
//             field: err.param,
//             message: err.msg
//           }))
//         }
//       });
//     }

//     // Destructure all the necessary fields from the request body
//     const {
//       HospitalName,
//       HospitalCode,
//       ManagingCompany,
//       ManagingCompanyAdd1,
//       ManagingCompanyAdd2,
//       ManagingCompanyAdd3,
//       ManagingCompanyEmail,
//       ManagingCompanyWebsite,
//       City,
//       Province,
//       Region,
//       Country,
//       HospitalOwner,
//       OwnerName,
//       OwnerAdd1,
//       OwnerAdd2,
//       OwnerAdd3,
//       OwnerCity,
//       OwnerProvince,
//       OwnerRegion,
//       OwnerCountry,
//       OwnerEmail,
//       HospitalIDNo,
//       TaxNumber,
//       ServiceNo,
//       RegistrationNo,
//       VATNumber,
//       GSTNo,
//       TINNo,
//       AccBooksBeginFrom,
//       OtherRegNo,
//       HospitalGroupIDR,
//       CreatedDate,
//       Reserve1,
//       Reserve2,
//       Reserve3,
//       Reserve4,
//       Reserve5,
//       Reserve6,
//       HospitalDatabase,
//       Username,
//       Password,
//       MFAEnabled,
//       HospitalLogo
//     } = req.body;

//     try {
//       // Check for existing hospital based on ManagingCompanyEmail
//       const existingHospital = await Hospital.findOne({
//         where: {
//           [Op.or]: [
//             { ManagingCompanyEmail }
//           ]
//         }
//       });

//       if (existingHospital) {
//         const end = Date.now();
//         const executionTime = `${end - start}ms`;
//         const errorCode = 977;
//         const statusCode = 400;

//         logger.logWithMeta("warn", "ManagingCompanyEmail already exists", {
//           errorCode,
//           statusCode,
//           executionTime,
//           hospitalId: req.hospitalId,
//         });

//         return res.status(statusCode).json({
//           meta: {
//             statusCode: statusCode,
//             errorCode: 977,
//             executionTime: executionTime
//           },
//           error: {
//             message: 'ManagingCompanyEmail already exists'
//           }
//         });
//       }

//       // Handle image upload (file or base64)
//       let savedImagePath = null;
//       let imgBase64 = null;

//       if (HospitalLogo && HospitalLogo.startsWith('data:image')) {
//         // If HospitalLogo is a base64 string
//         console.log("-----------------yes-------------")
//         savedImagePath = saveBase64Image(HospitalLogo, 'photo');
//       } else if (req.file) {
//         // If an image file is uploaded via multer
//         savedImagePath = req.file.path;
//       }

//       if (savedImagePath) {
//         const imgBuffer = fs.readFileSync(savedImagePath);
//         imgBase64 = `data:image/${path.extname(savedImagePath).slice(1)};base64,${imgBuffer.toString('base64')}`;
//       }

//       // Create new hospital record
//       const newHospital = await Hospital.create({
//         HospitalName,
//         HospitalCode,
//         ManagingCompany,
//         ManagingCompanyAdd1,
//         ManagingCompanyAdd2,
//         ManagingCompanyAdd3,
//         ManagingCompanyEmail,
//         ManagingCompanyWebsite,
//         City,
//         Province,
//         Region,
//         Country,
//         HospitalOwner,
//         OwnerName,
//         OwnerAdd1,
//         OwnerAdd2,
//         OwnerAdd3,
//         OwnerCity,
//         OwnerProvince,
//         OwnerRegion,
//         OwnerCountry,
//         OwnerEmail,
//         HospitalIDNo,
//         TaxNumber,
//         ServiceNo,
//         RegistrationNo,
//         VATNumber,
//         GSTNo,
//         TINNo,
//         AccBooksBeginFrom,
//         OtherRegNo,
//         HospitalGroupIDR,
//         CreatedDate,
//         Reserve1,
//         Reserve2,
//         Reserve3,
//         Reserve4,
//         Reserve5,
//         Reserve6,
//         HospitalDatabase,
//         Username,
//         Password,
//         MFAEnabled,
//         HospitalLogo: savedImagePath
//       });

//       // Log the creation of the new hospital
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const apiName = req.originalUrl;
//       const method = req.method;
//       const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip;

//       logger.logWithMeta("info", `Created new hospital with ID ${newHospital.id} in ${executionTime}`, {
//         executionTime,
//         statusCode: 200,
//         userAgent: req.headers['user-agent'],
//         apiName,
//         method,
//         ip: clientIp
//       });

//       // Generate database name and create the database
//       const databaseName = HospitalDatabase.replace(/\s+/g, "_").toLowerCase();
//       logger.info(`Generated database name: ${databaseName}`);

//       await sequelize.query(`CREATE DATABASE \`${databaseName}\`;`);
//       logger.info(`Database ${databaseName} created successfully`);



//       // Respond with the created hospital data
//       res.status(200).json({
//         meta: {
//           statusCode: 200,
//           executionTime: executionTime
//         },
//         data: newHospital,
//         HospitalLogo: imgBase64
//       });

//     } catch (error) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 978;
//       const statusCode = 500;

//       // Log the error
//       logger.logWithMeta("warn", "Error creating hospital", {
//         errorCode,
//         statusCode,
//         error: error.message,
//         executionTime,
//         hospitalId: req.hospitalId,
//         apiName: req.originalUrl,
//         method: req.method
//       });

//       res.status(statusCode).json({
//         meta: {
//           statusCode: statusCode,
//           errorCode: 978,
//           executionTime: executionTime
//         },
//         error: {
//           message: `Error creating hospital: ${error.message}`
//         }
//       });
//     }
//   }
// ];

// exports.createHospital = [ 
//   upload.single('HospitalLogo'), // Middleware for handling file upload
//   async (req, res) => {
//     const start = Date.now();
//     const errors = validationResult(req); // Check for validation errors
    
//     if (!errors.isEmpty()) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 976;
//       const statusCode = 400;
//       logger.logWithMeta("warn", "Validation errors occurred", {
//         errors: errors.array(),
//         errorCode,
//         statusCode,
//         executionTime,
//         hospitalId: req.hospitalId,
//       });
//       return res.status(statusCode).json({
//         meta: { statusCode: statusCode, errorCode: 976, executionTime: executionTime },
//         error: { message: 'Validation errors occurred', details: errors.array().map(err => ({ field: err.param, message: err.msg })) }
//       });
//     }

//     // Destructure all the necessary fields from the request body
//     const { 
//       HospitalName, HospitalCode, ManagingCompany, ManagingCompanyAdd1, 
//       ManagingCompanyAdd2, ManagingCompanyAdd3, ManagingCompanyEmail, 
//       ManagingCompanyWebsite, City, Province, Region, Country, HospitalOwner, 
//       OwnerName, OwnerAdd1, OwnerAdd2, OwnerAdd3, OwnerCity, OwnerProvince, 
//       OwnerRegion, OwnerCountry, OwnerEmail, HospitalIDNo, TaxNumber, ServiceNo, 
//       RegistrationNo, VATNumber, GSTNo, TINNo, AccBooksBeginFrom, OtherRegNo, 
//       HospitalGroupIDR, CreatedDate, Reserve1, Reserve2, Reserve3, Reserve4, 
//       Reserve5, Reserve6, HospitalDatabase, Username, Password, MFAEnabled, 
//       HospitalLogo 
//     } = req.body;

//     try {
//       // Check for existing hospital based on ManagingCompanyEmail
//       const existingHospital = await Hospital.findOne({
//         where: { [Op.or]: [{ ManagingCompanyEmail }] }
//       });
//       if (existingHospital) {
//         const end = Date.now();
//         const executionTime = `${end - start}ms`;
//         const errorCode = 977;
//         const statusCode = 400;
//         logger.logWithMeta("warn", "ManagingCompanyEmail already exists", {
//           errorCode, statusCode, executionTime, hospitalId: req.hospitalId,
//         });
//         return res.status(statusCode).json({
//           meta: { statusCode: statusCode, errorCode: 977, executionTime: executionTime },
//           error: { message: 'ManagingCompanyEmail already exists' }
//         });
//       }

//       // Generate a unique key for the hospital
//       const uniqueKey = uuidv4();
//       logger.info(`Generated unique key***************: ${uniqueKey}`);

//       const apiKeyFilePath = path.join(__dirname, 'config', 'apikey.json');

//       const storeApiKey = () => {
//         try {
//           // Ensure config directory exists
//           const configDir = path.dirname(apiKeyFilePath);
//           if (!fs.existsSync(configDir)) {
//             fs.mkdirSync(configDir, { recursive: true });
//           }
      
//           const apiKeyData = { [HospitalCode]: uniqueKey }; // New entry
//           fs.writeFileSync(apiKeyFilePath, JSON.stringify(apiKeyData, null, 2)); // Overwrite or create the file
//           logger.info(`Stored new entry in apiKey.json with HospitalCode":::::::::: ${HospitalCode} and UniqueKey: ${uniqueKey}`);
//         } catch (err) {
//           logger.error(`Error writing to apiKey.json: ${err.message}`);
//           throw err; // Re-throw to be caught in the outer try-catch block
//         }
//       };
      
//       storeApiKey();































//       // Handle image upload (file or base64)
//       let savedImagePath = null;
//       let imgBase64 = null;
//       if (HospitalLogo && HospitalLogo.startsWith('data:image')) {
//         // If HospitalLogo is a base64 string
//         savedImagePath = saveBase64Image(HospitalLogo, HospitalDatabase);
//       } else if (req.file) {
//         // If an image file is uploaded via multer
//         savedImagePath = req.file.path;
//       }
//       if (savedImagePath) {
//         const imgBuffer = fs.readFileSync(savedImagePath);
//         imgBase64 = `data:image/${path.extname(savedImagePath).slice(1)};base64,${imgBuffer.toString('base64')}`;
//       }

//       // Create new hospital record
//       const newHospital = await Hospital.create({
//         HospitalName, HospitalCode, ManagingCompany, ManagingCompanyAdd1, ManagingCompanyAdd2, ManagingCompanyAdd3, 
//         ManagingCompanyEmail, ManagingCompanyWebsite, City, Province, Region, Country, HospitalOwner, OwnerName,
//         OwnerAdd1, OwnerAdd2, OwnerAdd3, OwnerCity, OwnerProvince, OwnerRegion, OwnerCountry, OwnerEmail,
//         HospitalIDNo, TaxNumber, ServiceNo, RegistrationNo, VATNumber, GSTNo, TINNo, AccBooksBeginFrom, OtherRegNo,
//         HospitalGroupIDR, CreatedDate, Reserve1, Reserve2, Reserve3, Reserve4, Reserve5, Reserve6, HospitalDatabase,
//         Username, Password, MFAEnabled, HospitalLogo: savedImagePath, UniqueKey: uniqueKey // Save the unique key
//       });

//       // Log the creation of the new hospital
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const apiName = req.originalUrl;
//       const method = req.method;
//       const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip;
//       logger.logWithMeta("info", `Created new hospital with ID ${newHospital.id} in ${executionTime}`, {
//         executionTime, statusCode: 200, userAgent: req.headers['user-agent'], apiName, method, ip: clientIp
//       });

//       // Generate database name and create the database
//       const databaseName = HospitalDatabase.replace(/\s+/g, "_").toLowerCase();
//       logger.info(`Generated database name: ${databaseName}`);
//       await sequelize.query(`CREATE DATABASE \`${databaseName}\`;`);
//       logger.info(`Database ${databaseName} created successfully`);

//       // Respond with the created hospital data
//       res.status(200).json({
//         meta: { statusCode: 200, executionTime: executionTime },
//         data: newHospital,
//         HospitalLogo: imgBase64
//       });

//     } catch (error) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 978;
//       const statusCode = 500;

//       // Log the error
//       logger.logWithMeta("warn", "Error creating hospital", {
//         errorCode, statusCode, error: error.message, executionTime, hospitalId: req.hospitalId, apiName: req.originalUrl, method: req.method
//       });

//       res.status(statusCode).json({
//         meta: { statusCode: statusCode, errorCode: 978, executionTime: executionTime },
//         error: { message: `Error creating hospital: ${error.message}` }
//       });
//     }
//   }
// ];


exports.createHospital = [
  upload.single('HospitalLogo'),
  async (req, res) => {
    const start = Date.now();
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 976;
      const statusCode = 400;
      logger.logWithMeta("warn", "Validation errors occurred", {
        errors: errors.array(),
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
      });
      return res.status(statusCode).json({
        meta: { statusCode, errorCode, executionTime },
        error: {
          message: 'Validation errors occurred',
          details: errors.array().map((err) => ({ field: err.param, message: err.msg })),
        },
      });
    }

    const {
      HospitalName,
      HospitalCode,
      ManagingCompanyEmail,
      HospitalDatabase,
      HospitalLogo,
      ...otherFields
    } = req.body;

    try {
      const existingHospital = await Hospital.findOne({
        where: { [Op.or]: [{ ManagingCompanyEmail }] },
      });

      if (existingHospital) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 977;
        const statusCode = 400;
        logger.logWithMeta("warn", "ManagingCompanyEmail already exists", {
          errorCode,
          statusCode,
          executionTime,
          hospitalId: req.hospitalId,
        });
        return res.status(statusCode).json({
          meta: { statusCode, errorCode, executionTime },
          error: { message: 'ManagingCompanyEmail already exists' },
        });
      }

      const uniqueKey = uuidv4();
      logger.info(`Generated unique key: ${uniqueKey}`);

    // Function to store the unique key in the existing apikey.json file inside the config folder
    const storeApiKey = () => {
      try {
        const configDir = path.join(__dirname, '../../Hospital_gateway-main/Hospital_gateway/config');
        const apiKeyFilePath = path.join(configDir, 'apikey.json');

        let apiKeyData = {};

        if (fs.existsSync(apiKeyFilePath)) {
          const existingData = fs.readFileSync(apiKeyFilePath, 'utf8');
          apiKeyData = JSON.parse(existingData);
        }

        apiKeyData[HospitalCode] =   uniqueKey ;

        fs.writeFileSync(apiKeyFilePath, JSON.stringify(apiKeyData, null, 2));
        logger.info(`Stored unique key in file: ${apiKeyFilePath}`);
      } catch (err) {
        logger.error(`Error writing to file for unique key: ${err.message}`);
        throw err;
      }
    };

    storeApiKey();

      let savedImagePath = null;
      let imgBase64 = null;

      if (HospitalLogo && HospitalLogo.startsWith('data:image')) {
        savedImagePath = saveBase64Image(HospitalLogo, HospitalDatabase);
      } else if (req.file) {
        savedImagePath = req.file.path;
      }

      if (savedImagePath) {
        const imgBuffer = fs.readFileSync(savedImagePath);
        imgBase64 = `data:image/${path.extname(savedImagePath).slice(1)};base64,${imgBuffer.toString('base64')}`;
      }
 


      const newHospital = await Hospital.create({
        HospitalName,
        HospitalCode,
        ManagingCompanyEmail,
        HospitalDatabase,
        HospitalLogo: savedImagePath,
        UniqueKey: uniqueKey,
        ...otherFields,
      });

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const databaseName = HospitalDatabase.replace(/\s+/g, "_").toLowerCase();

      logger.info(`Generated database name: ${databaseName}`);
      await sequelize.query(`CREATE DATABASE \`${databaseName}\`;`);
      logger.info(`Database ${databaseName} created successfully`);

      console.log("uniqueKey",uniqueKey)


      res.status(200).json({
        meta: { statusCode: 200, executionTime },
        data: newHospital,
        HospitalLogo: imgBase64,
      });

    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 978;
      const statusCode = 500;

      logger.logWithMeta("warn", "Error creating hospital", {
        errorCode,
        statusCode,
        error: error.message,
        executionTime,
        hospitalId: req.hospitalId,
      });

      res.status(statusCode).json({
        meta: { statusCode, errorCode, executionTime },
        error: { message: `Error creating hospital: ${error.message}` },
      });
    }
  },
];





exports.getAllHospitals = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  
  try {
    const hospitals = await Hospital.findAll();
    let imgBase64 = null;
    // Read the hospital logo and convert it to base64 if it exists
    const hospitalsWithLogo = await Promise.all(
      hospitals.map(async (hospital) => {
        // if (hospital.HospitalLogo) {
        //   console.log("hospital.HospitalLogo",hospital.HospitalLogo)
        //   try {
          
        //     const logoPath = path.resolve(__dirname, `../../uploads/${hospital.HospitalLogo}`);
        //     const imgBuffer = fs.readFileSync(logoPath);
        //     const imgBase64 = `data:image/${path.extname(logoPath).slice(1)};base64,${imgBuffer.toString('base64')}`;
        //     hospital.HospitalLogo = imgBase64;
            

        //   } catch (error) {
        //     hospital.HospitalLogo = null; // If there's an error reading the logo, set it to null
        //   }
        // }
           
              if (hospital.HospitalLogo) {
                  const imgPath = path.join(__dirname, '../profileImg', path.basename(hospital.HospitalLogo));
                  if (fs.existsSync(imgPath)) {
                      const imgBuffer = fs.readFileSync(imgPath);
                     
                      imgBase64 = `data:image/${path.extname(imgPath).slice(1)};base64,${imgBuffer.toString('base64')}`;
                      hospital.HospitalLogo = imgBase64;
                  }

              }
              
        return hospital;
      })
    );
    // console.log("imgBase640000000000",imgBase64)
    
    
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    
    // Log the request details
    logger.logWithMeta("warn", `Retrieved all hospitals successfully`, {
      executionTime,
      statusCode: 200,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.json({
      meta: {
        statusCode: 200,
        executionTime: executionTime,
      },
      data: hospitalsWithLogo,
       
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 904;

    // Log the error
    logger.logWithMeta("warn", `Error retrieving hospitals: ${error.message}`, {
      errorCode,
      statusCode: 500,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 904,
        executionTime: executionTime,
      },
      error: {
        message: "Error retrieving hospitals: " + error.message,
      },
    });
  }
};



























































































// exports.getAllHospitals = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   try {
//     const hospitals = await Hospital.findAll();
//     // logger.info('Retrieved all hospitals successfully');
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     // Log the warning
//     logger.logWithMeta("warn", `Retrieved all hospitals successfully`, {
//       executionTime,
//       statusCode: 200,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers["user-agent"], // HTTP method
//     });

//     res.json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`,
//       },
//       data: hospitals,
//     });
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 904;

//     // Log the warning
//     logger.logWithMeta("warn", `Error retrieving hospitals ${error.message}`, {
//       errorCode,
//       statusCode: 500,
//       errorMessage: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers["user-agent"], // HTTP method
//     });
//     // logger.error('Error retrieving hospitals', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 904,
//         executionTime: `${end - start}ms`,
//       },
//       error: {
//         message: "Error retrieving hospitals: " + error.message,
//       },
//     });
//   }
// };

// Get hospital by ID



exports.getHospitalById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const id = req.params.id;

  try {
    // Retrieve hospital by ID
    const hospital = await Hospital.findByPk(id);

    if (!hospital) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 905;

      logger.logWithMeta("warn", `Hospital with ID ${id} not found`, {
        errorCode,
        statusCode: 404,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode,
          executionTime,
        },
        error: {
          message: "Hospital not found",
        },
      });
    }

    // Handle logo file and convert to Base64 if exists
    // let logoBase64 = null;
    // if (hospital.HospitalLogo) {
    //   const logoPath = path.join(__dirname, "../profile", hospital.HospitalLogo); // Adjust the path
    //   console.log("logoPath.....",logoPath)
    //   if (fs.existsSync(logoPath)) {
    //     const logoBuffer = fs.readFileSync(logoPath);
    //     logoBase64 = `data:image/${path.extname(logoPath).slice(1)};base64,${logoBuffer.toString("base64")}`;
    //   }
    // }


    let imgBase64 = null;
    if (hospital.HospitalLogo) {
        const imgPath = path.join(__dirname, '../profileImg', path.basename(hospital.HospitalLogo));
        console.log("Checking file path:", imgPath);
    
        if (fs.existsSync(imgPath)) {
            try {
                const imgBuffer = fs.readFileSync(imgPath);
                const ext = path.extname(imgPath).slice(1) || 'png'; // Default to png if empty
                imgBase64 = `data:image/${ext};base64,${imgBuffer.toString('base64')}`;
            } catch (error) {
                console.error("Error reading file:", error);
            }
        } else {
            console.warn("File not found:", imgPath);
        }
    }
    console.log("Final imgBase64:", imgBase64);







    const end = Date.now();
    const executionTime = `${end - start}ms`;

    logger.logWithMeta("info", `Retrieved hospital with ID ${id} successfully`, {
      executionTime,
      statusCode: 200,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: hospital,
      hospitalLogo: imgBase64,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 906;

    logger.logWithMeta("error", `Error retrieving hospital: ${error.message}`, {
      errorCode,
      statusCode: 500,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
      },
      error: {
        message: `Error retrieving hospital: ${error.message}`,
      },
    });
  }
};


// Update hospital
exports.updateHospital = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 907;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Validation errors occurred while updating hospital $`,
      {
        errorCode,
        statusCode: 400,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.warn('Validation errors occurred while updating hospital', errors);
    // const end = Date.now();
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 907,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: errors
          .array()
          .map((err) => err.msg)
          .join(", "),
      },
    });
  }

  const id = req.params.id;
  try {
    const [updatedRows] = await Hospital.update(req.body, {
      where: { HospitalID: id },
    });
    if (updatedRows === 0) {
      //       const end = Date.now();
      // logger.warn(`Hospital with ID ${id} not found for update, executionTime: ${end - start}ms`);

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 908;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital with ID ${id} not found for update `,
        {
          errorCode,
          statusCode: 404,
        
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 908,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital not found",
        },
      });
    } else {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital with ID ${id} updated successfully`,
        {
          executionTime,
          statusCode: 200,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );

      // logger.info(`Hospital with ID ${id} updated successfully, executionTime: ${end - start}ms`);

      res.json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`,
        },
        message: "Hospital updated successfully",
      });
    }
  } catch (error) {
    // const end = Date.now();
    // logger.error(`Error updating hospital, executionTime: ${end - start}ms`, { error: error.message });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 909;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Error updating hospital, executionTime`,
      {
        errorCode,
        statusCode: 500,
      
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 909,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error updating hospital: " + error.message,
      },
    });
  }
};

// Delete hospital
exports.deleteHospital = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const id = req.params.id;
  try {
    const deletedRows = await Hospital.destroy({
      where: { HospitalID: id },
    });
    if (deletedRows === 0) {
      // const end = Date.now();
      // logger.warn(`Hospital with ID ${id} not found for deletion, executionTime: ${end - start}ms`);

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 910;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital with ID ${id} not found for deletion ${error.message}`,
        {
          errorCode,
          statusCode: 404,
          errorMessage: error.message,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 910,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital not found",
        },
      });
    } else {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital with ID ${id} deleted successfully,`,
        {
          executionTime,
          statusCode: 200,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      // logger.info(`Hospital with ID ${id} deleted successfully, executionTime: ${end - start}ms`);

      res.json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`,
        },
        message: "Hospital deleted successfully",
      });
    }
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 911;

    // Log the warning
    logger.logWithMeta("warn", `Error deleting hospital ${error.message}`, {
      errorCode,
      statusCode: 500,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // const end = Date.now();
    // logger.error('Error deleting hospital', { error: error.message, executionTime: `${end - start}ms` });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 911,
      },
      error: {
        message: "Error deleting hospital: " + error.message,
      },
    });
  }
};

// Get hospitals by HospitalGroupID
exports.getHospitalsByHospitalGroupID = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { HospitalGroupIDR } = req.params;
  try {
    const hospitals = await Hospital.findAll({
      where: { HospitalGroupIDR },
    });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Retrieved hospitals by HospitalGroupIDR: ${HospitalGroupIDR} successfully,`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.info(`Retrieved hospitals by HospitalGroupIDR: ${HospitalGroupIDR} successfully, executionTime: ${end - start}ms`);

    res.json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: hospitals,
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error('Error retrieving hospitals by HospitalGroupIDR', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 912;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Error retrieving hospitals by HospitalGroupIDR ${error.message}`,
      {
        errorCode,
        statusCode: 500,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 912,
        executionTime: `${end - start}ms`,
      },
      error: {
        message:
          "Error retrieving hospitals by HospitalGroupIDR: " + error.message,
      },
    });
  }
};

exports.getAllHospitalsByPagination = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5; // Default limit is 5, adjust as per your requirement

  const offset = (page - 1) * limit;

  try {
    const totalCount = await Hospital.count();
    const hospitals = await Hospital.findAll({
      offset,
      limit,
      // order: [[ 'ASC']] // Example ordering by createdAt, adjust as per your requirement
    });

    // logger.info(`Retrieved hospitals for page ${page} with limit ${limit} successfully, executionTime: ${end - start}ms`);
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Retrieved hospitals for page ${page} with limit ${limit} successfully`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    res.status(200).json({
      meta: {
        statusCode: 200,
        totalCount,
        page,
        limit,
        executionTime: `${end - start}ms`,
      },
      data: hospitals,
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error(`Error retrieving hospitals with pagination, executionTime: ${end - start}ms`, { error: error.message });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 913;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Error retrieving hospitals with pagination ${error.message}`,
      {
        errorCode,
        statusCode: 500,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 913,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error retrieving hospitals with pagination: " + error.message,
      },
    });
  }
};

// Login
// exports.login = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     logger.warn('Validation errors occurred during login', errors);
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 923
//       },
//       error: {
//         message: 'Validation errors occurred',
//         details: errors.array().map(err => ({
//           field: err.param,
//           message: err.msg
//         }))
//       }
//     });
//   }

//   const { Username, Password } = req.body;

//   try {
//     // Check if the hospital exists
//     const hospital = await Hospital.findOne({ where: { Username } });
//     if (!hospital) {
//       logger.warn(`Hospital with Username ${Username} not found`);
//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 924
//         },
//         error: {
//           message: 'Hospital not found'
//         }
//       });
//     }

//     // Compare the password
//     const passwordMatch = await bcrypt.compare(Password, hospital.Password);
//     if (!passwordMatch) {
//       logger.warn(`Incorrect password for hospital with Username ${Username}`);
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 925
//         },
//         error: {
//           message: 'Incorrect password'
//         }
//       });
//     }

//     // Generate JWT token
//     const Hospitaltoken = jwt.sign(
//       { hospitalId: hospital.HospitalID ,
//         hospitalDatabase: hospital.HospitalDatabase,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     // Decode the token to retrieve the hospitalId
//     const decodedToken = jwt.verify(Hospitaltoken, process.env.JWT_SECRET);

//     logger.info(`Hospital with ID ${decodedToken.hospitalId} logged in successfully`);
//     res.status(200).json({
//       meta: {
//         statusCode: 200
//       },
//       data: {
//         Hospitaltoken,
//         hospital: {
//           id: decodedToken.hospitalId,
//           username: hospital.Username,
//           email: hospital.Email,
//           hospitalDatabase:hospital.HospitalDatabase
//         }
//       }
//     });
//   } catch (error) {
//     logger.error('Error logging in', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 926
//       },
//       error: {
//         message: 'Error logging in: ' + error.message
//       }
//     });
//   }
//   };

const { Sequelize } = require("sequelize");

// exports.login = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     logger.warn('Validation errors occurred during login', errors);
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 923
//       },
//       error: {
//         message: 'Validation errors occurred',
//         details: errors.array().map(err => ({
//           field: err.param,
//           message: err.msg
//         }))
//       }
//     });
//   }

//   const { Username, Password } = req.body;

//   const uniqueKey = req.headers['x-unique-key'];
//   console.log("uniquekey",uniqueKey)

//   try {
//     const hospital = await Hospital.findOne({ where: { Username } });
//     if (!hospital) {
//       logger.warn(`Hospital with Username ${Username} not found`);
//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 924
//         },
//         error: {
//           message: 'Hospital not found'
//         }
//       });
//     }
//     logger.info(`UniqueKey from request headers: ${uniqueKey}`);
//     logger.info(`UniqueKey from database: ${hospital.UniqueKey}`);
//     console.log(hospital.UniqueKey)

//     if (!verifyUniqueKey(uniqueKey, hospital.UniqueKey)) {
//       logger.warn(`Invalid UniqueKey for hospital with Username ${Username}`);
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 955
//         },
//         error: {
//           message: 'Unauthorized'
//         }
//       });
//     }

//     const passwordMatch = await bcrypt.compare(Password, hospital.Password);
//     if (!passwordMatch) {
//       logger.warn(`Incorrect password for hospital with Username ${Username}`);
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 925
//         },
//         error: {
//           message: 'Incorrect password'
//         }
//       });
//     }

//     const Hospitaltoken = jwt.sign(
//       { hospitalId: hospital.HospitalID, hospitalDatabase: hospital.HospitalDatabase },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     const decodedToken = jwt.verify(Hospitaltoken, process.env.JWT_SECRET);

//     logger.info(`Hospital with ID ${decodedToken.hospitalId} logged in successfully`);

//     res.status(200).json({
//       meta: {
//         statusCode: 200
//       },
//       data: {
//         Hospitaltoken,
//         hospital: {
//           id: decodedToken.hospitalId,
//           username: hospital.Username,
//           email: hospital.Email,
//           hospitalDatabase: hospital.HospitalDatabase
//         },
//         message: 'Login successful and token generated.'
//       }
//     });
//   } catch (error) {
//     logger.error('Error logging in', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 926
//       },
//       error: {
//         message: 'Error logging in: ' + error.message
//       }
//     });
//   }

// };const verifyUniqueKey = (providedKey, storedKey) => {
//   logger.info(`Provided UniqueKey: ${providedKey}`);
//   logger.info(`Stored UniqueKey: ${storedKey}`);
//   return providedKey === storedKey;
// };

const verifyUniqueKey = (providedKey, storedKey) => {
  logger.info(`Provided UniqueKey: ${providedKey}`);
  logger.info(`Stored UniqueKey: ${storedKey}`);
  return providedKey === storedKey;
};

// exports.HospitalCode = async (req, res) => {
//   const start = Date.now();
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     logger.warn(`Validation errors occurred during login, executionTime: ${end - start}ms`, errors);

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 1044,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Validation errors occurred',
//         details: errors.array().map(err => ({
//           field: err.param,
//           message: err.msg
//         }))
//       }
//     });
//   }

//   const { HospitalCode } = req.body;
//   const uniqueKey = req.headers['x-unique-key'];
//   console.log("uniquekey", uniqueKey);
//   // const encryptedKeyFromHeader = req.headers['x-unique-key'];
//   // const decryptionSecret = process.env.DECRYPTION_SECRET;

//   try {
//     const hospital = await Hospital.findOne({ where: { HospitalCode } });
//     if (!hospital) {
//       const end = Date.now();
//       logger.warn(`Hospital with HospitalCode ${HospitalCode} not found, executionTime: ${end - start}ms`);

//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 1045,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Hospital not found'
//         }
//       });
//     }

//     // const decryptedKey = decryptText(encryptedKeyFromHeader, decryptionSecret);
//     // console.log("Decrypted Key:", decryptedKey);
//     if (!verifyUniqueKey(uniqueKey, hospital.UniqueKey)) {
//       const end = Date.now();
//   // logger.warn(`Invalid UniqueKey for hospital with Username ${Username}, executionTime: ${end - start}ms`);
//   // if (decryptedKey !== hospital.UniqueKey) {
//   //   const end = Date.now();
//   //   logger.warn(`Invalid UniqueKey for HospitalCode ${HospitalCode}, executionTime: ${end - start}ms`);

//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 955,
//               executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Unauthorized'
//         }
//       });
//     }

//     // Check if the hospital already has a valid token in Redis
//     const existingToken = await getAsync(hospital.HospitalID.toString());
//     let Hospitaltoken = existingToken;

//     // If token is not present, generate a new one
//     if (!existingToken) {
//       Hospitaltoken = jwt.sign(
//         { hospitalId: hospital.HospitalID, hospitalDatabase: hospital.HospitalDatabase, hospitalGroupIDR: hospital.HospitalGroupIDR },
//         process.env.JWT_SECRET,
//         { expiresIn: '24h' }
//       );

//       // Store the new token in Redis with an expiration time
//       await setAsync(hospital.HospitalID.toString(), Hospitaltoken, 'EX', 24 * 60 * 60);
//     }

//     const end = Date.now();
//     logger.info(`Hospital with HospitalCode ${HospitalCode} found successfully, executionTime: ${end - start}ms`);

//     req.hospitalDatabase = hospital.HospitalDatabase;
//     const decodedToken = jwt.decode(Hospitaltoken);
//     const currentTime = Math.floor(Date.now() / 1000);
//     const expiresIn = decodedToken.exp - currentTime;
//     const expiresInMinutes = Math.floor(expiresIn / 60);
//     console.log(`Token expires in: ${expiresIn} seconds`);

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         Hospitaltoken,
//         expiresInMinutes: `${expiresInMinutes} min`,
//         hospital: {
//           hospitalId: hospital.HospitalID,
//           hospitalDatabase: hospital.HospitalDatabase,
//           hospitalGroupIDR: hospital.HospitalGroupIDR
//         },
//         message: 'Database name found successfully'
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error finding hospital', { error: error.message, executionTime: `${end - start}ms` });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 1046,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error finding hospital: ' + error.message
//       }
//     });
//   }
// };
const CryptoJS = require("crypto-js");

// Secret key should be in a suitable format and length
const ENCRYPT_SECRET_KEY = process.env.ENCRYPT_SECRET_KEY;
const ENCRYPT_SECRET_KEY2 = process.env.ENCRYPT_SECRET_KEY3;

// Function to decrypt the provided ciphertext
const decryptValue = (ciphertext) => {
  try {
    // Convert the secret key to a suitable format if needed
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPT_SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    // Check if the decrypted text is not empty
    if (!originalText) {
      throw new Error("Decryption failed or result is empty.");
    }

    return originalText;
  } catch (error) {
    console.error("Error during decryption:", error.message);
    return null;
  }
};

// Encrypted key and secret key provided
// const encryptedKey = 'U2FsdGVkX1+NOwStJXC+t32sBUOj6SVR0ChDJOXURFyNz9DHBh3sVY/D+rm8bgSlk9J+r76ziT+8xP8gjMRq1Q==';

// // Decrypt the encrypted key and log the result
// const decryptedKey = decryptValue(encryptedKey);
// console.log("Decrypted Key:", decryptedKey);

// // Example usage
// const encryptedKey = 'U2FsdGVkX1+NOwStJXC+t32sBUOj6SVR0ChDJOXURFyNz9DHBh3sVY/D+rm8bgSlk9J+r76ziT+8xP8gjMRq1Q==';
// const decryptedKey = decryptValue("U2FsdGVkX1+NOwStJXC+t32sBUOj6SVR0ChDJOXURFyNz9DHBh3sVY/D+rm8bgSlk9J+r76ziT+8xP8gjMRq1Q==");
// console.log("Decrypted Key:", decryptedKey);

// Example usage in your handler function
// exports.HospitalCode = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//         // const end = Date.now();
//         // logger.warn(`Validation errors occurred during login, executionTime: ${end - start}ms`, errors);
//         const end = Date.now();
//         const executionTime = `${end - start}ms`;
//         const errorCode = 914;
//         const statusCode = 400;
//         // Log the warning
//         logger.logWithMeta("warn", `Validation errors occurred during login ${error.message}`, {
//           errorCode,
//           statusCode,
//           errorMessage: error.message,
//           executionTime,
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers['user-agent'],     // HTTP method
//         });
//         return res.status(400).json({
//             meta: {
//                 statusCode: statusCode,
//                 errorCode: 914,
//                 executionTime: `${end - start}ms`
//             },
//             error: {
//                 message: 'Validation errors occurred',
//                 details: errors.array().map(err => ({
//                     field: err.param,
//                     message: err.msg
//                 }))
//             }
//         });
//     }

//     const { HospitalCode } = req.body;
//     const encryptedKeyFromHeader = req.headers['x-unique-key'];

//     // Validate inputs
//     if (!encryptedKeyFromHeader) {
//         // const end = Date.now();
//         // logger.error('Missing encrypted key in the request header', { executionTime: `${end - start}ms` });
//         const end = Date.now();
//         const executionTime = `${end - start}ms`;
//         const errorCode = 915;
//         const statusCode = 400;

//         // Log the warning
//         logger.logWithMeta("warn", `Missing encrypted key in the request header ${error.message}`, {
//           errorCode,
//           statusCode,
//           errorMessage: error.message,
//           executionTime,
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers['user-agent'],     // HTTP method
//         });
//         return res.status(400).json({
//             meta: {
//                 statusCode: 400,
//                 errorCode: 915,
//                 executionTime: `${end - start}ms`
//             },
//             error: {
//                 message: 'Missing encrypted key in the request header'
//             }
//         });
//     }

//     if (!ENCRYPT_SECRET_KEY) {
//         // const end = Date.now();
//         // logger.error('Decryption secret is not defined in environment variables', { executionTime: `${end - start}ms` });
//         const end = Date.now();
//         const executionTime = `${end - start}ms`;
//         const errorCode = 916;
//         const statusCode = 500;
//         // Log the warning
//         logger.logWithMeta("warn", `Decryption secret is not defined in environment variables ${error.message}`, {
//           errorCode,
//           statusCode,
//           errorMessage: error.message,
//           executionTime,
//           hospitalId: req.hospitalId,
//           HospitalName:req.hopsitalName,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers['user-agent'],     // HTTP method
//         });
//         return res.status(500).json({
//             meta: {
//                 statusCode: 500,
//                 errorCode: 916,
//                 executionTime: `${end - start}ms`
//             },
//             error: {
//                 message: 'Internal Server Error: Decryption secret is not defined'
//             }
//         });
//     }

//     try {
//         const hospital = await Hospital.findOne({ where: { HospitalCode } });
//         if (!hospital) {
//             // const end = Date.now();
//             // logger.warn(`Hospital with HospitalCode ${HospitalCode} not found, executionTime: ${end - start}ms`);
//             const end = Date.now();
//             const executionTime = `${end - start}ms`;
//             const errorCode = 917;
//             const statusCode = 404;

//             // Log the warning
//             logger.logWithMeta("warn", `Hospital with HospitalCode ${HospitalCode} not found`, {
//               errorCode,
//               statusCode,
//               executionTime,
//               hospitalId: req.hospitalId,
//               ip: clientIp,
//               apiName: req.originalUrl, // API name
//               method: req.method,
//               userAgent: req.headers['user-agent'],     // HTTP method
//             });
//             return res.status(404).json({
//                 meta: {
//                     statusCode: 404,
//                     errorCode: 917,
//                     executionTime: `${end - start}ms`
//                 },
//                 error: {
//                     message: 'Hospital not found'
//                 }
//             });
//         }

//         // const encryptedKey = 'U2FsdGVkX1+NOwStJXC+t32sBUOj6SVR0ChDJOXURFyNz9DHBh3sVY/D+rm8bgSlk9J+r76ziT+8xP8gjMRq1Q==';
// const decryptedKey = decryptValue(encryptedKeyFromHeader);
// console.log("Decrypted Key:", decryptedKey);

//         // const decryptedKey = decryptValue(encryptedKeyFromHeader);

//         console.log("Decrypted Key:", decryptedKey);

//         if (decryptedKey !== hospital.UniqueKey) {
//             // const end = Date.now();
//             // logger.warn(`Invalid UniqueKey for HospitalCode ${HospitalCode}, executionTime: ${end - start}ms`);
//             const end = Date.now();
//             const executionTime = `${end - start}ms`;
//             const errorCode = 918;
//             const statusCode = 401;

//             // Log the warning
//             logger.logWithMeta("warn", `Invalid UniqueKey for HospitalCode ${HospitalCode}`, {
//               errorCode,
//               statusCode,
//               executionTime,
//               hospitalId: req.hospitalId,
//               ip: clientIp,
//               apiName: req.originalUrl, // API name
//               method: req.method,
//               userAgent: req.headers['user-agent'],     // HTTP method
//             });
//             return res.status(401).json({
//                 meta: {
//                     statusCode: 401,
//                     errorCode: 918,
//                     executionTime: `${end - start}ms`
//                 },
//                 error: {
//                     message: 'Unauthorized'
//                 }
//             });
//         }

//              console.log("Hospital Name:", hospital.HospitalName);

//       const existingToken = await getAsync(hospital.HospitalID.toString());

//       // const existingToken = await delAsync(hospital.HospitalID.toString());

//       let Hospitaltoken = existingToken;

//       if (!existingToken) {
//           Hospitaltoken = jwt.sign({
//               hospitalId: hospital.HospitalID,
//               hospitalDatabase: hospital.HospitalDatabase,
//               hospitalGroupIDR: hospital.HospitalGroupIDR,
//               // hospitalName: hospital.HospitalName,
//               hospitalName: hospital.HospitalName || "Default Hospital Name",

//               MFAEnabled: hospital?.MFAEnabled ,
//           }, process.env.JWT_SECRET, { expiresIn: '24h' });

//           await setAsync(hospital.HospitalID.toString(), Hospitaltoken, 'EX', 24 * 60 * 60);
//       }

//       const decodedToken = jwt.verify(Hospitaltoken, process.env.JWT_SECRET);

//       console.log(decodedToken);

//         // logger.info(`Hospital with HospitalCode ${HospitalCode} found successfully, executionTime: ${end - start}ms`);
//         const end = Date.now();
//         const executionTime = `${end - start}ms`;
//        // Log the warning
//         logger.logWithMeta("warn", `Hospital with HospitalCode ${HospitalCode} found successfully`, {
//           executionTime,
//           statusCode:200,
//           hospitalId: req.hospitalId,
//           hopsitalName: req.HospitalName,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers['user-agent'],    // HTTP method
//         });

//         // const decodedToken = jwt.decode(Hospitaltoken);

//         console.log("Generated JWT:",(decodedToken));

//         const currentTime = Math.floor(Date.now() / 1000);
//         const expiresIn = decodedToken.exp - currentTime;
//         const expiresInMinutes = Math.floor(expiresIn / 60);

//         res.status(200).json({
//             meta: {
//                 statusCode: 200,
//                 executionTime: `${end - start}ms`
//             },
//             data: {
//                 Hospitaltoken,
//                 expiresInMinutes: `${expiresInMinutes} min`,
//                 MFAEnabled: hospital.MFAEnabled,
//                 hospital: {
//                     hospitalId: hospital.HospitalID,
//                     hospitalDatabase: hospital.HospitalDatabase,
//                     hospitalGroupIDR: hospital.HospitalGroupIDR,
//                     hospitalName: hospital.HospitalName,
//                 },
//                 message: 'Database name found successfully'
//             }
//         });
//     } catch (error) {
//         // const end = Date.now();
//         // logger.error('Error finding hospital', { error: error.message, executionTime: `${end - start}ms` });
//         const end = Date.now();
//         const executionTime = `${end - start}ms`;
//         const errorCode = 919;
//         const statusCode = 500;
//         // Log the warning
//         logger.logWithMeta("warn", `Error finding hospital`, {
//           errorCode,
//           statusCode,
//           executionTime,
//           hospitalId: req.hospitalId,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers['user-agent'],     // HTTP method
//         });
//         res.status(500).json({
//             meta: {
//                 statusCode: statusCode,
//                 errorCode: 919,
//                 executionTime: `${end - start}ms`
//             },
//             error: {
//                 message: 'Error finding hospital: ' + error.message
//             }
//         });
//     }
// };

// const { promisify } = require('util');

// const delAsync = promisify(client.del).bind(client);
exports.HospitalCode = async (req, res) => {
  const start = Date.now();
  const logId = uuidv4();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);
  //
  if (!errors.isEmpty()) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 914;
    const statusCode = 400;
    //
    // Log validation error
    logger.logWithMeta("warn", `Validation errors during login`, {
      errorCode,
      logId,
      statusCode,
      errorMessage: errors
        .array()
        .map((err) => err.msg)
        .join(", "),
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    //
    return res.status(400).json({
      meta: { statusCode, errorCode, executionTime },
      error: {
        message: "Validation errors occurred",
        details: errors
          .array()
          .map((err) => ({ field: err.param, message: err.msg })),
      },
    });
  }
  //
  const { HospitalCode } = req.body;
  const encryptedKeyFromHeader = req.headers["x-unique-key"];
  //
  if (!encryptedKeyFromHeader) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 915;
    //
    // Log missing encrypted key error
    logger.logWithMeta("warn", `Missing encrypted key in header`, {
      errorCode,
      logId,
      statusCode: 400,
      errorMessage: "Missing encrypted key",
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    //
    return res.status(400).json({
      meta: { statusCode: 400, errorCode, executionTime },
      error: { message: "Missing encrypted key in the request header" },
    });
  }
  //
  if (!ENCRYPT_SECRET_KEY) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 916;
    //
    // Log missing decryption secret error
    logger.logWithMeta("warn", `Decryption secret is not defined`, {
      errorCode,
      logId,
      statusCode: 500,
      errorMessage: "Decryption secret is missing",
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    //
    return res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: {
        message: "Internal Server Error: Decryption secret is not defined",
      },
    });
  }
  //
  try {
    const hospital = await Hospital.findOne({ where: { HospitalCode } });
    if (!hospital) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 917;
      //
      // Log hospital not found error
      logger.logWithMeta(
        "warn",
        `Hospital with HospitalCode ${HospitalCode} not found`,
        {
          errorCode,
          logId,
          statusCode: 404,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
        }
      );
      //
      return res.status(404).json({
        meta: { statusCode: 404, errorCode, executionTime },
        error: { message: "Hospital not found" },
      });
    }
    //
    const decryptedKey = decryptValue(encryptedKeyFromHeader);
    if (decryptedKey !== hospital.UniqueKey) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 918;
      //
      // Log invalid UniqueKey error
      logger.logWithMeta(
        "warn",
        `Invalid UniqueKey for HospitalCode ${HospitalCode}`,
        {
          errorCode,
          logId,
          statusCode: 401,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
        }
      );
      //
      return res.status(401).json({
        meta: { statusCode: 401, errorCode, executionTime },
        error: { message: "Unauthorized" },
      });
    }
    //
    console.log("Hospital Name:", hospital.HospitalName);
    //
    const existingToken = await getAsync(hospital.HospitalID.toString());
    //
    // const existingToken = await delAsync(hospital.HospitalID.toString());
    //
    let Hospitaltoken = existingToken;
    //
    if (!existingToken) {
      Hospitaltoken = jwt.sign(
        {
          hospitalId: hospital.HospitalID,
          hospitalDatabase: hospital.HospitalDatabase,
          hospitalGroupIDR: hospital.HospitalGroupIDR,
          // hospitalName: hospital.HospitalName,
          hospitalName: hospital.HospitalName || "Default Hospital Name",
          //
          MFAEnabled: hospital?.MFAEnabled,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      //
      await setAsync(
        hospital.HospitalID.toString(),
        Hospitaltoken,
        "EX",
        24 * 60 * 60
      );
    }
    //
    const decodedToken = jwt.verify(Hospitaltoken, process.env.JWT_SECRET);
    //
    console.log(decodedToken);
    //
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decodedToken.exp - currentTime;
    const expiresInMinutes = Math.floor(expiresIn / 60);
    //
    //
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    // logger.logWithMeta(
    //   "warn",
    //   `Hospital with HospitalCode ${HospitalCode} found successfully`,
    //   {
    //     message: `Execution Time: ${executionTime} ms, Log ID: ${logId}, statusCode: 200, Hospital ID: ${req.hospitalId}, Hospital Name: ${hospital.HospitalName || "Unknown Hospital"}, IP Address: ${clientIp}, API Name: ${req.originalUrl}, Method: ${req.method}, User Agent: ${req.headers["user-agent"]}`
    //   }
    // );
    
    logger.logWithMeta(
      "warn",
      `Hospital with HospitalCode ${HospitalCode} found successfully`,
      {
        executionTime,
        logId,
        statusCode: 200,
        hospitalId: req.hospitalId,
        hospitalName: hospital.HospitalName || "Unknown Hospital", 
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    //
    //
    //
    //
    res.status(200).json({
      meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
      data: {
        Hospitaltoken,
        expiresInMinutes: `${expiresInMinutes} min`,
        MFAEnabled: hospital.MFAEnabled,
        hospital: {
          hospitalId: hospital.HospitalID,
          hospitalDatabase: hospital.HospitalDatabase,
          hospitalGroupIDR: hospital.HospitalGroupIDR,
          hospitalName: hospital.HospitalName,
        },
        message: "Database name found successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 919;
    // Log error finding hospital
    logger.logWithMeta("warn", `Error finding hospital`, {
      errorCode,
      logId,
      statusCode: 500,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: `Error finding hospital: ${error.message}` },
    });
  }
};

// exports.login = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // const end = Date.now();
//     // logger.warn(`Validation errors occurred during login, executionTime: ${end - start}ms`, errors);
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 920;
//     const statusCode = 400;
//     // Log the warning
//     logger.logWithMeta("warn", `Validation errors occurred during login`, {
//       errorCode,
//       statusCode,
//       executionTime,
//       hospitalId: req.hospitalId,
//       hospitalName: req.hospitalName,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers["user-agent"], // HTTP method
//     });
//     return res.status(400).json({
//       meta: {
//         statusCode: statusCode,
//         errorCode: 920,
//         executionTime: `${end - start}ms`,
//       },
//       error: {
//         message: "Validation errors occurred",
//         details: errors.array().map((err) => ({
//           field: err.param,
//           message: err.msg,
//         })),
//       },
//     });
//   }

//   const { Username, Password } = req.body;

//   const Hospitaltoken = req.headers["authorization"];
//   console.log("SessionToken", Hospitaltoken);

//   try {
//     const hospital = await Hospital.findOne({ where: { Username } });
//     if (!hospital) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 921;
//       const statusCode = 404;

//       // Log the warning
//       logger.logWithMeta(
//         "warn",
//         `Hospital with Username "${Username}" not found`,
//         {
//           errorCode,
//           statusCode,
//           executionTime,
//           hospitalId: req.hospitalId,
//           hospitalName: req.hospitalName,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers["user-agent"], // HTTP method
//         }
//       );

//       // logger.warn(`Hospital with Username "${Username}" not found, executionTime: ${end - start}ms`, {
//       //   errorCode: 924,   // Adding the errorCode directly in the log
//       //   hospitalId: req.hospitalId || 'N/A'  // Including hospitalId if available, else 'N/A'
//       // });

//       return res.status(404).json({
//         meta: {
//           statusCode: statusCode,
//           errorCode: 921,
//           executionTime: `${end - start}ms`,
//         },
//         error: {
//           message: "Hospital not found",
//         },
//       });
//     }

//     // if (hospital.isEmailVerified !== 1) {
//     //   logger.warn(`Email not verified for hospital with Username ${Username}`);
//     //   return res.status(401).json({
//     //     meta: {
//     //       statusCode: 401,
//     //       errorCode: 927
//     //     },
//     //     error: {
//     //       message: 'Please verify your email before logging in'
//     //     }
//     //   });
//     // }

//     // logger.info(`UniqueKey from request headers: ${uniqueKey}`);
//     // logger.info(`UniqueKey from database: ${hospital.UniqueKey}`);
//     // console.log(hospital.UniqueKey);

//     // Highlighted changes: Replaced direct comparison with verifyUniqueKey function
//     //     if (!verifyUniqueKey(uniqueKey, hospital.UniqueKey)) {
//     //       const end = Date.now();
//     // logger.warn(`Invalid UniqueKey for hospital with Username ${Username}, executionTime: ${end - start}ms`);

//     //       return res.status(401).json({
//     //         meta: {
//     //           statusCode: 401,
//     //           errorCode: 955,
//     //               executionTime: `${end - start}ms`
//     //         },
//     //         error: {
//     //           message: 'Unauthorized'
//     //         }
//     //       });
//     //     }

//     const passwordMatch = await bcrypt.compare(Password, hospital.Password);
//     // const passwordMatch = await bcrypt.compare(Password, hospital.Password);

// console.log('Password from request:', Password);
// console.log('Password from database:', hospital.Password);


//     if (!passwordMatch) {
//       //       const end = Date.now();
//       // logger.warn(`Incorrect password for hospital with Username ${Username}, executionTime: ${end - start}ms`);
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 922;
//       const statusCode = 401;

//       // Log the warning
//       logger.logWithMeta(
//         "warn",
//         `Incorrect password for hospital with Username ${Username}`,
//         {
//           errorCode,
//           statusCode,
//           executionTime,
//           hospitalId: req.hospitalId,
//           hospitalName: req.hospitalName,
//           ip: clientIp,
//           apiName: req.originalUrl, // API name
//           method: req.method,
//           userAgent: req.headers["user-agent"], // HTTP method
//         }
//       );

//       return res.status(401).json({
//         meta: {
//           statusCode: statusCode,
//           errorCode: 922,
//           executionTime: `${end - start}ms`,
//         },
//         error: {
//           message: "Incorrect password",
//         },
//       });
//     }

//     // const Hospitaltoken = jwt.sign(
//     //   { hospitalId: hospital.HospitalID,
//     //      hospitalDatabase: hospital.HospitalDatabase,
//     //      hospitalGroupIDR:hospital.HospitalGroupIDR,
//     //      hospitalName: hospital.HospitalName },
//     //   process.env.JWT_SECRET,
//     //   { expiresIn: '24h' }
//     // );

//     const existingToken = await getAsync(hospital.HospitalID.toString());
//     let SessionToken = existingToken;

//     // If token is not present, generate a new one
//     if (!existingToken) {
//       SessionToken = jwt.sign(
//         {
//           hospitalId: hospital.HospitalID,
//           hospitalDatabase: hospital.HospitalDatabase,
//           hospitalGroupIDR: hospital.HospitalGroupIDR,
//           hospitalName: hospital.HospitalName,
//           ManagingCompanyAdd1: hospital.ManagingCompanyAdd1,
//           ManagingCompanyEmail: hospital.ManagingCompanyEmail,
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: "24h" }
//       );

//       // Store the new token in Redis with an expiration time
//       await setAsync(
//         hospital.HospitalID.toString(),
//         SessionToken,
//         "EX",
//         24 * 60 * 60
//       );
//     }

//     // const SessionToken = jwt.sign(
//     //   {
//     //     hospitalId: hospital.HospitalID,
//     //     hospitalDatabase: hospital.HospitalDatabase,
//     //     hospitalGroupIDR: hospital.HospitalGroupIDR,
//     //     hospitalName: hospital.HospitalName,
//     //     ManagingCompanyAdd1:hospital.ManagingCompanyAdd1,
//     //     ManagingCompanyEmail:hospital.ManagingCompanyEmail
//     //   },
//     //   process.env.JWT_SECRET,
//     //   { expiresIn: '24h' }
//     // );

//     const decodedToken = jwt.verify(SessionToken, process.env.JWT_SECRET);

//     const currentTime = Math.floor(Date.now() / 1000);
//     const expiresIn = decodedToken.exp - currentTime;
//     const expiresInMinutes = Math.floor(expiresIn / 60);
//     console.log(`Token expires in: ${expiresIn} seconds`);

//     console.log("Decoded Token:", decodedToken);
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     // Log the warning
//     logger.logWithMeta(
//       "warn",
//       `Hospital with ID ${decodedToken.hospitalId} logged in successfully`,
//       {
//         executionTime,
//         statusCode: 200,
//         hospitalId: req.hospitalId,
//         HospitalName: req.hopsitalName,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers["user-agent"], // HTTP method
//       }
//     );

//     // logger.info(`Hospital with ID ${decodedToken.hospitalId} logged in successfully, executionTime: ${end - start}ms`);

//     ////////////////Count apis

//     // const method = req.method;
//     // const city = req.body.city || 'Unknown';
//     // // Using the HTTP method from the request
//     // // try {
//     //   await CountAPI.create({
//     //     Apiname: 'login',
//     //     location: city,
//     //     createdby: decodedToken.hospitalId,
//     //     ApiMethod: method,
//     //     createdname: Username
//     //   });
//     // }
//     //  catch (err) {
//     //   logger.error('Error creating CountAPI entry', { error: err.message });
//     // }

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`,
//       },
//       data: {
//         SessionToken,
//         expiresInMinutes: `${expiresInMinutes} min`,

//         hospital: {
//           id: decodedToken.hospitalId,
//           username: hospital.Username,
//           email: hospital.Email,
//           hospitalDatabase: hospital.HospitalDatabase,
//           HospitalGroupIDR: hospital.HospitalGroupIDR,
//           HospitalName: decodedToken.HospitalName,
//           ManagingCompanyAdd1: hospital.ManagingCompanyAdd1,
//           ManagingCompanyEmail: hospital.ManagingCompanyEmail,
//         },
//         message: "Login successful and token generated.",
//       },
//     });
//   } catch (error) {
//     // const end = Date.now();
//     // logger.error('Error logging in', { error: error.message, executionTime: `${end - start}ms` });
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 923;
//     const statusCode = 500;

//     // Log the warning
//     logger.logWithMeta("warn", `Error logging in`, {
//       errorCode,
//       statusCode,
//       executionTime,
//       hospitalId: req.hospitalId,

//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers["user-agent"], // HTTP method
//     });
//     res.status(500).json({
//       meta: {
//         statusCode: statusCode,
//         errorCode: 923,
//         executionTime: `${end - start}ms`,
//       },
//       error: {
//         message: "Error logging in: " + error.message,
//       },
//     });
//   }
// };


exports.login = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);

  // Check validation errors
  if (!errors.isEmpty()) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 920;
    const statusCode = 400;
    logger.logWithMeta("warn", `Validation errors occurred during login`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      hospitalName: req.hospitalName,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    return res.status(400).json({
      meta: {
        statusCode: statusCode,
        errorCode: 920,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { Username, Password } = req.body;


  const Hospitaltoken = req.headers["authorization"];
  console.log("SessionToken", Hospitaltoken);

  try {

   
    // const secretKey = "mKJDnzbwLQxPriGj";  // Replace with actual key
    // const plainText = "Pass123";
    const secretKey = process.env.SYSTEM_SECRET_KEY;
    
    // Encrypt
    // const encrypted = CryptoJS.AES.encrypt(Password, secretKey).toString();
    // console.log('Encrypted:', encrypted);
    
    // Decrypt
    const decryptedBytes = CryptoJS.AES.decrypt(Password, secretKey);
    const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

    console.log('Decrypted:', decryptedPassword);


    const hospital = await Hospital.findOne({ where: { Username } });

    // Check if hospital is found
    if (!hospital) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 921;
      const statusCode = 404;
      logger.logWithMeta("warn", `Hospital with Username "${Username}" not found`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        hospitalName: req.hospitalName,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(404).json({
        meta: {
          statusCode: statusCode,
          errorCode: 921,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital not found",
        },
      });
    }

    // Log and compare passwords
    console.log('Password from request:', Password);
    console.log('Password from database:', hospital.Password); // Log the database password

    const passwordMatch = await bcrypt.compare(decryptedPassword, hospital.Password);

    // If password doesn't match
    if (!passwordMatch) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 922;
      const statusCode = 401;

      // Log the warning for incorrect password
      logger.logWithMeta("warn", `Incorrect password for hospital with Username ${Username}`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        hospitalName: req.hospitalName,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(401).json({
        meta: {
          statusCode: statusCode,
          errorCode: 922,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Incorrect password",
        },
      });
    }

    // Generate or retrieve session token
    const existingToken = await getAsync(hospital.HospitalID.toString());
    let SessionToken = existingToken;

    if (!existingToken) {
      SessionToken = jwt.sign(
        {
          hospitalId: hospital.HospitalID,
          hospitalDatabase: hospital.HospitalDatabase,
          hospitalGroupIDR: hospital.HospitalGroupIDR,
          hospitalName: hospital.HospitalName,
          ManagingCompanyAdd1: hospital.ManagingCompanyAdd1,
          ManagingCompanyEmail: hospital.ManagingCompanyEmail,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Store new token in Redis with expiration time
      await setAsync(hospital.HospitalID.toString(), SessionToken, "EX", 24 * 60 * 60);
    }

    const decodedToken = jwt.verify(SessionToken, process.env.JWT_SECRET);

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decodedToken.exp - currentTime;
    const expiresInMinutes = Math.floor(expiresIn / 60);

    console.log(`Token expires in: ${expiresIn} seconds`);
    console.log("Decoded Token:", decodedToken);

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log successful login
    logger.logWithMeta(
      "info",
      `Hospital with ID ${decodedToken.hospitalId} logged in successfully`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        hospitalName: req.hospitalName,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      }
    );

    // Respond with session token and expiration time
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        SessionToken,
        expiresInMinutes: `${expiresInMinutes} min`,
        hospital: {
          id: decodedToken.hospitalId,
          username: hospital.Username,
          email: hospital.Email,
          hospitalDatabase: hospital.HospitalDatabase,
          HospitalGroupIDR: hospital.HospitalGroupIDR,
          HospitalName: decodedToken.hospitalName,
          ManagingCompanyAdd1: hospital.ManagingCompanyAdd1,
          ManagingCompanyEmail: hospital.ManagingCompanyEmail,
        },
        message: "Login successful and token generated.",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 923;
    const statusCode = 500;

    // Log error
    logger.logWithMeta("warn", `Error logging in`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: {
        statusCode: statusCode,
        errorCode: 923,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error logging in: " + error.message,
      },
    });
  }
};











exports.requestPasswordReset = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // const end = Date.now();
    // logger.warn('Validation errors occurred during password reset request', { errors, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 924;
    const statusCode = 400;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Validation errors occurred during password reset request`,
      {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    return res.status(400).json({
      meta: {
        statusCode: statusCode,
        errorCode: 924,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const uniqueKey = req.headers["x-unique-key"];

  if (!uniqueKey) {
    // const end = Date.now();
    // logger.error('Missing unique key in request headers', { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 925;
    const statusCode = 400;
    // Log the warning
    logger.logWithMeta("warn", `Missing unique key in request headers`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    return res.status(400).json({
      meta: {
        statusCode: statusCode,
        errorCode: 925,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Missing unique key in request headers",
      },
    });
  }

  try {
    // Find hospital by uniqueKey
    const hospital = await Hospital.findOne({
      where: { UniqueKey: uniqueKey },
    });
    if (!hospital) {
      // const end = Date.now();
      // logger.warn(`Hospital with UniqueKey ${uniqueKey} not found`, { executionTime: `${end - start}ms` });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 926;
      const statusCode = 404;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital with UniqueKey ${uniqueKey} not found`,
        {
          errorCode,
          statusCode,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );

      return res.status(404).json({
        meta: {
          statusCode: statusCode,
          errorCode: 926,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital not found",
        },
      });
    }

    // Ensure managingCompanyEmail is available
    const managingCompanyEmail = hospital.ManagingCompanyEmail;
    if (!managingCompanyEmail) {
      //       const end = Date.now();
      // logger.error(`Hospital with UniqueKey ${uniqueKey} does not have a ManagingCompanyEmail`, { executionTime: `${end - start}ms` });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 927;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital with UniqueKey ${uniqueKey} does not have a ManagingCompanyEmail`,
        {
          errorCode,
          statusCode,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      return res.status(400).json({
        meta: {
          statusCode: statusCode,
          errorCode: 927,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital does not have a managing company email",
        },
      });
    }
    const crypto = require("crypto");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // 1 hour from now

    hospital.ResetToken = resetToken;
    hospital.ResetTokenExpires = resetTokenExpires;
    await hospital.save({ fields: ["ResetToken", "ResetTokenExpires"] });

    const resetLink = `http://localhost:3000/api/v1/hospital/reset-password${resetToken}`;

    // Use the sendEmail function
    const emailResponse = await sendEmail(
      managingCompanyEmail,
      "Password Reset Request",
      `You requested a password reset. Click the link to reset your password: ${resetLink}`
    );

    if (emailResponse.meta.statusCode !== 200) {
      throw new Error("Failed to send reset email ");
    }
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Password reset link sent to ${managingCompanyEmail}`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );

    // logger.info(`Password reset link sent to ${managingCompanyEmail}`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset link sent successfully",
      },
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error('Error requesting password reset', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 928;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error requesting password reset`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.status(500).json({
      meta: {
        statusCode: statusCode,
        errorCode: 928,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error requesting password reset: " + error.message,
      },
    });
  }
};

exports.resetPassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { token, newPassword } = req.body;

  try {
    const hospital = await Hospital.findOne({
      where: {
        ResetToken: token,
        ResetTokenExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!hospital) {
      // const end = Date.now();
      // logger.warn('Invalid or expired reset token', { executionTime: `${end - start}ms` });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 929;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta("warn", `Invalid or expired reset token`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });

      return res.status(400).json({
        meta: {
          statusCode: statusCode,
          errorCode: 929,
        },
        error: {
          message: "Invalid or expired reset token",
        },
      });
    }

    // Hash the new password
    // const SALT_ROUNDS = 10;
    // const salt = await bcrypt.genSalt(SALT_ROUNDS);
    // const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    // logger.info(`New password hashed: ${hashedNewPassword}`);

    // Save the new password
    hospital.Password = newPassword;
    await hospital.save({ fields: ["Password"] });

    // Log the password stored in the database
    const storedPassword = hospital.Password;
    logger.info(`Password stored in database: ${storedPassword}`);

    // Reload the hospital instance from the database to ensure the password was saved correctly
    await hospital.reload();
    logger.info(`Reloaded password from database: ${hospital.Password}`);

    // Verify that the saved password matches the hashed password
    // const isMatch = await bcrypt.compare(newPassword, hospital.Password);
    // logger.info(`Passwords match: ${isMatch}`);
    // if (!isMatch) {
    //   logger.error('Password mismatch: hashed password does not match stored password');
    //   logger.error(`New password: ${newPassword}`);
    //   logger.error(`Hashed password: ${hashedNewPassword}`);
    //   logger.error(`Stored password: ${hospital.Password}`);
    //   return res.status(500).json({
    //     meta: {
    //       statusCode: 500,
    //       errorCode: 962
    //     },
    //     error: {
    //       message: 'Error resetting password: password mismatch'
    //     }
    //   });
    // }

    // Clear reset token and expiration time
    hospital.ResetToken = null;
    hospital.ResetTokenExpires = null;
    await hospital.save({ fields: ["ResetToken", "ResetTokenExpires"] });
    logger.info("Reset token and expiration time cleared in the database");
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Password reset successfully for hospital with email ${hospital.Email}`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.info(`Password reset successfully for hospital with email ${hospital.Email}`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset successfully",
      },
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error('Error resetting password', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 930;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error resetting password`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(500).json({
      meta: {
        statusCode: statusCode,
        errorCode: 930,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error resetting password: " + error.message,
      },
    });
  }
};

exports.changePassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // const end = Date.now();
    // logger.info('Validation errors occurred', { errors, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 931;
    const statusCode = 400;

    // Log the warning
    logger.logWithMeta("warn", `Validation errors occurred`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 931,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { currentPassword, newPassword } = req.body;
  const uniqueKey = req.headers["x-unique-key"];

  try {
    const hospital = await Hospital.findOne({
      where: { UniqueKey: uniqueKey },
    });
    if (!hospital) {
      // const end = Date.now();
      // logger.warn('Hospital not found with provided unique key', { uniqueKey, executionTime: `${end - start}ms` });

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 932;
      const statusCode = 404;
      // Log the warning
      logger.logWithMeta(
        "warn",
        `Hospital not found with provided unique key`,
        {
          errorCode,
          statusCode,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 932,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital not found",
        },
      });
    }

    // Uncomment this section if you want to verify the current password

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      hospital.Password
    );
    if (!passwordMatch) {
      // const end = Date.now();
      // logger.warn('Current password is incorrect', { executionTime: `${end - start}ms` });

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 933;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta("warn", `Current password is incorrect`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 933,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Current password is incorrect",
        },
      });
    }

    // const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    // logger.info(`New password hashed: ${hashedNewPassword}`);

    hospital.Password = newPassword;

    // Save the new password to the database
    await hospital.save({ fields: ["Password"] });

    // Log the password after it has been saved to the database
    const updatedHospital = await Hospital.findOne({
      where: { UniqueKey: uniqueKey },
    });
    logger.info(`New password stored in database: ${updatedHospital.Password}`);

    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Password changed successfully for hospital with email ${hospital.ManagingCompanyEmail}`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.info(`Password changed successfully for hospital with email ${hospital.ManagingCompanyEmail}`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
      },
      data: {
        message: "Password changed successfully",
      },
    });
  } catch (error) {
    //     const end = Date.now();
    // logger.error('Error changing password', { error: error.message, executionTime: `${end - start}ms` });

    const end = Date.now();

    const executionTime = `${end - start}ms`;
    const errorCode = 934;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error changing password`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 934,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error changing password: " + error.message,
      },
    });
  }
};

exports.changeEmail = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    // logger.info('Validation errors occurred', errors);
    const executionTime = `${end - start}ms`;
    const errorCode = 935;
    const statusCode = 400;
    // Log the warning
    logger.logWithMeta("warn", `Validation errors occurred`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 935,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { ManagingCompanyEmail } = req.body;
  const uniqueKey = req.headers["x-unique-key"];

  try {
    const hospital = await Hospital.findOne({
      where: { UniqueKey: uniqueKey },
    });
    if (!hospital) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 935;
      const statusCode = 404;
      // Log the warning
      logger.logWithMeta("warn", `Validation errors occurred`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      //       const end = Date.now();
      // logger.warn('Hospital not found with provided unique key', { uniqueKey: providedUniqueKey, executionTime: `${end - start}ms` });

      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 935,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Hospital not found",
        },
      });
    }

    // Update hospital's email
    hospital.ManagingCompanyEmail = ManagingCompanyEmail;
    await hospital.save({ fields: ["ManagingCompanyEmail"] });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Email updated successfully for hospital with unique key ${uniqueKey}`,
      {
        executionTime,
        statusCode: 200,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.info(`Email updated successfully for hospital with unique key ${uniqueKey}`, { uniqueKey, executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Email changed successfully",
      },
    });
  } catch (error) {
    //     const end = Date.now();
    // logger.error('Error changing email', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 936;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta("warn", `Error changing email`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 936,
      },
      error: {
        message: "Error changing email: " + error.message,
      },
    });
  }
};

exports.ensureSequelizeInstance = (req, res, next) => {
  const start = Date.now();
  // const clientIp = await getClientIp(req);

  if (!req.hospitalDatabase) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 937;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Database connection not established`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.error('Database connection not established', { executionTime: `${end - start}ms` });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 937,
        executionTime: `${end - start}ms`,
      },

      error: {
        message: "Database connection not established",
      },
    });
  }

  const sequelize = new Sequelize(
    req.hospitalDatabase,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
    }
  );

  req.sequelize = sequelize;
  // logger.info('Sequelize instance created successfully');
  const end = Date.now();
  const executionTime = `${end - start}ms`;
  // Log the warning
  // logger.logWithMeta("warn", `Sequelize instance created successfully`, {
  //   executionTime,
  //   statusCode: 200,
  //   hospitalId: req.hospitalId,
  //   // ip: clientIp,
  //   apiName: req.originalUrl, // API name
  //   method: req.method,
  //   userAgent: req.headers["user-agent"], // HTTP method
  // });
  next();

  sequelize
    .sync({ alter: true })
    .then(() => {
      console.log("Database synchronized successfully.");
    })
    .catch((error) => {
      console.error("Error synchronizing the database:", error);
    });
};

// exports.ensureSequelizeInstance = (req, res, next) => {
//   const start = Date.now();
//   if (!req.hospitalDatabase) {

//     const end = Date.now();
//     logger.error('Database connection not established', { executionTime: `${end - start}ms` });

//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 927,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Database connection not established'
//       }
//     });
//   }

//   const sequelize = new Sequelize(
//     req.hospitalDatabase,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//       host: process.env.DB_HOST,
//       dialect: process.env.DB_DIALECT
//     }
//   );

//   req.sequelize = sequelize;
//   logger.info('Sequelize instance created successfully');
//   next();

//   sequelize.sync({ alter: true })
//     .then(() => {
//       console.log('Database synchronized successfully.');
//     })
//     .catch(error => {
//       console.error('Error synchronizing the database:', error);
//     });
// };

//     // Import models
//     const Hospital = require('../models/HospitalModel')(sequelize, DataTypes);
//     const Department = require('../models/DepartmentModel')(sequelize, DataTypes);
//     // const Designation = require('../models/DesignationModel')(sequelize, DataTypes);

//     // Define associations
//     if (typeof Hospital.associate === 'function') {
//       Hospital.associate({ Department/*, Designation*/  });
//     }
//     if (typeof Department.associate === 'function') {
//       Department.associate({ Hospital });
//     }
//     // if (typeof Designation.associate === 'function') {
//     //   Designation.associate({ Hospital });
//     // }

//     await sequelize.sync({ force: true }); // Use force: true to recreate the table if it exists

//     console.log('Database & tables created!');
//     req.sequelize = sequelize;
//     logger.info('Sequelize instance created successfully');
//     next();
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error syncing database', {
//       executionTime: `${end - start}ms`,
//       error: error.message,
//       stack: error.stack
//     });
//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 928,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error syncing database',
//         details: error.message
//       }
//     });
//   }
// };

// exports.createUser = async (req, res) => {
//   const start = Date.now();
//   const { name, username, phone, email, password, empid ,usertype,Reserve1, Reserve2, Reserve3, Reserve4} = req.body;
//   const hospitalId = req.hospitalId;

//   try {
//     if (!password) {
//       const end = Date.now();
//       throw new Error('Password is required');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds
//     const verificationToken = uuidv4();
//     const tokenExpiration = new Date();
//     tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 10);
//     const User = require('../models/user')(req.sequelize)

//     // Ensure the table exists
//     await User.sync();

//     const user = await User.create({
//       username,
//       password: hashedPassword,
//       hospitalId,
//       name,
//       phone,
//       email,
//       empid,
//       usertype,
//       emailtoken: verificationToken,
//       createdBy: hospitalId,Reserve1, Reserve2, Reserve3, Reserve4
//     });
//     logger.info(`User created successfully with username: ${username}, hospitalId: ${hospitalId}`);

//     const verificationLink = `http://localhost:3000/api/v1/hospital/verify/${verificationToken}`; // Replace with your actual verification link

//     await sendUserEmail(email, 'Verify Your Email', `Click this link to verify your email: ${verificationLink}`);

//     // In the try block, make sure you are calling `sendUserEmail`:

//     const end = Date.now();
//     res.status(201).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         // userId: user.userId,
//         // username: user.username
//         user
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error creating user', { error: error.message, executionTime: `${end - start}ms` });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 928,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error creating user: ' + error.message
//       }
//     });
//   }
// };

// User Creation Function
// User Creation Function

// exports.createUser = async (req, res) => {
//   const start = Date.now();
//   const { name, username, phone, email, password, empid, usertype } = req.body;
//   const hospitalId = req.hospitalId;
//   const hospitalDatabase = req.hospitalDatabase;

//   try {
//     if (!password) {
//       throw new Error('Password is required');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a unique token and include the hospitalDatabase in the token metadata
//     const verificationToken = uuidv4();
//     const tokenExpiration = new Date();
//     tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 10);

//     const User = require('../models/user')(req.sequelize);
//     await User.sync();

//     const user = await User.create({
//       username,
//       password: hashedPassword,
//       hospitalId,
//       name,
//       phone,
//       email,
//       empid,
//       usertype,
//       emailtoken: verificationToken,
//       createdBy: hospitalId,
//     });

//     // Construct the verification link with token and database name
//     const verificationLink = `http://localhost:3000/api/v1/hospital/verify/${verificationToken}?db=${encodeURIComponent(hospitalDatabase)}`;

//     await sendUserEmail(email, 'Verify Your Email', `Click this link to verify your email: ${verificationLink}`);

//     res.status(201).json({
//       meta: {
//         statusCode: 201,
//         executionTime: `${Date.now() - start}ms`,
//         hospitalDatabase // Include hospitalDatabase in the response
//       },
//       data: { user },
//       message: 'User created successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 928,
//         executionTime: `${Date.now() - start}ms`,
//         hospitalDatabase // Include hospitalDatabase in the response even in case of error
//       },
//       error: { message: 'Error creating user: ' + error.message },
//     });
//   }
// };
const ENCRYPT_SECRET_KEY1 = process.env.ENCRYPT_SECRET_KEY2;


const encryptAES = (text, secretKey) => {
  try {
    console.log("Encrypting text:", text);
    console.log("Using secret key:", secretKey);
    return CryptoJS.AES.encrypt(text, secretKey).toString();
  } catch (error) {
    console.error("Encryption Error:", error.message);
    throw new Error("Error during encryption");
  }
};


exports.createUser = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { name, username, phone, email, password, empid, usertype } = req.body;
  const hospitalId = req.hospitalId;
  const hospitalDatabase = req.hospitalDatabase;

  try {
    if (!password) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 938;

      // Log the warning
      logger.logWithMeta("warn", `Password is required`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });
      throw new Error("Password is required");
    }

    const User = require("../models/user")(req.sequelize);
    await User.sync();

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 940;

      // Log the warning
      logger.logWithMeta("warn", `Email already exists`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 940,
          executionTime,
          hospitalDatabase,
        },
        error: { message: "Email already exists." },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a unique token
    const verificationToken = uuidv4();

    const encodeBase64 = (text) => Buffer.from(text).toString("base64");

    let encryptedDB = encryptAES(hospitalDatabase, ENCRYPT_SECRET_KEY1);
    let encryptedtoken = encryptAES(verificationToken, process.env.ENCRYPT_SECRET_KEY3);
    encryptedtoken = encodeBase64(encryptedtoken)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    encryptedDB = encodeBase64(encryptedDB);

    const user = await User.create({
      username,
      password: hashedPassword,
      hospitalId,
      name,
      phone,
      email,
      empid,
      usertype,
      emailtoken: encryptedtoken,
      createdBy: hospitalId,
    });

    // const verificationLink = `http://localhost:3000/api/v1/hospital/verify/${encryptedtoken}?db=${encryptedDB}`;
    const verificationLink = `http://${process.env.HOST}:3000/api/v1/hospital/verify/${encryptedtoken}?db=${encryptedDB}`;

    await sendUserEmail(
      email,
      "Verify Your Email",
      `Click this link to verify your email: ${verificationLink}`
    );

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    logger.logWithMeta(
      "warn",
      `User created successfully. Verification email sent`,
      {
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      }
    );
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: { user },
      message: "User created successfully. Verification email sent.",
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 939;

    logger.logWithMeta("warn", `Error creating user`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 939,
        executionTime,
        hospitalDatabase,
      },
      error: { message: "Error creating user: " + error.message },
    });
  }
};


const decryptAES = (encryptedText, secretKey) => {
  const start = Date.now();
  // const clientIp = await getClientIp(req);
  try {
    console.log("Decrypting text**********:", encryptedText);
    console.log("Using secret key************:", secretKey);

    if (!encryptedText || !secretKey) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 940;

      // Log the warning
      logger.logWithMeta("warn", `Missing encrypted text or secret key`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        // ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });

      throw new Error("Missing encrypted text or secret key");
    }

    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 941;

      // Log the warning
      logger.logWithMeta("warn", `Decryption resulted in an empty string`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        // ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      throw new Error("Decryption resulted in an empty string");
    }

    return decrypted;
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 942;

    // Log the warning
    logger.logWithMeta("warn", `Error during decryption`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    console.error("Decryption Error:", error.message);
    throw new Error("Error during decryption");
  }
};

const decodeBase64 = (text) => Buffer.from(text, "base64").toString("utf8");

// const decryptAEStoken = (encryptedtoken, secretKey) => {
//   try {
//     console.log('Decrypting text**********:', encryptedtoken);
//     console.log('Using secret key************:', secretKey);

//     if (!encryptedtoken || !secretKey) {
//       throw new Error('Missing encrypted text or secret key');
//     }

//     const bytes = CryptoJS.AES.decrypt(encryptedtoken, secretKey);
//     const decryptedtoken = bytes.toString(CryptoJS.enc.Utf8);

//     if (!decryptedtoken) {
//       throw new Error('Decryption decryptedtoken in an empty string');
//     }

//     return decryptedtoken;
//   } catch (error) {
//     console.error('Decryption Error:', error.message);
//     throw new Error('Error during decryptedtoken');
//   }
// };

// const decodeBase64token = (text) => Buffer.from(text, 'base64').toString('utf8');

exports.verifyEmail = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { token } = req.params;
  // let token = req.params.token.replace(/-/g, '+').replace(/_/g, '/');
  const hospitalDatabase = req.query.db;

  try {
    if (!hospitalDatabase || !token) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 943;

      // Log the warning
      logger.logWithMeta("warn", `Missing database name or token`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      throw new Error("Missing database name or token");
    }

    const decodedDB = decodeBase64(hospitalDatabase);

    // const decodetoken = decodeBase64token(token);
    // const decodedToken = decodeBase64(token);

    console.log("Decoded DB//////:", decodedDB);

    // console.log('Decoded Token////////:', decodetoken);

    const decryptedDB = decryptAES(decodedDB, ENCRYPT_SECRET_KEY1);

    // const decryptedToken = decryptAEStoken(decodetoken, process.env.ENCRYPT_SECRET_KEY3);

    console.log("Decrypted DB.......:", decryptedDB);
    // console.log('Decrypted Token......:', decryptedToken);

    if (!decryptedDB || !token) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 944;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `Decryption failed or resulted in an empty string`,
        {
          errorCode,

          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 944,
          executionTime: `${Date.now() - start}ms`,
        },
        error: { message: "Decryption failed or resulted in an empty string" },
      });
    }

    const sequelize = new Sequelize(
      decryptedDB,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false,
      }
    );

    const User = require("../models/user")(sequelize);

    // const user = await User.findOne({ where: { emailtoken: decryptedToken } });
    const user = await User.findOne({ where: { emailtoken: token } });

    console.log("User found:", user);

    if (!user) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 945;

      // Log the warning
      logger.logWithMeta("warn", `Invalid or expired verification token`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 945,
          executionTime: `${Date.now() - start}ms`,
        },
        error: { message: "Invalid or expired verification token" },
      });
    }

    user.is_emailVerify = true;
    user.emailtoken = null;
    await user.save();
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Email verified successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.status(200).json({
      meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
      data: { message: "Email verified successfully" },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 946;

    // Log the warning
    logger.logWithMeta("warn", `Error verifying email`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    console.error("Verification Error:", error.message);
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 946,
        executionTime: `${Date.now() - start}ms`,
      },
      error: { message: "Error verifying email: " + error.message },
    });
  }
};

// exports.verifyEmail = async (req, res) => {
//   const start = Date.now();
//   console.log("Request Body:", req.body);  // Logs the request body
//   console.log("Request Params:", req.params);  // Logs URL params
//   console.log("Request Query:", req.query);  // Logs query string parameters
//   const { token } = req.params;
//   const hospitalDatabase = req.query.db; // Extract the database name from the query string
//   console.log("Token from URL Params:", token);
//   console.log("Database from Query:", hospitalDatabase);

//   if (!hospitalDatabase) {
//     return res.status(400).json({
//       meta: { statusCode: 400, errorCode: 927, executionTime: `${Date.now() - start}ms` },
//       error: { message: 'Database name not provided' },
//     });
//   }

//   try {
//     const sequelize = new Sequelize(
//       hospitalDatabase,
//       process.env.DB_USER,
//       process.env.DB_PASSWORD,
//       { host: process.env.DB_HOST, dialect: process.env.DB_DIALECT }
//     );

//     const User = require('../models/user')(sequelize);

//     const user = await User.findOne({ where: { emailtoken: token } });
//     if (!user) {
//       return res.status(400).json({
//         meta: { statusCode: 400, errorCode: 952, executionTime: `${Date.now() - start}ms` },
//         error: { message: 'Invalid or expired verification token' },
//       });
//     }

//     user.is_emailVerify = true;
//     user.emailtoken = null;
//     await user.save();

//     res.status(200).json({
//       meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
//       data: { message: 'Email verified successfully' },
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 953, executionTime: `${Date.now() - start}ms` },
//       error: { message: 'Error verifying email: ' + error.message },
//     });
//   }
// };

// exports.verifyEmail = async (req, res) => {
//   const start = Date.now();

//   console.log("Request Body:", req.body);  // Logs the request body
//   console.log("Request Params:", req.params);  // Logs URL params
//   console.log("Request Query:", req.query);  // Logs query string parameters

//   const { token } = req.params;
//   // const hospitalDatabase = req.query.db; // Extract the database name from the query string
//   const encryptedDatabase = req.query.db;

//   logger.info('Starting email verification process', { token, encryptedDatabase });

//   if (!token || !encryptedDatabase) {
//     const errorMessage = 'Token or database name not provided';
//     logger.error(errorMessage, { executionTime: `${Date.now() - start}ms` });
//     return res.status(400).json({
//       meta: { statusCode: 400, errorCode: 927, executionTime: `${Date.now() - start}ms` },
//       error: { message: errorMessage },
//     });
//   }
//   try {
//     // Decrypt the hospital database name
//     // const decryptedDbBytes = CryptoJS.AES.decrypt(encryptedDatabase.trim(), ENCRYPT_SECRET_KEY1);
//     // const hospitalDatabase = decryptedDbBytes.toString(CryptoJS.enc.Utf8);

//     if (!encryptedDatabase) {
//       throw new Error('Failed to decrypt the database name');
//     }

//     logger.info('Database name decrypted successfully', { encryptedDatabase });

//     // Decrypt the verification token
//     const decryptedTokenBytes = CryptoJS.AES.decrypt(token.trim(), ENCRYPT_SECRET_KEY1);
//     const decryptedToken = decryptedTokenBytes.toString(CryptoJS.enc.Utf8);

//     if (!decryptedToken) {
//       throw new Error('Failed to decrypt the verification token');
//     }

//     logger.info('Verification token decrypted successfully');

//     // Initialize Sequelize with the decrypted database name
//     const sequelize = new Sequelize(
//       hospitalDatabase,
//       process.env.DB_USER,
//       process.env.DB_PASSWORD,
//       { host: process.env.DB_HOST, dialect: process.env.DB_DIALECT }
//     );

//     const User = require('../models/user')(sequelize);

//     // Find the user by the decrypted token
//     const user = await User.findOne({ where: { emailtoken: decryptedToken } });

//     if (!user) {
//       const errorMessage = 'Invalid or expired verification token';
//       logger.warn(errorMessage, { token: decryptedToken, hospitalDatabase });
//       return res.status(400).json({
//         meta: { statusCode: 400, errorCode: 952, executionTime: `${Date.now() - start}ms` },
//         error: { message: errorMessage },
//       });
//     }

//     // Update user status
//     user.is_emailVerify = 1;
//     user.emailtoken = null;
//     await user.save();

//     logger.info('Email verified successfully', { userId: user.id, hospitalDatabase });

//     // Successful response
//     res.status(200).json({
//       meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
//       data: { message: 'Email verified successfully' },
//     });
//   } catch (error) {
//     // Detailed error logging
//     logger.error('Error verifying email', {
//       error: error.message,
//       stack: error.stack,
//       executionTime: `${Date.now() - start}ms`,
//     });

//     // Error response
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 953, executionTime: `${Date.now() - start}ms` },
//       error: { message: 'Error verifying email: ' + error.message },
//     });
//   }
// };

//   // console.log("Database from Query:", hospitalDatabase);

//   // Trim the hospitalDatabase string
//   const trimmedHospitalDatabase = hospitalDatabase.trim();

//   // Decrypt the trimmed hospitalDatabase
//   const bytes = CryptoJS.AES.decrypt(trimmedHospitalDatabase, ENCRYPT_SECRET_KEY1);
//   const verificationdb = bytes.toString(CryptoJS.enc.Utf8);

//   console.log("Decrypted Database:", verificationdb);

//   // Decrypt the token
//   const bytesToken = CryptoJS.AES.decrypt(token, ENCRYPT_SECRET_KEY1);
//   const decryptedToken = bytesToken.toString(CryptoJS.enc.Utf8);

//   console.log("Decrypted Token:", decryptedToken);

//   if (!verificationdb) {
//     return res.status(400).json({
//       meta: { statusCode: 400, errorCode: 927, executionTime: `${Date.now() - start}ms` },
//       error: { message: 'Database name not provided' },
//     });
//   }

//   try {
//     const sequelize = new Sequelize(
//       verificationdb,
//       process.env.DB_USER,
//       process.env.DB_PASSWORD,
//       { host: process.env.DB_HOST, dialect: process.env.DB_DIALECT }
//     );

//     const User = require('../models/user')(sequelize);

//     const user = await User.findOne({ where: { emailtoken: decryptedToken } });
//     if (!user) {
//       return res.status(400).json({
//         meta: { statusCode: 400, errorCode: 952, executionTime: `${Date.now() - start}ms` },
//         error: { message: 'Invalid or expired verification token' },
//       });
//     }

//     user.is_emailVerify = 1;
//     user.emailtoken = null;
//     await user.save();

//     res.status(200).json({
//       meta: { statusCode: 200, executionTime: `${Date.now() - start}ms` },
//       data: { message: 'Email verified successfully' },
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 953, executionTime: `${Date.now() - start}ms` },
//       error: { message: 'Error verifying email: ' + error.message },
//     });
//   }
// };

// Updated verifyEmail function
// Updated verifyEmail function
// exports.verifyEmail = async (req, res) => {
//   try {
//     const { db } = req.query;
//     const { token } = req.params;

//     if (!token || !db) {
//       return res.status(400).json({ success: false, message: 'Invalid or malformed token.' });
//     }

//     // Decrypt the token
//     // const bytes = CryptoJS.AES.decrypt(token, ENCRYPT_SECRET_KEY1);
//     // const verificationToken = bytes.toString(CryptoJS.enc.Utf8);

//     if (!token) {
//       return res.status(400).json({ success: false, message: 'Invalid or malformed token.' });
//     }

//     // Initialize the User model with the Sequelize instance from req
//     const User = require('../models/user')(req.sequelize);

//     // Find the user based on the decrypted token and hospitalId
//     const user = await User.findOne({
//       where: {
//         emailtoken: token,
//         hospitalId: db
//       }
//     });

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found or token expired.' });
//     }

//     // Mark the user as verified
//     user.emailVerified = true;
//     user.emailtoken = null; // Clear the token
//     await user.save();

//     res.status(200).json({ success: true, message: 'Email verified successfully.' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error verifying email: ' + error.message });
//   }
// };

// exports.verifyEmail = async (req, res) => {
//   const start = Date.now();
//   const { token } = req.params;

//   const User = require('../models/user')(req.sequelize);

//   try {
//     // Find user by email token
//     const user = await User(req.sequelize).findOne({ where: { emailtoken: token } });

//     if (!user) {
//       const end = Date.now();
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 952
//           ,
//         executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Invalid or expired verification token'
//         }
//       });
//     }

//     // Update user's email verification status
//     user.is_emailVerify = true; // Ensure correct field name as per your model definition
//     user.emailtoken = null; // Clear the token after verification
//     await user.save();
//     const end = Date.now();
// logger.info(`User email verified successfully with username: ${user.username}`, { executionTime: `${end - start}ms` });

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         message: 'Email verified successfully'
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error verifying email', { error: error.message, executionTime: `${end - start}ms` });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 953,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error verifying email: ' + error.message
//       }
//     });
//   }
// };

// exports.resendVerificationEmail = async (req, res) => {
//   const start = Date.now();
//   const { email } = req.body;
//   const User = require('../models/user')(req.sequelize);

//   try {
//     // Find the user by email
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       const end = Date.now();
//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 954,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'User not found'
//         }
//       });
//     }

//     if (user.is_emailVerify) {
//       const end = Date.now();
//       return res.status(200).json({
//         meta: {
//           statusCode: 200,
//           errorCode: 955,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Email is already verified'
//         }
//       });
//     }

//     // Generate a new verification token
//     const verificationToken = uuidv4();
//     user.emailtoken = verificationToken;
//     await user.save();

//     // Construct the verification link
//     const verificationLink = `http://localhost:3000/api/v1/hospital/verify/${verificationToken}`;

//     // Resend the verification email
//     await sendUserEmail(user.email, 'Resend Verification Email', `Click this link to verify your email: ${verificationLink}`);

//     const end = Date.now();
//     logger.info(`Verification email resent to ${user.email}`, { executionTime: `${end - start}ms` });

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         message: 'Verification email resent successfully'
//       }
//     });

//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error resending verification email', { error: error.message, executionTime: `${end - start}ms` });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 956,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error resending verification email: ' + error.message
//       }
//     });
//   }
// };

// exports.verifyEmail = async (req, res) => {
//   const { token } = req.params;
//   const User = require('../models/user')(req.sequelize);

//   try {
//     const user = await User.findOne({ where: { emailtoken: token } });

//     if (!user) {
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 929
//         },
//         error: {
//           message: 'Invalid or expired token'
//         }
//       });
//     }

//     user.emailVerified = true;
//     user.emailtoken = null;
//     await user.save();

//     res.status(200).json({
//       meta: {
//         statusCode: 200
//       },
//       data: {
//         message: 'Email verified successfully'
//       }
//     });
//   } catch (error) {
//     logger.error('Error verifying email', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 930
//       },
//       error: {
//         message: 'Error verifying email: ' + error.message
//       }
//     });
//   }
// };

// exports.verifyEmail = async (req, res) => {
//   const token = req.params.token;

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, 'your_secret_key'); // Replace 'your_secret_key' with your actual JWT secret key

//     console.log('Decoded token:', decoded);

//     // Extract the email from the decoded token
//     const email = decoded.email;
//     console.log('Email extracted from token:', email);

//     // Update the user's verification status in the database based on email
//     const [updatedRowsCount] = await User.update({ is_emailVerify: true }, { where: { email } });

//     // Check if any rows were updated
//     if (updatedRowsCount === 0) {
//       return res.status(404).json({
//         meta: {
//           statusCode: 404
//         },
//         data: {
//           message: 'User not found or already verified'
//         }
//       });
//     }

//     // Send a success response
//     logger.info({ message: 'Email verified successfully.' });
//     return res.status(200).json({
//       meta: {
//         statusCode: 200
//       },
//       data: {
//         message: 'Email verified successfully.'
//       }
//     });
//   } catch (error) {
//     // Handle token verification errors
//     console.error('Failed to verify email:', error);
//     return res.status(500).json({
//       meta: {
//         statusCode: 500
//       },
//       error: {
//         message: 'Failed to verify email',
//         error: error.message
//       }
//     });
//   }
// };

exports.resendVerificationEmail = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { email } = req.body;
  const User = require("../models/user")(req.sequelize);

  

  try {

  
    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 947;

      // Log the warning
      logger.logWithMeta("warn", `Email is not registered`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 947,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Email is not registered",
        },
      });
    }

    if (user.is_emailVerify == 1) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 948;

      // Log the warning
      logger.logWithMeta("warn", `Email is already verified`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      return res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 948,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Email is already verified",
        },
      });
    }

    const hospitalDatabase = req.hospitalDatabase;
    console.log("hospitalDatabase", hospitalDatabase);

    // Create a unique token
    let verificationToken = uuidv4();

    // Convert to Base64 and remove special characters
    const encodeBase64 = (text) => Buffer.from(text).toString("base64");

    let encryptedDB = encryptAES(hospitalDatabase, ENCRYPT_SECRET_KEY1);

    let encryptedtoken = encryptAES(
      verificationToken,
      process.env.ENCRYPT_SECRET_KEY3
    );
    encryptedtoken = encodeBase64(encryptedtoken);

    encryptedtoken = encryptedtoken
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    encryptedDB = encodeBase64(encryptedDB);

    // Save the email token to the user
    user.emailtoken = encryptedtoken;
    await user.save();

    // Construct the verification link
    const verificationLink = `http://localhost:3000/api/v1/hospital/verify/${encryptedtoken}?db=${encryptedDB}`;

/////////////

const secretKey = process.env.SYSTEM_SECRET_KEY;
const encrypted = CryptoJS.AES.encrypt(verificationLink, secretKey).toString();
const urlSafeEncrypted = encodeURIComponent(encrypted); // Make it URL-safe

console.log("Encrypted (URL Safe):", urlSafeEncrypted);

// Decrypt
const decryptedBytes = CryptoJS.AES.decrypt(decodeURIComponent(urlSafeEncrypted), secretKey);
const decryptedLink = decryptedBytes.toString(CryptoJS.enc.Utf8);

console.log("Decrypted Link:", decryptedLink);


///////////////







    // Resend the verification email
    await sendUserEmail(
      user.email,
      "Resend Verification Email",
      `Click this link to verify your email: ${verificationLink}`
    );

    // const end = Date.now();
    // logger.info(`Verification email resent to ${user.email}`, { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Verification email resent to ${user.email}`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // Correctly log the error when in the catch block

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Verification email resent successfully",
      },
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error('Error resending verification email', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 949;

    // Log the warning
    logger.logWithMeta("warn", `Error resending verification email`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 949,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error resending verification email: " + error.message,
      },
    });
  }
};
exports.getUser = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const User = require("../models/user")(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      // const end = Date.now();
      // logger.warn(`User with ID ${id} not found`, { executionTime: `${end - start}ms` });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 950;

      // Log the warning
      logger.logWithMeta("warn", `User with ID ${id} not found`, {
        errorCode,

        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 950,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "User not found",
        },
      });
    }
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `User with ID ${id} retrieved successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // const end = Date.now();
    // logger.info(`User with ID ${id} retrieved successfully`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        userId: user.userId,
        username: user.username,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    // const end = Date.now();
    // logger.error('Error retrieving user', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 951;

    // Log the warning
    logger.logWithMeta("warn", `Error retrieving user ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 951,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error retrieving user: " + error.message,
      },
    });
  }
};

exports.updateUser = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  const { name, phone, email, empid, usertype } = req.body;

  try {
    const User = require("../models/user")(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 952;

      // Log the warning
      logger.logWithMeta("warn", `User with ID ${id} not found`, {
        errorCode,
        errorMessage: "User not found",
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode,
          executionTime,
        },
        error: {
          message: "User not found",
        },
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (empid) user.empid = empid;
    if (usertype) user.usertype = usertype;

    await user.save();

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log the success message
    logger.logWithMeta("info", `User with ID ${id} updated successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        empid: user.empid,
        usertype: user.usertype,
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 953;

    // Log the error
    logger.logWithMeta("error", `Error updating user: ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
      },
      error: {
        message: `Error updating user: ${error.message}`,
      },
    });
  }
};


exports.deleteUser = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const User = require("../models/user")(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      // const end = Date.now();
      // logger.warn(`User with ID ${id} not found`, { executionTime: `${end - start}ms` });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 954;

      // Log the warning
      logger.logWithMeta(
        "warn",
        `User with ID ${id} not found}`,
        {
          errorCode,
          errorMessage: error.message,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method,
          userAgent: req.headers["user-agent"], // HTTP method
        }
      );

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 954,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "User not found",
        },
      });
    }

    await user.destroy();

    // const end = Date.now();
    // logger.info(`User with ID ${id} deleted successfully`, { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `User with ID ${id} deleted successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // Correctly log the error when in the catch block
    logger.logWithMeta("warn", `User with ID ${id} deleted successfully`, {
      // errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "User deleted successfully",
      },
    });
  } catch (error) {
    //     const end = Date.now();
    // logger.error('Error deleting user', { error: error.message, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 955;

    // Log the warning
    logger.logWithMeta("warn", `Error deleting user${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 955,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error deleting user: " + error.message,
      },
    });
  }
};
exports.getAllUsers = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  try {
    const User = require("../models/user")(req.sequelize);
    const users = await User.findAll();

    //     const end = Date.now();
    // logger.info(`Retrieved all users successfully`, { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Retrieved all users successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // Correctly log the error when in the catch block

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: users,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 956;

    // Log the warning
    logger.logWithMeta("warn", `Error retrieving all users${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // const end = Date.now();
    // logger.error('Error retrieving all users', { error: error.message, executionTime: `${end - start}ms` });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 956,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error retrieving all users: " + error.message,
      },
    });
  }
};
exports.getAllUsersByPagination = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5; // Default limit is 5, adjust as per your requirement

  const offset = (page - 1) * limit;

  try {
    const totalCount = await User(req.sequelize).count();
    const users = await User(req.sequelize).findAll({
      offset,
      limit,
      order: [["createdAt", "ASC"]], // Example ordering by createdAt, adjust as per your requirement
    });
    // const end = Date.now();
    // logger.info(`Retrieved users for page ${page} with limit ${limit} successfully`, { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `get all users successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // Correctly log the error when in the catch block

    res.status(200).json({
      meta: {
        statusCode: 200,
        totalCount,
        page,
        limit,
        executionTime: `${end - start}ms`,
      },
      data: users,
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 957;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Error retrieving users with pagination${error.message}`,
      {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    //     const end = Date.now();
    // logger.error('Error retrieving users with pagination', { error: error.message, executionTime: `${end - start}ms` });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 957,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error retrieving users with pagination: " + error.message,
      },
    });
  }
};

exports.loginUser = async (req, res) => {
  const start = Date.now();
  const logId = uuidv4();
  const clientIp = await getClientIp(req);
  const { Username, Password } = req.body;


  const secretKey = process.env.SYSTEM_SECRET_KEY;
  //   const Pass="1234"
  // // Encrypt
  // const encrypted = CryptoJS.AES.encrypt(Password, secretKey).toString();
  // console.log('Encrypted00000000000:', encrypted);
  
  // Decrypt
  const decryptedBytes = CryptoJS.AES.decrypt(Password, secretKey);
  const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

  console.log('Decrypted0000:', decryptedPassword);


  if (!Username || !decryptedPassword) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 958;
    const statusCode = 400;
    // Log the warning
    logger.logWithMeta("warn", `Username or Password not provided`, {
      errorCode,
      logId,
      statusCode,
      errorMessage: "Username and Password are required",
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 958,
        executionTime,
      },
      error: {
        message: "Username and Password are required",
      },
    });
  }

  try {
    const User = require("../models/user")(req.sequelize);
    const user = await User.findOne({ where: { username: Username } });

    if (!user || !(await bcrypt.compare(decryptedPassword, user.password))) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 959;
      const statusCode = 401;
      // Log the warning
      logger.logWithMeta("warn", `Invalid username or password`, {
        errorCode,
        logId,
        statusCode,
        errorMessage: "Invalid username or password",
        executionTime,
        hospitalId: req.hospitalId,
        hospitalName: req.hospitalName,
        username: Username,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 959,
          executionTime,
        },
        error: {
          message: "Invalid username or password",
        },
      });
    }

    if (user.is_emailVerify !== "1" || user.phoneverify !== "1") {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 960;
      const statusCode = 403;

      // Log the warning
      logger.logWithMeta("warn", `Email or phone not verified`, {
        errorCode,
        logId,
        statusCode,
        errorMessage: "Email or phone not verified",
        executionTime,
        hospitalId: req.hospitalId,
        username: Username,
        hospitalName: req.hospitalName,
        username: Username,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 960,
          executionTime,
        },
        error: {
          message:
            "Email or phone not verified. Please verify email and phone.",
        },
      });
    }

    // Check if the user already has a valid token in Redis
    const existingToken = await getAsync(user.userId.toString());
    let AccessToken = existingToken;

    // If token is not present, generate a new one
    if (!existingToken) {
      const payload = {
        userId: user.userId,
        username: user.username,
        HospitalId: user.hospitalId,
        email: user.email,
      };

      AccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      await setAsync(user.userId.toString(), AccessToken, "EX", 24 * 60 * 60);
    }

    const decodedToken = jwt.decode(AccessToken);
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decodedToken.exp - currentTime;
    const expiresInMinutes = Math.floor(expiresIn / 60);

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log success
    logger.logWithMeta("info", `Login successful`, {
      executionTime,
      logId,
      statusCode: 200,
      hospitalId: req.hospitalId,
      hospitalName: req.hospitalName,
      username: Username,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: {
        AccessToken,
        expiresInMinutes: `${expiresInMinutes} min`,
        user: {
          id: user.userId,
          username: user.username,
          email: user.email,
        },
        message: "Login successful",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 961;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error logging in: ${error.message}`, {
      errorCode,
      logId,
      statusCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      hospitalName: req.hospitalName,
      username: Username,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 961,
        executionTime,
      },
      error: {
        message: "Error logging in: " + error.message,
      },
    });
  }
};

// exports.sendOtp = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);

//   // Extract token from headers
//   const token = req.headers['accesstoken'];

//   if (!token) {
//     // const end = Date.now();
//     // logger.error('No access token provided', { executionTime: `${end - start}ms` });
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 962;

//     // Log the warning
//     logger.logWithMeta("warn", `No access token provided${error.message}`, {
//       errorCode,
//       errorMessage: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'],     // HTTP method
//     });

//     return res.status(401).json({

//       meta: {
//         statusCode: 401,
//         errorCode: 962,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Access token is required'
//       }
//     });
//   }

//   try {
//     // Verify and decode the JWT token (assuming Bearer format)
//     const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
//     logger.info('Decoded token:', decoded); // Debugging log

//     const email = decoded.email;

//     if (!email) {
//       // const end = Date.now();
//       // logger.error('No email found in access token', { executionTime: `${end - start}ms` });
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 963;

//       // Log the warning
//       logger.logWithMeta("warn", `No email found in access token${error.message}`, {
//         errorCode,
//         errorMessage: error.message,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers['user-agent'],     // HTTP method
//       });
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 963,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Email is required in the access token'
//         }
//       });
//     }

//     // Generate a 6-digit OTP using Math.random
//     const otp = Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999

//     // Store OTP in Redis with a 5-minute expiration
//     const userId = decoded.userId; // Assuming userId is part of the token
//     const expirationTime = 5 * 60; // 5 minutes in seconds
//     await setAsync(`otp_${userId}`, otp.toString(), 'EX', expirationTime);

//     // Prepare email content
//     const emailSubject = 'Your OTP Code';
//     const emailBody = `Your OTP code is ${otp}. It is valid for 5 minutes.`;

//     // Send email
//     await sendUserEmail(email, emailSubject, emailBody);

//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     // Log the warning
//     logger.logWithMeta("warn", `OTP sent successfully to your email`, {
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'],    // HTTP method
//     });

//     // const end = Date.now();
//     // logger.info('OTP sent successfully', { executionTime: `${end - start}ms` });
//     return res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         message: 'OTP sent successfully to your email'
//       }
//     });
//   } catch (error) {

//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 964;

//     // Log the warning
//     logger.logWithMeta("warn", `Error sending OTP ${error.message}`, {
//       errorCode,
//       errorMessage: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'],     // HTTP method
//     });
//     // const end = Date.now();
//     // logger.error('Error sending OTP', { error: error.message, executionTime: `${end - start}ms` });
//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 964,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error sending OTP: ' + error.message
//       }
//     });
//   }
// };
exports.sendOtp = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const logId = uuidv4();
  // Extract token from headers
  const token = req.headers["accesstoken"];

  if (!token) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 962;
    const statusCode = 401;
    // Log the warning
    logger.logWithMeta("warn", "No access token provided", {
      errorCode,
      logId,
      statusCode,
      errorMessage: "Access token is required",
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // User agent
    });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 962,
        executionTime,
      },
      error: {
        message: "Access token is required",
      },
    });
  }

  try {
    // Verify and decode the JWT token (assuming Bearer format)
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    const email = decoded.email;

    if (!email) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 963;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta("warn", "No email found in access token", {
        errorCode,
        logId,
        statusCode,
        errorMessage: "Email is required in the access token",
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // User agent
      });

      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 963,
          executionTime,
        },
        error: {
          message: "Email is required in the access token",
        },
      });
    }

    // Generate a 6-digit OTP using Math.random
    const otp = Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999

    // Store OTP in Redis with a 5-minute expiration
    const userId = decoded.userId; // Assuming userId is part of the token
    const expirationTime = 5 * 60; // 5 minutes in seconds
    await setAsync(`otp_${userId}`, otp.toString(), "EX", expirationTime);

    // Prepare email content
    const emailSubject = "Your OTP Code";
    const emailBody = `Your OTP code is ${otp}. It is valid for 5 minutes.`;

    // Send email
    await sendUserEmail(email, emailSubject, emailBody);

    const end = Date.now();
    const executionTime = `${end - start}ms`;

    // Log success message
    logger.logWithMeta("info", "OTP sent successfully to email", {
      executionTime,
      statusCode: 200,
      logId,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // User agent
    });

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: {
        message: "OTP sent successfully to your email",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 964;
    const statusCode = 500;
    // Log the error with error message
    logger.logWithMeta("warn", `Error sending OTP: ${error.message}`, {
      errorCode,
      statusCode,
      logId,
      errorMessage: error.message, // Properly access error message
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // User agent
    });

    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 964,
        executionTime,
      },
      error: {
        message: `Error sending OTP: ${error.message}`,
      },
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const logId = uuidv4();

  // Extract token from headers
  const token = req.headers["accesstoken"];

  if (!token) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 965;
    const statusCode = 401;
    // Log the warning
    logger.logWithMeta("warn", `No access token provided ${error.message}`, {
      errorCode,
      logId,
      statusCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // const end = Date.now();
    // logger.error('No access token provided', { executionTime: `${end - start}ms` });
    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 965,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Access token is required",
      },
    });
  }

  try {
    // Verify and decode the JWT token
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1212;

      // Correctly log the error when in the catch block
      logger.logWithMeta("warn", `Invalid token format`, {
        errorCode,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
      });
      throw new Error("Invalid token format");
    }

    const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
    logger.info("Decoded token:", decoded);

    const userId = decoded.userId; // Get userId from decoded token
    console.log("userId*******", userId);
    const { otp } = req.body; // OTP from the request body

    if (!otp) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 966;
      const statusCode = 400;

      // Log the warning
      logger.logWithMeta("warn", `No OTP provided ${error.message}`, {
        errorCode,
        logId,
        statusCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      // const end = Date.now();
      // logger.error('No OTP provided', { executionTime: `${end - start}ms` });
      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 966,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "OTP is required",
        },
      });
    }

    // Fetch the OTP from Redis
    const storedOtp = await getAsync(`otp_${userId}`);
    console.log("storedOtp****", storedOtp);

    if (!storedOtp) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 967;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta("warn", `OTP expired or not found ${error.message}`, {
        errorCode,
        logId,
        statusCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      // const end = Date.now();
      // logger.error('OTP expired or not found', { executionTime: `${end - start}ms` });
      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 967,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "OTP expired or not found",
        },
      });
    }

    if (otp !== storedOtp) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 968;
      const statusCode = 400;
      // Log the warning
      logger.logWithMeta("warn", `Invalid OTP ${error.message}`, {
        errorCode,
        statusCode,
        logId,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      // logger.error('Invalid OTP', { executionTime: `${end - start}ms` });
      return res.status(statusCode).json({
        meta: {
          statusCode: statusCode,
          errorCode: 968,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Invalid OTP",
        },
      });
    }
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `OTP verified successfully`, {
      executionTime,
      logId,
      statusCode: 200,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // // Correctly log the error when in the catch block
    // logger.logWithMeta("warn", `OTP verified successfully`, {
    //   // errorCode,
    //   // errorMessage: error.message,
    //   executionTime,
    //   // hospitalId: req.hospitalId,
    // });
    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "OTP verified successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 969;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error verifying OTP `, {
      errorCode,
      statusCode,
      logId,
      // errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // const end = Date.now();
    // logger.error('Error verifying OTP', { error: error.message, executionTime: `${end - start}ms` });
    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 969,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error verifying OTP: " ,
      },
    });
  }
};

// exports.verifyOtp = async (req, res) => {
//   const start = Date.now();

//   const {  otp } = req.body; // Assuming userId and OTP are passed in the request body

//   if (!otp) {
//     const end = Date.now();
//     logger.error('User ID or OTP not provided', { executionTime: `${end - start}ms` });
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 1057,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'OTP are required'
//       }
//     });
//   }

//   try {
//     // Retrieve OTP from Redis
//     const storedOtp = await getAsync(`otp_${userId}`);

//     if (!storedOtp) {
//       const end = Date.now();
//       logger.error('OTP not found or expired', { executionTime: `${end - start}ms` });
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 1058,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'OTP not found or expired'
//         }
//       });
//     }

//     // Compare provided OTP with stored OTP
//     if (otp !== storedOtp) {
//       const end = Date.now();
//       logger.error('Invalid OTP', { executionTime: `${end - start}ms` });
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 1059,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Invalid OTP'
//         }
//       });
//     }

//     // OTP is valid; proceed with further actions (e.g., user authentication)
//     const end = Date.now();
//     logger.info('OTP verified successfully', { executionTime: `${end - start}ms` });
//     return res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         message: 'OTP verified successfully'
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error verifying OTP', { error: error.message, executionTime: `${end - start}ms` });
//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 1060,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error verifying OTP: ' + error.message
//       }
//     });
//   }
// };

exports.getProfile = (req, res) => {
  const start = Date.now();
  // const clientIp = await getClientIp(req);
  const token = req.headers["authorization"];

  if (!token) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 970;
    const statusCode = 401;
    // Log the warning
    logger.logWithMeta("warn", `No token provided${error.message}`, {
      errorCode,
      // logId,
      statusCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    logger.warn("No token provided");
    return res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 970,
        message: "No token provided",
      },
    });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET); // Adjust the secret as necessary
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `get all user successfully`, {
      executionTime,
      // logId,
      hospitalId: req.hospitalId,
      statusCode: 200,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    // // Correctly log the error when in the catch block
    // logger.logWithMeta("warn", ` get all user successfully`, {

    //   executionTime,
    //   // hospitalId: req.hospitalId,
    // });
    res.status(200).json({
      meta: {
        statusCode: 200,
      },
      data: {
        userId: decoded.userId || "Unknown",
        hospitalId: decoded.hospitalId || "Unknown",
        // Add other fields you have in the token
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1155;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Failed to authenticate token${error.message}`, {
      errorCode,
      // logId,
      statusCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.error('Failed to authenticate token', { error: error.message });
    res.status(statusCode).json({
      meta: {
        statusCode: statusCode,
        errorCode: 1155,
        message: "Failed to authenticate token",
      },
    });
  }
};

exports.requestUserPasswordReset = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { User } = require("../models/user");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1156;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Validation errors occurred during password reset request`,
      {
        errorCode,
        logId,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.warn('Validation errors occurred during password reset request', { errors, executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1156,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { email } = req.body;

  if (!email) {
    logger.error("Email not provided", { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1157;

    // Log the warning
    logger.logWithMeta("warn", `Email is required`, {
      errorCode,
      logId,
      // errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1157,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Email is required",
      },
    });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1158;

      // Log the warning
      logger.logWithMeta("warn", `User with email ${email} not found`, {
        errorCode,
        logId,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      logger.warn(`User with email ${email} not found`, {
        executionTime: `${end - start}ms`,
      });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 1158,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "User not found",
        },
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `http://localhost:3000/api/v1/hospital/reset-Userpassword/${resetToken}`;

    const emailResponse = await sendEmail(
      email,
      "Password Reset Request",
      `You requested a password reset. Click the link to reset your password: ${resetLink}`
    );

    if (emailResponse.meta.statusCode !== 200) {
      throw new Error("Failed to send reset email");
    }

    // logger.info(`Password reset link sent to ${email}`, { executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Password reset link sent to ${email}`, {
      executionTime,
      logId,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset link sent successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1159;

    // Log the warning
    logger.logWithMeta("warn", `Error requesting password reset`, {
      errorCode,
      logId,
      // errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    logger.error("Error requesting password reset", {
      error: error.message,
      executionTime: `${end - start}ms`,
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1159,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error requesting password reset: " + error.message,
      },
    });
  }
};
exports.resetuserPassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1160;

    // Log the warning
    logger.logWithMeta(
      "warn",
      `Validation errors occurred during password reset`,
      {
        errorCode,
        logId,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    logger.warn("Validation errors occurred during password reset", {
      errors,
      executionTime: `${end - start}ms`,
    });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1160,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1161;

      // Log the warning
      logger.logWithMeta("warn", `Invalid or expired reset token`, {
        errorCode,
        logId,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      });
      logger.warn("Invalid or expired reset token", {
        executionTime: `${end - start}ms`,
      });

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 1161,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Invalid or expired reset token",
        },
      });
    }

    const SALT_ROUNDS = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    user.password = hashedNewPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta(
      "warn",
      `Password reset successfully for user with email ${user.email}`,
      {
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers["user-agent"], // HTTP method
      }
    );
    // logger.info(`Password reset successfully for user with email ${user.email}`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1162;

    // Log the warning
    logger.logWithMeta("warn", `Error resetting password'`, {
      errorCode,
      logId,
      // errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    // logger.error('Error resetting password', { error: error.message, executionTime: `${end - start}ms` });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1162,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error resetting password: " + error.message,
      },
    });
  }
};

exports.decodeToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const start = Date.now();
  

  // const clientIp = await getClientIp(req);
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const AccessToken = authHeader.split(" ")[1]; // Assuming the token is in the format "Bearer <token>"

  try {
    const decoded = jwt.verify(AccessToken, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debugging log
    req.user = decoded; // Attach the decoded token to the request object
    next();
  } catch (error) {
    console.error("Token verification failed:", error); // Debugging log
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Import the User model at the top of your controller file
// const User = require('../models/user'); // Adjust path as needed

exports.changeuserPassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { oldPassword, newPassword, ConfirmPassword } = req.body;

  if (!oldPassword || !newPassword || !ConfirmPassword) {
    const end = Date.now();
    logger.error("All password fields are required", {
      executionTime: `${end - start}ms`,
    });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1050,
        executionTime: `${end - start}ms`,
      },
      error: {
        message:
          "Old password, new password, and re-enter new password are required",
      },
    });
  }

  if (newPassword !== ConfirmPassword) {
    const end = Date.now();
    logger.error("New passwords do not match", {
      executionTime: `${end - start}ms`,
    });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1051,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "New passwords do not match",
      },
    });
  }

  try {
    console.log("req.user:", req.user); // Debugging log to check if req.user is set

    if (!req.user) {
      throw new Error("User ID is not defined in the token");
    }

    // Check if User model is loaded correctly
    // if (!User || typeof User.findOne !== 'function') {
    //   throw new Error('User model is not correctly defined or loaded');
    // }

    const user = await User.findOne({ where: { userId: req.user.userId } });
    console.log("user,ConfirmPassword", user)

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      const end = Date.now();
      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 1052,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Old password is incorrect",
        },
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Password updated successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password updated successfully",
      },
    });
  } catch (error) {
    console.error("Error in changePassword:", error); // Debugging log
    const end = Date.now();
    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1053,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error updating password: " + error.message,
      },
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { email } = req.body;

  if (!email) {
    const end = Date.now();
    logger.error("Email not provided", { executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 970,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Email is required",
      },
    });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const end = Date.now();
      logger.warn("User not found with provided email", {
        email,
        executionTime: `${end - start}ms`,
      });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 971,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "User not found",
        },
      });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

    // Save token and expiration to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send email with the reset token
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Use your email service
      auth: {
        user: process.env.EMAIL, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password
      },
    });

    const mailOptions = {
      to: email,
      from: process.env.EMAIL,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset/${resetToken}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    // logger.info(`Password reset token sent to ${email}`, { email, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Password reset token sent to ${email}`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset token sent successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    logger.error("Error in forgot password", {
      error: error.message,
      executionTime: `${end - start}ms`,
    });

    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 972,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error in forgot password: " + error.message,
      },
    });
  }
};

exports.resetPassword = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    const end = Date.now();
    logger.error("Token or new password not provided", {
      executionTime: `${end - start}ms`,
    });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 973,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Token and new password are required",
      },
    });
  }

  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      const end = Date.now();
      logger.warn("Invalid or expired token", {
        token,
        executionTime: `${end - start}ms`,
      });

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 974,
          executionTime: `${end - start}ms`,
        },
        error: {
          message: "Invalid or expired token",
        },
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear the reset token and expiration
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // logger.info('Password reset successfully', { userId: user.userId, executionTime: `${end - start}ms` });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // Log the warning
    logger.logWithMeta("warn", `Password reset successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers["user-agent"], // HTTP method
    });
    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: {
        message: "Password reset successfully",
      },
    });
  } catch (error) {
    const end = Date.now();
    logger.error("Error in resetting password", {
      error: error.message,
      executionTime: `${end - start}ms`,
    });

    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 975,
        executionTime: `${end - start}ms`,
      },
      error: {
        message: "Error in resetting password: " + error.message,
      },
    });
  }
};
