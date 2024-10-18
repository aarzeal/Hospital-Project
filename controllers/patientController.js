const PatientMaster = require('../models/PatientMaster');
const HospitalGroup = require('../models/HospitalGroup');
const Hospital = require('../models/HospitalModel');
const logger = require('../logger');
const Sequelize = require('sequelize');
const { Op } = Sequelize;

const sendEmail = require('../Middleware/sendEmail');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const requestIp = require('request-ip');



const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 971 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

// exports.getAllPatients = async (req, res) => {
//   const start = Date.now();
//   try {
//     const clientIp = await getClientIp(req);
//     const patients = await PatientMaster.findAll();
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
//     logger.logWithMeta("info", `Retrieved all patients successfully`, {
//       executionTime,
//       hospitalId: req.hospitalId,
//       // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
//       userId: req.userId,
//       ip: clientIp, // Correctly log the client IP
//       userAgent: req.headers['user-agent'],
//       apiName: req.originalUrl, // API name
//       method: req.method         // HTTP method
//     });

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: patients
//     });
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 972;

//     // Log the warning
//     logger.logWithMeta("warn", `Error retrieving patients`, {
//       errorCode,

//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method         // HTTP method
//     });

//     // logger.error('Error retrieving patients', { error: error.message, executionTime: `${end - start}ms` });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 972,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error retrieving patients: ' + error.message
//       }
//     });
//   }
// };


// Get patient by ID
// exports.getPatientById = async (req, res) => {
//   const start = Date.now();
//   const { id } = req.params;
//   try {
//     const patient = await PatientMaster.findByPk(id);
//     if (!patient) {
//       const end = Date.now(); 
//       logger.warn(`Patient with ID ${id} not found`, { executionTime: `${end - start}ms` });
//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 972,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Patient not found'
//         }
//       });
//     }
//     const end = Date.now();
//     logger.info(`Retrieved patient with ID ${id} successfully`);
//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: patient
//     });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error retrieving patient', { error: error.message, executionTime: `${end - start}ms`  });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 973,
//         executionTime: `${end - start}ms`

//       },
//       error: {
//         message: 'Error retrieving patient: ' + error.message
//       }
//     });
//   }
// };

// Function to get the client IP address
const { logWithMeta,getIp  } = require('../Middleware/loggerUtility'); // Import the utility

