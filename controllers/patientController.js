const PatientMaster = require('../models/PatientMaster');
const HospitalGroup = require('../models/HospitalGroup');
const Hospital = require('../models/HospitalModel');
const logger = require('../logger');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const { sendSMS } = require('../Middleware/smsService');
const sendEmail = require('../Middleware/sendEmail');

const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');
// Get all patients
// exports.getAllPatients = async (req, res) => {
//   const start = Date.now();
//   try {
//     const patients = await PatientMaster.findAll();
//     const end = Date.now(); 
//     logger.info('Retrieved all patients successfully');
//     logger.error('Error retrieving patients', { error: error.message, executionTime: `${end - start}ms` });
//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//           executionTime: `${end - start}ms`
//       },
//       data: patients
//     });
//   } catch (error) {
//     const end = Date.now(); 
//     logger.error('Error retrieving patients', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 971
//       },
//       error: {
//         message: 'Error retrieving patients: ' + error.message
//       }
//     });
//   }
// };
exports.getAllPatients = async (req, res) => {
  const start = Date.now();
  try {
    const patients = await PatientMaster.findAll();
    const end = Date.now(); 
    logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: patients
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error retrieving patients', { error: error.message, executionTime: `${end - start}ms` });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 971,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving patients: ' + error.message
      }
    });
  }
};


// Get patient by ID
exports.getPatientById = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  try {
    const patient = await PatientMaster.findByPk(id);
    if (!patient) {
      const end = Date.now(); 
      logger.warn(`Patient with ID ${id} not found`, { executionTime: `${end - start}ms` });
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 972,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Patient not found'
        }
      });
    }
    const end = Date.now();
    logger.info(`Retrieved patient with ID ${id} successfully`);
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: patient
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error retrieving patient', { error: error.message, executionTime: `${end - start}ms`  });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 973,
        executionTime: `${end - start}ms`

      },
      error: {
        message: 'Error retrieving patient: ' + error.message
      }
    });
  }
};

// Create a new patient
// exports.createPatient = async (req, res) => {

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//       logger.info('Validation errors occurred', errors);
//       return res.status(400).json({
//           meta: {
//               statusCode: 400,
//               errorCode: 912
//           },
//           error: {
//               message: 'Validation errors occurred',
//               details: errors.array().map(err => ({
//                   field: err.param,
//                   message: err.msg
//               }))
//           }
//       });
//   }
//   const {
//     PatientName,
//     EMRNumber,
//     HospitalGroupID,
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
//     createdBy
//   } = req.body;
//   console.log('HospitalID in request:', req.HospitalID);
//   try {
//     const newPatient = await PatientMaster.create({
//       PatientName,
//       EMRNumber,
//       // EMRNumber: generateEMRNumber(HospitalGroupID),
//       HospitalID: req.HospitalID,
//       HospitalGroupID,
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
//       createdBy
//     });

//     logger.info(`Created new patient with ID ${newPatient.PatientID}`);
//     res.status(201).json({
//       meta: {
//         statusCode: 201
//       },
//       data: newPatient
//     });
//   } catch (error) {
//     logger.error('Error creating patient', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 974
//       },
//       error: {
//         message: 'Error creating patient: ' + error.message
//       }
//     });
//   }
// };



// exports.createPatient = async (req, res) => {
//   const start = Date.now();
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now(); // Capture end time
//     logger.info('Validation errors occurred', { errors, executionTime: `${end - start}ms` });
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 912
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

//   const {
//     PatientName,
//     EMRNumber,
//     // HospitalGroupID,
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
//     createdBy
//   } = req.body;

//   console.log('HospitalID in request:', req.hospitalId);
//   console.log('HospitalGroupId in request:', req.HospitalGroupID);

//   try {
//     const newPatient = await PatientMaster.create({
//       PatientName,
//       EMRNumber,
//       HospitalID: req.hospitalId, // Correctly set HospitalID
//       HospitalGroupID: req.HospitalGroupID,
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
//       createdBy
//     });
//     const end = Date.now(); // Capture end time
//     logger.info(`Created new patient with ID ${newPatient.PatientID} in ${end - start}ms`);
//     // logger.info(`Created new patient with ID ${newPatient.PatientID}`);
//     res.status(201).json({
//       meta: {
//         statusCode: 201,
//           executionTime: `${end - start}ms`
//       },
//       data: newPatient
//     });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error creating patient', { error: error.message });
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

exports.createPatient = async (req, res) => {
  const start = Date.now();

  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    logger.info('Validation errors occurred', { errors, executionTime: `${end - start}ms` });
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

  // Extract and parse raw data from form-data
  // const rawData = JSON.parse(req.body.rawData);
  const attachment = req.file;

  const {
    PatientMiddleName,
    HospitalGroupIDR,
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
    Language
  }= req.body;

  try {
    // Check if phone number or email already exists
    const existingPatient = await PatientMaster.findOne({
      where: {
        [Op.or]: [
          { Phone },
          { Email }
        ]
      }
    });

    if (existingPatient) {
      const end = Date.now();
      const duplicateField = existingPatient.Phone === Phone ? 'Phone number' : 'Email';
      logger.info(`${duplicateField} already exists`, { executionTime: `${end - start}ms` });
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 1051,
          executionTime: `${end - start}ms`
        },
        error: {
          message: `${duplicateField} already exists`
        }
      });
    }

    // Generate EMR number
    const EMRNumber = await generateEMRNumber();

    // Create new patient record
    const newPatient = await PatientMaster.create({
      PatientMiddleName,
      EMRNumber,
      HospitalID: req.hospitalId,
      HospitalGroupIDR,
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
      Language
    });

    // Send SMS and email
    const smsMessage = `Dear ${newPatient.PatientFirstName}, your registration was successful. Your EMR Number is ${newPatient.EMRNumber}.`;
    await sendSMS(newPatient.Phone, smsMessage);

    await sendEmail(newPatient.Email, 'Registration Successful', 'registrationEmailTemplate1.ejs', {
      firstName: newPatient.PatientFirstName,
      emrNumber: newPatient.EMRNumber,
      hospitalName: req.hospitalName,
      managingCompanyEmail: req.managingCompanyEmail
    }, attachment);

    const end = Date.now();
    logger.info(`Created new patient with ID ${newPatient.PatientID} in ${end - start}ms`);
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: newPatient
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error creating patient', { error: error.message, executionTime: `${end - start}ms` });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 974,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error creating patient: ' + error.message
      }
    });
  }
};











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



