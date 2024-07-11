const PatientMaster = require('../models/PatientMaster');
const HospitalGroup = require('../models/HospitalGroup');
const Hospital = require('../models/HospitalModel');
const logger = require('../logger');
const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');
// Get all patients
exports.getAllPatients = async (req, res) => {
  const start = Date.now();
  try {
    const patients = await PatientMaster.findAll();
    const end = Date.now(); 
    logger.info('Retrieved all patients successfully');
    logger.error('Error retrieving patients', { error: error.message, executionTime: `${end - start}ms` });
    res.status(200).json({
      meta: {
        statusCode: 200,
          executionTime: `${end - start}ms`
      },
      data: patients
    });
  } catch (error) {
    const end = Date.now(); 
    logger.error('Error retrieving patients', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 971
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

exports.createPatient = async (req, res) => {
  const start = Date.now();
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

  const {
    PatientName,
    EMRNumber,
    PatientFirstName,
    PatientLastName,
    HospitalGroupIDR,
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
    createdBy
  } = req.body;

  try {
    const newPatient = await PatientMaster.create({
      PatientName,
      EMRNumber,
      HospitalID: req.hospitalId,
      HospitalGroupIDR, // Ensure this is correctly set from the middleware
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
      createdBy
    });

    const end = Date.now();
    logger.info(`Created new patient with ID ${newPatient.PatientID} in ${end - start}ms`);
    res.status(201).json({
      meta: {
        statusCode: 201,
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