exports.getAllPatients = async (req, res) => {
  const start = Date.now(); // Start the execution timer
  try {
    const clientIp =  await getClientIp(req);// Assuming you have a utility function for this
    req.clientIp = clientIp; // Attach clientIp to req for logging

    const patients = await PatientMaster.findAll(); // Fetch all patients
    const end = Date.now();
    const executionTime = `${end - start}ms`; // Calculate execution time

    // Use the logging utility function, passing executionTime as additional metadata
    logWithMeta("info", "Retrieved all patients successfully", req, { executionTime });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime
      },
      data: patients
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`; // Calculate execution time in case of error
    const errorCode = 972;

    // Use the logging utility function for error logs, passing executionTime and errorCode
    logWithMeta("warn", "Error retrieving patients", req, { executionTime, errorCode });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime
      },
      error: {
        message: 'Error retrieving patients: ' + error.message
      }
    });
  }
};
const { v4: uuidv4 } = require('uuid'); // For generating unique log IDs

function maskSensitiveData(data) {
  if (data && data.startsWith("Bearer ")) {
      // Show first 12 characters of the token and mask the rest
      return `Bearer ${data.substring(7, 17)}...masked`;
  }
  return data ? `${data.substring(0, 6)}...masked` : null;
}

exports.getPatientById = async (req, res) => {
    const start = Date.now();
    // const clientIp =  await getClientIp(req);
    const logId = uuidv4(); // Generate a unique log ID for this request
    const { id } = req.params;

    // Extract metadata from the request to pass to logWithMeta
    const hospitalId = req.hospitalId || null;
    // const userId = req.userId || null;
    const clientIp = await getClientIp(req) || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const apiName = req.originalUrl;
    const method = req.method;
    const authorization = req.headers['authorization'] ? maskSensitiveData(req.headers['authorization']) : null;

    try {
        const patient = await PatientMaster.findByPk(id);

        if (!patient) {
            const end = Date.now();
            const executionTime = `${end - start}ms`;
            const errorCode = 973;
            const statusCode = 404

            // Log the warning with relevant metadata
            logWithMeta("warn", `Patient with ID ${id} not found`, {
                logId,
                hospitalId,
                // userId,
                clientIp,
                userAgent,
                apiName,
                method,
                errorCode,
                executionTime,
                statusCode,
                authorization

            });

            return res.status(statusCode).json({
                meta: {
                    statusCode,
                    errorCode,
                    logId,
                    executionTime
                },
                error: {
                    message: 'Patient not found'
                }
            });
        }

        const end = Date.now();
        const executionTime = `${end - start}ms`;

        // Log success with relevant metadata and patient info
        logWithMeta("info", `Retrieved patient with ID ${id} successfully`, {
            logId,
            hospitalId,
            // userId,
            clientIp,
            userAgent,
            apiName,
            method,
            executionTime
        }, {
            PatientID: patient.PatientID,
            EMRNumber: patient.EMRNumber,
            PatientFirstName: patient.PatientFirstName
        });

        res.status(200).json({
            meta: {
                statusCode: 200,
                logId,
                executionTime
            },
            data: patient.toJSON()
        });
    } catch (error) {
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 974;
        const statusCode = 500;
        

        // Log the error with relevant metadata
        logWithMeta("error", `Error retrieving patient`, {
            logId,
            hospitalId,
            // userId,
            clientIp,
            userAgent,
            apiName,
            method,
            errorCode,
            executionTime,
            statusCode,
            error: error.message
        });

        res.status(statusCode).json({
            meta: {
                statusCode,
                errorCode,
                logId,
                executionTime
            },
            error: {
                message: 'Error retrieving patient: ' + error.message
            }
        });
    }
};


// exports.getPatientById = async (req, res) => {
//   const start = Date.now();
//   const { id } = req.params;

//   try {
//       const patient = await PatientMaster.findByPk(id);
//       req.clientIp = await getClientIp(req); // Fetch and attach client IP for logging

//       if (!patient) {
//           const end = Date.now();
//           const executionTime = `${end - start}ms`;
//           const errorCode = 973;

//           // Log the warning with errorCode and executionTime
//           logWithMeta("warn", `Patient with ID ${id} not found`, req, {
//               errorCode,
//               executionTime
//           });

//           return res.status(404).json({
//               meta: {
//                   statusCode: 404,
//                   errorCode,
//                   executionTime
//               },
//               error: {
//                   message: 'Patient not found'
//               }
//           });
//       }

//       const end = Date.now();
//       const executionTime = `${end - start}ms`;

//       // Create a new object with specific fields to log
//       const responseToLog = {
//           PatientID: patient.PatientID,
//           EMRNumber: patient.EMRNumber,
//           PatientFirstName: patient.PatientFirstName
//       };

//       // Log success with executionTime and selected patient data
//       logWithMeta("info", `Retrieved patient with ID ${id} successfully`, req, {
//           executionTime
//       }, responseToLog);

//       res.status(200).json({
//           meta: {
//               statusCode: 200,
//               executionTime
//           },
//           data: patient.toJSON()
//       });
//   } catch (error) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 974;

//       // Log the error with errorCode and executionTime
//       logWithMeta("error", `Error retrieving patient`, req, {
//           errorCode,
//           executionTime,
//           error: error.message
//       });

//       res.status(500).json({
//           meta: {
//               statusCode: 500,
//               errorCode,
//               executionTime
//           },
//           error: {
//               message: 'Error retrieving patient: ' + error.message
//           }
//       });
//   }
// };

// exports.getPatientById = async (req, res) => {
//   const start = Date.now();
//   const { id } = req.params;

//   try {
//     // Fetch the patient by their ID
//     const patient = await PatientMaster.findByPk(id);
//     const clientIp = await getClientIp(req);

//     if (!patient) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 973;

//       // Log the warning
//       logger.logWithMeta("warn", `Patient with ID ${id} not found`, {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method         // HTTP method
//       });
//       // logger.warn(`Patient with ID ${id} not found`, { executionTime: `${end - start}ms` });
//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 973,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Patient not found'
//         }
//       });
//     }

//     // Read and convert the image to a base64 string
//     let imgBase64 = null;
//     if (patient.img) {
//       const imgPath = path.join(__dirname, '../profile', path.basename(patient.img));
//       if (fs.existsSync(imgPath)) {
//         const imgBuffer = fs.readFileSync(imgPath);
//         imgBase64 = `data:image/${path.extname(imgPath).slice(1)};base64,${imgBuffer.toString('base64')}`;

//         // Log the image to the console
//         console.log("Base64 Image String:", imgBase64);
//         console.log("Base64 Image String:");
//       }
//     }



//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     // Log success
//     logger.logWithMeta("info", `Retrieved patient with ID ${id} successfully`, {
//       executionTime,
//       hospitalId: req.hospitalId,
//       patientFirstName: patient.PatientFirstName, // Adjust to match actual field
//       userId: req.userId,
//       ip: clientIp, // Correctly log the client IP
//       userAgent: req.headers['user-agent'],
//       apiName: req.originalUrl, // API name
//       method: req.method         // HTTP method
//     });


//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         ...patient.toJSON(), // Convert the Sequelize model instance to a plain JSON object
//         img: imgBase64 // Return the image as a base64-encoded string
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
//     const errorCode = 974;

//     // Log the error
//     logger.logWithMeta("warn", `Error retrieving patient`, {
//       errorCode,
//       error: error.message,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method
//     });



//     // logger.error('Error retrieving patient', { error: error.message, executionTime: `${end - start}ms` });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 974,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error retrieving patient: ' + error.message
//       }
//     });
//   }
// };












const generateEMRNumber = async () => {
  const currentTimestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 1000);
  const emrNumber = `EMR${currentTimestamp}${randomPart}`;

  // Ensure the generated EMR number is unique
  const existingEMR = await PatientMaster.findOne({ where: { EMRNumber: emrNumber } });
  if (existingEMR) {
    // Recursively generate a new EMR number if a collision is found
    return generateEMRNumber();
  }
  return emrNumber;
};

// exports.createPatient = async (req, res) => {
//   const start = Date.now();

//   // Validation
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     logger.info('Validation errors occurred', { errors, executionTime: `${end - start}ms` });
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 912,
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

//   // Extract and parse raw data from form-data
//   // const rawData = JSON.parse(req.body.rawData);
//   const attachment = req.file;

//   const {
//     PatientMiddleName,
//     // HospitalGroupIDR,
//     PatientFirstName,
//     PatientLastName,
//     Age,
//     DOB,
//     BloodGroup,
//     Gender,
//     Phone,
//     WhatsappNumber,
//     Email,
//     AcceptedPolicy,
//     IsCommunicationAllowed,
//     PatientAddress,
//     EmergencyContactName,
//     EmergencyContactPhone,
//     InsuranceProvider,
//     InsurancePolicyNumber,
//     MedicalHistory,
//     CurrentMedications,
//     Allergies,
//     MaritalStatus,
//     Occupation,
//     Nationality,
//     Language,
//     country,
//     city,
//     state
//   }= req.body;

//   try {
//     // Check if phone number or email already exists
//     const existingPatient = await PatientMaster.findOne({
//       where: {
//         [Op.or]: [
//           { Phone },
//           { Email }
//         ]
//       }
//     });

//     if (existingPatient) {
//       const end = Date.now();
//       const duplicateField = existingPatient.Phone === Phone ? 'Phone number' : 'Email';
//       logger.info(`${duplicateField} already exists`, { executionTime: `${end - start}ms` });
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 1051,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: `${duplicateField} already exists`
//         }
//       });
//     }

//     // Generate EMR number
//     const EMRNumber = await generateEMRNumber();

//     // Create new patient record
//     const newPatient = await PatientMaster.create({
//       PatientMiddleName,
//       EMRNumber,
//       HospitalID: req.hospitalId,
//       HospitalGroupIDR: req.hospitalGroupIDR,
//       PatientFirstName,
//       PatientLastName,
//       Age,
//       DOB,
//       BloodGroup,
//       Gender,
//       Phone,
//       WhatsappNumber,
//       Email,
//       AcceptedPolicy,
//       IsCommunicationAllowed,
//       PatientAddress,
//       EmergencyContactName,
//       EmergencyContactPhone,
//       InsuranceProvider,
//       InsurancePolicyNumber,
//       MedicalHistory,
//       CurrentMedications,
//       Allergies,
//       MaritalStatus,
//       Occupation,
//       Nationality,
//       Language,
//       country,
//       city,
//       state
//     });


//     // Send SMS and email
//     const smsMessage = `Dear ${newPatient.PatientFirstName}, your registration was successful. Your EMR Number is ${newPatient.EMRNumber}.`;
//     await sendSMS(newPatient.Phone, smsMessage);

//     await sendEmail(newPatient.Email, 'Registration Successful', 'registrationEmailTemplate1.ejs', {
//       firstName: newPatient.PatientFirstName,
//       emrNumber: newPatient.EMRNumber,
//       hospitalName: req.hospitalName,
//       managingCompanyEmail: req.managingCompanyEmail
//     }, attachment);

//     const end = Date.now();
//     logger.info(`Created new patient with ID ${newPatient.PatientID} in ${end - start}ms`);
//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: newPatient
//     });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error creating patient', { error: error.message, executionTime: `${end - start}ms` });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 974,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error creating patient: ' + error.message
//       }
//     });
//   }
// };










// Setup multer for file uploads

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../profile');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  // filename: (req, file, cb) => {
  //   cb(null, Date.now() + path.extname(file.originalname));
  // }
  filename: async (req, file, cb) => {
    try {
      // Generate EMRNumber before saving the file to use it as the filename
      const EMRNumber = await generateEMRNumber();
      req.body.EMRNumber = EMRNumber // Store EMRNumber in the request body to use later
      cb(null, `${req.body.EMRNumber}${path.extname(file.originalname)}`);
    } catch (err) {
      logger.logWithMeta('Error storing img file path ', { error: err.message, erroerCode: 975 });

      cb(err);
    }
  }
});

const upload = multer({ storage });

// Function to decode base64 image and save it as a file
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
  const uploadPath = path.join(__dirname, '../profile');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Create the full file path with the extension
  const filePath = path.join(uploadPath, `${filename}.${ext}`);
  fs.writeFileSync(filePath, buffer); // Save the file

  return filePath; // Return the saved file path
};

exports.createPatient = [
  // Validation middleware (ensure this is used before multer middleware)
  // Example: body('name').notEmpty().withMessage('Name is required'),

  // File upload middleware
  upload.single('img'),

  async (req, res) => {
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    const start = Date.now();

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const end = Date.now();

      const executionTime = `${end - start}ms`;
      const errorCode = 976;

      // Ensure that error.message is logged separately if needed
      logger.logWithMeta("warn", `Validation errors occurred`, errors.array(), {
        errorCode,
        errorMessage: errors.array(), // Include the error message in meta explicitly
        executionTime,
        hospitalId: req.hospitalId,
      });
      // logger.info('Validation errors occurred', { errors: errors.array(), executionTime: `${end - start}ms` });
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 976,
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

    // Get file from request
    // const img = req.file ? req.file.path : null;

    // Extract data from request body
    console.log(req.body)
    const {
      PatientMiddleName,
      PatientFirstName,
      PatientLastName,
      Age,
      DOB,
      BloodGroup,
      Gender,
      Phone,
      WhatsappNumber,
      Email,
      AcceptedPolicy,
      IsCommunicationAllowed,
      PatientAddress,
      EmergencyContactName,
      EmergencyContactPhone,
      InsuranceProvider,
      InsurancePolicyNumber,
      MedicalHistory,
      CurrentMedications,
      Allergies,
      MaritalStatus,
      Occupation,
      Nationality,
      Language,
      country,
      city,
      state,
      img
    } = req.body;


    const parsedBloodGroup = parseInt(BloodGroup, 10);
    const parsedGender = parseInt(Gender, 10);
    const parsedMaritalStatus = parseInt(MaritalStatus, 10);
    const parsedNationality = parseInt(Nationality, 10);


    try {
      // Check for existing patient
      const existingPatient = await PatientMaster.findOne({
        where: {
          [Op.or]: [
            { Phone },
            { Email }
          ]
        }
      });

      if (existingPatient) {


        const duplicateField = existingPatient.Phone === Phone ? 'Phone number' : 'Email';
        const end = Date.now();
        const executionTime = `${end - start}ms`;
        const errorCode = 977;

        // Ensure that error.message is logged separately if needed
        logger.logWithMeta("warn", `${duplicateField} already exists`, {
          errorCode,
          executionTime,
          hospitalId: req.hospitalId,
        });
        // logger.info(`${duplicateField} already exists`, { executionTime: `${end - start}ms` });
        return res.status(400).json({
          meta: {
            statusCode: 400,
            errorCode: 977,
            executionTime: `${end - start}ms`
          },
          error: {
            message: `${duplicateField} already exists`
          }
        });
      }

      // Generate unique EMR number
      const EMRNumber = await generateEMRNumber();

      let savedImagePath = null;
      if (img) {
        savedImagePath = saveBase64Image(img, EMRNumber); // Save the image using EMRNumber as the filename
      }


      console.log("req.hospitalGroupIDR :", req.hospitalGroupId)
      // Create new patient record
      const newPatient = await PatientMaster.create({
        PatientMiddleName,
        EMRNumber,
        HospitalID: req.hospitalId,
        HospitalGroupIDR: req.hospitalGroupId,
        PatientFirstName,
        PatientLastName,
        Age,
        DOB,
        BloodGroup: parsedBloodGroup,
        Gender: parsedGender,
        Phone,
        WhatsappNumber,
        Email,
        AcceptedPolicy,
        IsCommunicationAllowed,
        PatientAddress,
        EmergencyContactName,
        EmergencyContactPhone,
        InsuranceProvider,
        InsurancePolicyNumber,
        MedicalHistory,
        CurrentMedications,
        Allergies,
        MaritalStatus: parsedMaritalStatus,
        Occupation,
        Nationality: parsedNationality,
        Language,
        country,
        city,
        state,
        img: savedImagePath
      });

      // Send SMS and email
      // const smsMessage = `Dear ${newPatient.PatientFirstName}, your registration was successful. Your EMR Number is ${newPatient.EMRNumber}.`;

      // await sendSMS(newPatient.Phone, smsMessage);
      // Send SMS and WhatsApp message

      //    try {
      //     // Regular SMS message to be sent
      //     const smsMessage = `Dear ${newPatient.PatientFirstName}, your registration was successful. Your EMR Number is ${newPatient.EMRNumber}.`;

      //     // Attempt to send a regular SMS
      //     const smsResponse = await sendSMS(newPatient.Phone, smsMessage, 'sms'); 
      //     console.log('SMS Response:', smsResponse, newPatient.Phone, smsMessage);

      //     // Attempt to send a WhatsApp message using the approved template
      //     const waResponse = await sendSMS(newPatient.Phone, 'arzeal_regs', 'document', 'PDFFile', 'https://smartping.live/trai/trai.pdf'); 
      //     console.log('WhatsApp Message Response:', waResponse);

      //     // Log the detailed WhatsApp response to troubleshoot delivery issues
      //     logger.info('WhatsApp message response:', { fullResponse: waResponse, statusCode: waResponse.statusCode, data: waResponse.data });

      // } catch (error) {
      //     // Enhanced error logging for detailed insight into failures
      //     logger.error('Error sending WhatsApp message', { 
      //         error: error.message, 
      //         stack: error.stack, 
      //         timestamp: new Date().toISOString() 
      //     });
      //     res.status(500).json({
      //         meta: {
      //             statusCode: 500,
      //             errorCode: 975, 
      //             message: 'Failed to send WhatsApp message, please contact support.'
      //         },
      //         error: {
      //             message: `Error sending message: ${error.message}`
      //         }
      //     });
      // }
      const { sendSMS } = require('../Middleware/smsService');

      // Ensure newPatient.Phone is defined and is a valid phone number
      console.log('New Patient Data:', newPatient);
      console.log('Patient Phone Number:', newPatient.Phone); // Log the phone number
      console.log('Patient first Number:', newPatient.PatientFirstName); // Log the phone number
      console.log('Patient Emr Number:', newPatient.EMRNumber); // Log the phone number

      // if (newPatient && newPatient.Phone) { // Ensure newPatient and Phone are defined
      //   sendSMS(newPatient.Phone)
      //     .then(response => {
      //       console.log('WhatsApp message response:', response);
      //     })
      //     .catch(error => {
      //       console.error('Error sending WhatsApp message:', error);
      //     });
      // } else {
      //   console.error('Error: newPatient or Phone number is not defined');
      // }


      /**************send sms working function start */
      // if (newPatient && newPatient.Phone && newPatient.PatientFirstName && newPatient.EMRNumber) {
      //   sendSMS(newPatient.Phone, newPatient.PatientFirstName, newPatient.EMRNumber)
      //     .then(response => {
      //       console.log('Sending SMS to:', newPatient.Phone);
      //       console.log('WhatsApp message response:', response);
      //     })
      //     .catch(error => {
      //       console.error('Error sending WhatsApp message:', error);
      //     });
      // } else {
      //   console.error('Error: newPatient, Phone number, PatientFirstName, or EMRNumber is not defined');
      // }


      /**************send sms working function end  */


      // sendSMS(newPatient.Phone)



      //   .then(response => {
      //     console.log('Sending SMS to:', newPatient.Phone);
      //     console.log('Sending SMS to:', newPatient.PatientFirstName);
      //     console.log('Sending SMS to:', newPatient.EMRNumber);
      //     console.log('WhatsApp message response:', response);
      //   })
      //   .catch(error => {
      //     console.error('Error sending WhatsApp message:', error);
      //   });



      await sendEmail(newPatient.Email, 'Registration Successful', 'registrationEmailTemplate1.ejs', {
        firstName: newPatient.PatientFirstName,
        emrNumber: newPatient.EMRNumber,
        hospitalName: req.hospitalName,
        managingCompanyEmail: req.managingCompanyEmail
      }, req.file);

      // Get the real IP address of the client
      let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

      // If IP is localhost or private, try fetching the public IP
      if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
        try {
          const ipResponse = await axios.get('https://api.ipify.org?format=json');
          clientIp = ipResponse.data.ip;
        } catch (error) {
          logger.error('Error fetching public IP', { error: error.message });
          clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
        }
      }

      console.log('Client IP:', clientIp);
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      // let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

      // console.log("clientIp.....",clientIp )
      // 
      // // Get API name and method
      const apiName = req.originalUrl; // This gets the original URL of the request
      const method = req.method;         // This gets the HTTP method (GET, POST, etc.)

      // Log the creation of the new patient
      logger.logWithMeta("info", `Created new patient with ID ${newPatient.PatientID} in ${executionTime} ms`, {
        executionTime,                         // Execution time in ms
        MRNumber: newPatient.EMRNumber,       // EMR Number
        hospitalId: req.hospitalId,          // Hospital ID
        patientId: newPatient.PatientID,      // Patient ID
        patientFirstName: newPatient.PatientFirstName, // Include first name separately if needed
        userId: req.userId,                  // User ID (if available)
        ip: clientIp,                         // Client IP
        userAgent: req.headers['user-agent'], // User agent from headers
        apiName,                              // API name
        method                                // HTTP method
      });


      // const end = Date.now();
      // logger.info(`Created new patient with ID ${newPatient.PatientID} in ${end - start}ms`);
      res.status(200).json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`
        },
        data: newPatient
      });
    } catch (error) {
      const end = Date.now();
      const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
      const errorCode = 978;

      // Log the error
      logger.logWithMeta("warn", `Error creating patient`, {
        errorCode,
        error: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method
      });

      // logger.error('Error creating patient', { error: error.message, executionTime: `${end - start}ms` });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 978,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Error creating patient: ' + error.message
        }
      });
    }
  }
];