// function generateEMRNumber(hospitalGroupId) {
//   // Generate a timestamp-based component
//   const timestampPart = Date.now().toString().slice(-6); // Last 6 digits of current timestamp

//   // Generate a random sequence part
//   const randomPart = Math.floor(1000 + Math.random() * 9000).toString(); // Random 4-digit number

//   // Combine hospital group ID, timestamp, and random part
//   const emrNumber = `${hospitalGroupId}-${timestampPart}-${randomPart}`;

//   return emrNumber;
// }

// Update an existing patient



// exports.createPatient = async (req, res) => {
//   const start = Date.now();

//   // Log request body and file for debugging
//   logger.info('Request received', { body: req.body, file: req.file });

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

//   // Extract the attachment
//   const attachment = req.file;

//   // Extract and parse JSON data from form-data
//   let patientData;
//   try {
//     patientData = JSON.parse(req.body.data);
//     logger.info('Parsed patient data', { patientData });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error parsing JSON data from form-data', { error: error.message, executionTime: `${end - start}ms` });
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 913,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error parsing JSON data from form-data'
//       }
//     });
//   }

//   const {
//     PatientMiddleName,
//     HospitalGroupIDR,
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
//     Language
//   } = patientData;

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
//       HospitalGroupIDR,
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
//       Language
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









exports.updatePatient = async (req, res) => {
  const start = Date.now(); 
  const { id } = req.params;
  const updates = req.body;

  try {
    const patient = await PatientMaster.findByPk(id);
    if (!patient) {
      const end = Date.now(); // Capture end time
      logger.warn(`Patient with ID ${id} not found`, { executionTime: `${end - start}ms` });

      logger.warn(`Patient with ID ${id} not found`);
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 975
        },
        error: {
          message: 'Patient not found'
        }
      });
    }

    await PatientMaster.update(updates, { where: { PatientID: id } });
    const updatedPatient = await PatientMaster.findByPk(id);
    const end = Date.now(); 
    logger.info(`Updated patient with ID ${id} successfully`);
    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: updatedPatient
    });
  } catch (error) {
    logger.error('Error updating patient', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 976
      },
      error: {
        message: 'Error updating patient: ' + error.message
      }
    });
  }
};                     

// Delete a patient
exports.deletePatient = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  try {
    const patient = await PatientMaster.findByPk(id);
    if (!patient) {
      const end = Date.now();
      logger.warn(`Patient with ID ${id} not found`, { executionTime: `${end - start}ms` });
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 977,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Patient not found'
        }
      });
    }

    await PatientMaster.destroy({ where: { PatientID: id } });
    const end = Date.now();
    logger.info(`Deleted patient with ID ${id} successfully`);
    res.status(200).json({
      meta: {
        statusCode: 200,
          executionTime: `${end - start}ms`
      },
      data: { message: 'Patient deleted successfully' }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error deleting patient', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 978,
            executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error deleting patient: ' + error.message
      }
    });
  }
};

// // Get patients by HospitalGroup ID
// exports.getPatientsByHospitalGroupID = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const hospitalGroup = await HospitalGroup.findByPk(id, {
//       include: {
//         model: Hospital,
//         include: {
//           model: PatientMaster
//         }
//       }
//     });

//     if (!hospitalGroup) {
//       logger.warn(`HospitalGroup with ID ${id} not found`);
//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 979
//         },
//         error: {
//           message: 'HospitalGroup not found'
//         }
//       });
//     }

//     const patients = hospitalGroup.Hospitals.flatMap(hospital => hospital.Patient_masters);

//     res.status(200).json({
//       meta: {
//         statusCode: 200
//       },
//       data: patients
//     });
//   } catch (error) {
//     logger.error('Error fetching patients by HospitalGroupID', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 980
//       },
//       error: {
//         message: 'Error fetching patients: ' + error.message
//       }
//     });
//   }
// };

// controllers/patientController.js
 // Adjust the path as per your project structure

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
      where: { HospitalGroupID: id },
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
    const end = Date.now(); // Capture end time
    logger.info(`Retrieved patients for HospitalGroupID ${id} with pagination in ${end - start}ms`);
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
    const end = Date.now(); // Capture end time
    logger.error('Error fetching patients by HospitalGroupID', { error: error.message, executionTime: `${end - start}ms` });
    console.error('Error fetching patients by HospitalGroupID', error);
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 980,
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
    logger.info(`Retrieved patients for page ${page} with limit ${limit} successfully`);

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
    logger.error('Error retrieving patients with pagination', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 981,
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
          res.status(200).json({ message: 'No patients found' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

