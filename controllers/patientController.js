const PatientMaster = require('../models/PatientMaster');
const HospitalGroup = require('../models/HospitalGroup');
const Hospital = require('../models/HospitalModel');
const logger = require('../logger');

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await PatientMaster.findAll();
    logger.info('Retrieved all patients successfully');
    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: patients
    });
  } catch (error) {
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
  const { id } = req.params;
  try {
    const patient = await PatientMaster.findByPk(id);
    if (!patient) {
      logger.warn(`Patient with ID ${id} not found`);
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 972
        },
        error: {
          message: 'Patient not found'
        }
      });
    }
    logger.info(`Retrieved patient with ID ${id} successfully`);
    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: patient
    });
  } catch (error) {
    logger.error('Error retrieving patient', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 973
      },
      error: {
        message: 'Error retrieving patient: ' + error.message
      }
    });
  }
};

// Create a new patient
exports.createPatient = async (req, res) => {
  const {
    PatientName,
    EMRNumber,
    HospitalGroupID,
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
  } = req.body;

  try {
    const newPatient = await PatientMaster.create({
      PatientName,
      EMRNumber,
      HospitalGroupID,
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

    logger.info(`Created new patient with ID ${newPatient.PatientID}`);
    res.status(201).json({
      meta: {
        statusCode: 201
      },
      data: newPatient
    });
  } catch (error) {
    logger.error('Error creating patient', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 974
      },
      error: {
        message: 'Error creating patient: ' + error.message
      }
    });
  }
};

// Update an existing patient
exports.updatePatient = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const patient = await PatientMaster.findByPk(id);
    if (!patient) {
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
  const { id } = req.params;
  try {
    const patient = await PatientMaster.findByPk(id);
    if (!patient) {
      logger.warn(`Patient with ID ${id} not found`);
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 977
        },
        error: {
          message: 'Patient not found'
        }
      });
    }

    await PatientMaster.destroy({ where: { PatientID: id } });
    logger.info(`Deleted patient with ID ${id} successfully`);
    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: { message: 'Patient deleted successfully' }
    });
  } catch (error) {
    logger.error('Error deleting patient', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 978
      },
      error: {
        message: 'Error deleting patient: ' + error.message
      }
    });
  }
};

// Get patients by HospitalGroup ID
exports.getPatientsByHospitalGroupID = async (req, res) => {
  const { id } = req.params;

  try {
    const hospitalGroup = await HospitalGroup.findByPk(id, {
      include: {
        model: Hospital,
        include: {
          model: PatientMaster
        }
      }
    });

    if (!hospitalGroup) {
      logger.warn(`HospitalGroup with ID ${id} not found`);
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 979
        },
        error: {
          message: 'HospitalGroup not found'
        }
      });
    }

    const patients = hospitalGroup.Hospitals.flatMap(hospital => hospital.Patient_masters);

    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: patients
    });
  } catch (error) {
    logger.error('Error fetching patients by HospitalGroupID', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 980
      },
      error: {
        message: 'Error fetching patients: ' + error.message
      }
    });
  }
};

exports.getAllPatientsByPagination = async (req, res) => {
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

    logger.info(`Retrieved patients for page ${page} with limit ${limit} successfully`);

    res.status(200).json({
      meta: {
        statusCode: 200,
        totalCount,
        page,
        limit
      },
      data: patients
    });
  } catch (error) {
    logger.error('Error retrieving patients with pagination', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 981
      },
      error: {
        message: 'Error retrieving patients with pagination: ' + error.message
      }
    });
  }
};