exports.updatePatient = [
  // Validation middleware (ensure this is used before multer middleware)
  // Example: body('name').optional().notEmpty().withMessage('Name is required'),

  // File upload middleware (optional, only if updating image)
  upload.single('img'),


  async (req, res) => {
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);
    const clientIp = await getClientIp(req);

    const start = Date.now();

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const end = Date.now();
      const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
      const errorCode = 979;

      // Log the error
      logger.logWithMeta("warn", `Validation errors occurred`, {
        errorCode,
        // error: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method
      });

      // logger.info('Validation errors occurred', { errors: errors.array(), executionTime: `${end - start}ms` });
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 979,
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

    const {
      PatientMiddleName,
      PatientFirstName,
      PatientLastName,
      Age,
      DOB,
      BloodGroup,
      Gender,
      Phone,
      WhatsappNumber,
      Email,
      AcceptedPolicy,
      IsCommunicationAllowed,
      PatientAddress,
      EmergencyContactName,
      EmergencyContactPhone,
      InsuranceProvider,
      InsurancePolicyNumber,
      MedicalHistory,
      CurrentMedications,
      Allergies,
      MaritalStatus,
      Occupation,
      Nationality,
      Language,
      country,
      city,
      state,
      img
    } = req.body;

    const parsedBloodGroup = BloodGroup ? parseInt(BloodGroup, 10) : null;
    const parsedGender = Gender ? parseInt(Gender, 10) : null;
    const parsedMaritalStatus = MaritalStatus ? parseInt(MaritalStatus, 10) : null;
    const parsedNationality = Nationality ? parseInt(Nationality, 10) : null;

    try {
      // Find the patient to update by ID or other unique identifier
      const { patientId } = req.params; // Assume the patient ID is passed as a URL parameter
      const patient = await PatientMaster.findByPk(patientId);

      if (!patient) {

        const end = Date.now();
        const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
        const errorCode = 980;

        // Log the error
        logger.logWithMeta("warn", `Patient not found`, {
          errorCode,
          // error: error.message,
          executionTime,
          hospitalId: req.hospitalId,
          ip: clientIp,
          apiName: req.originalUrl, // API name
          method: req.method
        });
        // logger.info('Patient not found', { executionTime: `${end - start}ms` });
        return res.status(404).json({
          meta: {
            statusCode: 404,
            errorCode: 980,
            executionTime: `${end - start}ms`
          },
          error: {
            message: 'Patient not found'
          }
        });
      }

      // Handle image update if provided
      let savedImagePath = patient.img; // Use the existing image if not updated
      if (img) {
        savedImagePath = saveBase64Image(img, patient.EMRNumber); // Update the image using EMRNumber as the filename
      }

      // Update the patient's details
      await patient.update({
        PatientMiddleName: PatientMiddleName || patient.PatientMiddleName,
        PatientFirstName: PatientFirstName || patient.PatientFirstName,
        PatientLastName: PatientLastName || patient.PatientLastName,
        Age: Age || patient.Age,
        DOB: DOB || patient.DOB,
        BloodGroup: parsedBloodGroup || patient.BloodGroup,
        Gender: parsedGender || patient.Gender,
        Phone: Phone || patient.Phone,
        WhatsappNumber: WhatsappNumber || patient.WhatsappNumber,
        Email: Email || patient.Email,
        AcceptedPolicy: AcceptedPolicy !== undefined ? AcceptedPolicy : patient.AcceptedPolicy,
        IsCommunicationAllowed: IsCommunicationAllowed !== undefined ? IsCommunicationAllowed : patient.IsCommunicationAllowed,
        PatientAddress: PatientAddress || patient.PatientAddress,
        EmergencyContactName: EmergencyContactName || patient.EmergencyContactName,
        EmergencyContactPhone: EmergencyContactPhone || patient.EmergencyContactPhone,
        InsuranceProvider: InsuranceProvider || patient.InsuranceProvider,
        InsurancePolicyNumber: InsurancePolicyNumber || patient.InsurancePolicyNumber,
        MedicalHistory: MedicalHistory || patient.MedicalHistory,
        CurrentMedications: CurrentMedications || patient.CurrentMedications,
        Allergies: Allergies || patient.Allergies,
        MaritalStatus: parsedMaritalStatus || patient.MaritalStatus,
        Occupation: Occupation || patient.Occupation,
        Nationality: parsedNationality || patient.Nationality,
        Language: Language || patient.Language,
        country: country || patient.country,
        city: city || patient.city,
        state: state || patient.state,
        img: savedImagePath
      });
      const end = Date.now();
      const executionTime = `${end - start}ms`;


      // Log the warning
      logger.logWithMeta("warn", `Updated patient with ID ${patient.PatientID} in ${end - start}ms`, {

        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method         // HTTP method
      });

      // const end = Date.now();
      // logger.info(`Updated patient with ID ${patient.PatientID} in ${end - start}ms`);
      res.status(200).json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`
        },
        data: patient
      });
    } catch (error) {


      const end = Date.now();
      const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
      const errorCode = 981;

      // Log the error
      logger.logWithMeta("warn", `Error updating patient`, {
        errorCode,
        // error: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method
      });
      // logger.error('Error updating patient', { error: error.message, executionTime: `${end - start}ms` });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 981,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Error updating patient: ' + error.message
        }
      });
    }
  }
];











// exports.createPatient = async (req, res) => {
//   const hospitalName=req.hospitalName
//   console.log(hospitalName)
//   const start = Date.now();
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     logger.info('Validation errors occurred', { errors, executionTime: `${end - start}ms` });
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 912,
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




//    // Extract and parse JSON data
//    const rawData = req.body.rawData;
//   //  const attachment = req.file;

//    let patientData;
//    try {
//      patientData = JSON.parse(rawData);
//    } catch (error) {
//      return res.status(400).json({
//        meta: {
//          statusCode: 400,
//          errorCode: 913
//        },
//        error: {
//          message: 'Invalid JSON data',
//          details: error.message
//        }
//      });
//    }

//   const {
//     base64Data, 
//     PatientMiddleName,
//     EMRNumber,
//     PatientFirstName,
//     PatientLastName,
//     HospitalGroupIDR,
//     Age,
//     DOB,
//     BloodGroup,
//     Gender,
//     Phone,
//     WhatsappNumber,
//     Email,
//     AcceptedPolicy,
//     IsCommunicationAllowed,
//     PatientAddress,
//     EmergencyContactName,
//     EmergencyContactPhone,
//     InsuranceProvider,
//     InsurancePolicyNumber,
//     MedicalHistory,
//     CurrentMedications,
//     Allergies,
//     MaritalStatus,
//     Occupation,
//     Nationality,
//     Language,
//     createdBy, Reserve1, Reserve2, Reserve3, Reserve4 
//   } = req.body;

//   const attachment = req.file;
//   try {

//     const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
//     const patientData = JSON.parse(jsonString);

//     // Ensure required fields are present in the decoded data
//     if (!patientData.PatientFirstName || !patientData.Email) {
//         throw new Error('Missing required fields in the Base64 data');
//     }

//  // Check if phone number or email already exists
//  const existingPatient = await PatientMaster.findOne({
//   where: {
//     [Op.or]: [
//       { Phone },
//       { Email }
//     ]
//   }
// });

// if (existingPatient) {
//   const end = Date.now();
//   const duplicateField = existingPatient.Phone === Phone ? 'Phone number' : 'Email';
//   logger.info(`${duplicateField} already exists`, { executionTime: `${end - start}ms` });
//   return res.status(400).json({
//     meta: {
//       statusCode: 400,
//       errorCode: 1051,
//       executionTime: `${end - start}ms`
//     },
//     error: {
//       message: `${duplicateField} already exists`
//     }
//   });
// }




//   // Generate EMR number
//   const EMRNumber = await generateEMRNumber();


//     const newPatient = await PatientMaster.create({
//       PatientMiddleName,
//       EMRNumber,
//       HospitalID: req.hospitalId,
//       HospitalGroupIDR, // Ensure this is correctly set from the middleware
//       PatientFirstName,
//       PatientLastName,
//       Age,
//       DOB,
//       BloodGroup,
//       Gender,
//       Phone,
//       WhatsappNumber,
//       Email,
//       AcceptedPolicy,
//       IsCommunicationAllowed,
//       PatientAddress,
//       EmergencyContactName,
//       EmergencyContactPhone,
//       InsuranceProvider,
//       InsurancePolicyNumber,
//       MedicalHistory,
//       CurrentMedications,
//       Allergies,
//       MaritalStatus,
//       Occupation,
//       Nationality,
//       Language,
//       createdBy, Reserve1, Reserve2, Reserve3, Reserve4 
//     });

//      // Send registration success SMS
//     //  const smsMessage = `Dear ${newPatient.PatientFirstName}, your registration was successful. Your EMR Number is ${newPatient.EMRNumber}.`;
//     //  await sendSMS(newPatient.Phone, smsMessage);



//          // Send registration success email
//     // const emailSubject = 'Registration Successful';
//     // const emailText = `Dear ${newPatient.PatientFirstName},\n\nYour registration was successful. Your EMR Number is ${newPatient.EMRNumber}.\n\nThank you for choosing our services.`;
//     // await sendEmail(newPatient.Email, emailSubject, emailText);

//     // const attachment = req.file;

//     // await Promise.all([
//     //   sendSMS(newPatient.Phone, `Dear ${newPatient.PatientFirstName}, your registration was successful. Your EMR Number is ${newPatient.EMRNumber}.`),
//     //   sendEmail(newPatient.Email, 'Registration Successful', 'registrationEmailTemplate.ejs', {
//     //     firstName: newPatient.PatientFirstName,
//     //     emrNumber: newPatient.EMRNumber,
//     //     hospitalName  // Pass the hospital name
//     //   }
//     //   , attachment
//     // )
//     // ]);


//      // Send SMS and email
//      const smsMessage = `Dear ${newPatient.PatientFirstName}, your registration was successful. Your EMR Number is ${newPatient.EMRNumber}.`;
//      const emailSubject = 'Registration Successful';
//      const emailData = {
//        firstName: newPatient.PatientFirstName,
//        emrNumber: newPatient.EMRNumber,
//        hospitalName
//      };

//      await Promise.all([
//        sendSMS(newPatient.Phone, smsMessage),
//        sendEmail(newPatient.Email, emailSubject, 'registrationEmailTemplate.ejs', emailData, attachment)
//      ]);

//     const end = Date.now();
//     logger.info(`Created new patient with ID ${newPatient.PatientID} in ${end - start}ms`);
//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: newPatient
//     });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error creating patient', { error: error.message, executionTime: `${end - start}ms` });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 974,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error creating patient: ' + error.message
//       }
//     });
//   }
// };



// exports.updatePatient = async (req, res) => {
//   const start = Date.now(); 
//   const { id } = req.params;
//   const updates = req.body;

//   try {
//     const patient = await PatientMaster.findByPk(id);
//     if (!patient) {
//       const end = Date.now(); // Capture end time
//       logger.warn(`Patient with ID ${id} not found`, { executionTime: `${end - start}ms` });

//       logger.warn(`Patient with ID ${id} not found`);
//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 975
//         },
//         error: {
//           message: 'Patient not found'
//         }
//       });
//     }

//     await PatientMaster.update(updates, { where: { PatientID: id } });
//     const updatedPatient = await PatientMaster.findByPk(id);
//     const end = Date.now(); 
//     logger.info(`Updated patient with ID ${id} successfully`);
//     res.status(200).json({
//       meta: {
//         statusCode: 200
//       },
//       data: updatedPatient
//     });
//   } catch (error) {
//     logger.error('Error updating patient', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 976
//       },
//       error: {
//         message: 'Error updating patient: ' + error.message
//       }
//     });
//   }
// };                     

// Delete a patient
// exports.deletePatient = async (req, res) => {
//   const start = Date.now();
//   const { id } = req.params;
//   try {
//     const patient = await PatientMaster.findByPk(id);
//     if (!patient) {

//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 977;

//       logger.logWithMeta("warn", `patient with ID ${id} not found :`, {
//         errorCode,
//         error,
//         executionTime,

//         hospitalId:req.hospitalId
//       });
//       // logger.warn(`Patient with ID ${id} not found`, { executionTime: `${end - start}ms` });
//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 977,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Patient not found'
//         }
//       });
//     }

//     await PatientMaster.destroy({ where: { PatientID: id } });
//     const end = Date.now();
//     logger.info(`Deleted patient with ID ${id} successfully`);
//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//           executionTime: `${end - start}ms`
//       },
//       data: { message: 'Patient deleted successfully' }
//     });
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 978;

//     logger.logWithMeta("warn", `Error deleting patients ${error.message}  :`, {
//       errorCode,
//       errorMessage: error.message, 
//       executionTime,

//       hospitalId:req.hospitalId
//     });
//     // logger.error('Error deleting patient', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 978,
//             executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error deleting patient: ' + error.message
//       }
//     });
//   }
// };
exports.deletePatient = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const clientIp = await getClientIp(req);


  try {
    const patient = await PatientMaster.findByPk(id);
    if (!patient) {
      const end = Date.now();
      const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
      const errorCode = 982;

      // Log the error
      logger.logWithMeta("warn", `Patient with ID ${id} not found`, {
        errorCode,
        // error: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],
      });


      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 982,
          executionTime,
        },
        error: {
          message: 'Patient not found',
        },
      });
    }

    // Delete the patient if found
    await PatientMaster.destroy({ where: { PatientID: id } });
    const end = Date.now();
    const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
    

    // Log the error
    logger.logWithMeta("warn", `Deleted patient with ID ${id} successfully`, {
      
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],
    });
    logger.info(`Deleted patient with ID ${id} successfully`);
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`,
      },
      data: { message: 'Patient deleted successfully' },
    });

  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
    const errorCode = 983;

    // Log the error
    logger.logWithMeta("warn", `Error deleting patient: ${error.message}`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],
    });


    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 983,
        executionTime,
      },
      error: {
        message: `Error deleting patient: ${error.message}`,
      },
    });
  }
};


// Controller function to fetch patients by HospitalGroupID with pagination
exports.getPatientsByHospitalGroupID = async (req, res) => {
  
  const start = Date.now();
  const { id } = req.params;
  let { page, pageSize } = req.query;

  // Default values for pagination
  page = page ? parseInt(page, 10) : 1;
  pageSize = pageSize ? parseInt(pageSize, 10) : 2; // Default pageSize is 2

  try {
    // Calculate offset based on page number and pageSize
    const offset = (page - 1) * pageSize;

    // Find patients by HospitalGroupID with pagination
    const patients = await PatientMaster.findAll({
      where: { HospitalGroupIDR: id },
      limit: pageSize,
      offset: offset
    });

    // Check if patients array is empty
    if (!patients || patients.length === 0) {
      const end = Date.now();
      return res.status(200).json({
        meta: {
          statusCode: 200,
          page: page,
          pageSize: pageSize
        },
        data: [] // Return empty array when no patients are found
      });
    }
    const clientIp = await getClientIp(req);
    const end = Date.now();
    const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
    

    const apiName = req.originalUrl; // This gets the original URL of the request
    const method = req.method;         // This gets the HTTP method (GET, POST, etc.)

    // Log the creation of the new patient
    logger.logWithMeta("info", `Retrieved patients for HospitalGroupID ${id} with pagination in ${end - start}ms`, {
      executionTime,                         // Execution time in ms
      
      hospitalId: req.hospitalId,          // Hospital ID
      
      userId: req.userId,                  // User ID (if available)
      ip: clientIp,                         // Client IP
      userAgent: req.headers['user-agent'], // User agent from headers
      apiName,                              // API name
      method                                // HTTP method
    });
    // logger.info(`Retrieved patients for HospitalGroupID ${id} with pagination in ${end - start}ms`);
    // Return patients with pagination metadata
    res.status(200).json({
      meta: {
        statusCode: 200,
        page: page,
        pageSize: pageSize,
        executionTime: `${end - start}ms`
      },
      data: patients
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
    const errorCode = 984;

    // Log the error
    logger.logWithMeta("warn", `Error fetching patients by HospitalGroupID`, {
      errorCode,
      // error: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],
    });


    // logger.error('Error fetching patients by HospitalGroupID', { error: error.message, executionTime: `${end - start}ms` });
    console.error('Error fetching patients by HospitalGroupID', error);
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 984,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error fetching patients: ' + error.message
      }
    });
  }
};

exports.getAllPatientsByPagination = async (req, res) => {
  const start = Date.now();
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5; // Default limit is 10

  const offset = (page - 1) * limit;

  try {
    const totalCount = await PatientMaster.count();
    const patients = await PatientMaster.findAll({
      offset,
      limit,
      order: [['createdAt', 'ASC']] // Example ordering by createdAt, adjust as per your requirement
    });
    const end = Date.now();
    const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
   

    // Log the error
    logger.logWithMeta("warn", `Retrieved patients for page ${page} with limit ${limit} successfully`, {
      // errorCode,
      // error: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],
    });
    // logger.info(`Retrieved patients for page ${page} with limit ${limit} successfully`);

    res.status(200).json({
      meta: {
        statusCode: 200,
        totalCount,
        page,
        limit,
        executionTime: `${end - start}ms`
      },
      data: patients
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
    const errorCode = 985;

    // Log the error
    logger.logWithMeta("warn", `Error fetching patients by HospitalGroupID`, {
      errorCode,
      // error: error.message,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],
    });

    // logger.error('Error retrieving patients with pagination', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 985,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving patients with pagination: ' + error.message
      }
    });
  }
};

exports.getPatient = async (req, res) => {
  try {
    const { PatientFirstName, PatientLastName, PatientMiddleName, EMRNumber, Phone } = req.query;

    // Build search criteria based on provided parameters
    const searchCriteria = {};

    if (PatientFirstName) searchCriteria.PatientFirstName = { [Op.like]: `%${PatientFirstName}%` };
    if (PatientLastName) searchCriteria.PatientLastName = { [Op.like]: `%${PatientLastName}%` };
    if (PatientMiddleName) searchCriteria.PatientMiddleName = { [Op.like]: `%${PatientMiddleName}%` };
    if (EMRNumber) searchCriteria.EMRNumber = { [Op.like]: `%${EMRNumber}%` };
    if (Phone) searchCriteria.Phone = { [Op.like]: `%${Phone}%` };



    // if (PatientFirstName) searchCriteria.PatientFirstName = PatientFirstName;
    // if (PatientLastName) searchCriteria.PatientLastName = PatientLastName;
    // if (PatientMiddleName) searchCriteria.PatientMiddleName = PatientMiddleName;
    // if (EMRNumber) searchCriteria.EMRNumber = EMRNumber;
    // if (Phone) searchCriteria.Phone = Phone;

    const patients = await PatientMaster.findAll({ where: searchCriteria });

    if (patients.length > 0) {
      res.status(200).json(patients);
    } else {
      res.status(200).json({ message: 'No patients available' });
    }
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`; // Calculate execution time again for the catch block
    const errorCode = 986;

    // Log the error
    logger.logWithMeta("warn", `Internal server error: ${error.message}`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],
    });

    console.error(error);
    res.status(500).json({ message: 'Internal server error' ,errorCode});
  }
};

