const createDynamicConnection = require('../database/dynamicConnection');
const createPatientMasterModel = require('../models/paitentMaster');
const Hospital = require('../models/HospitalModel'); // Adjust the import path

const getPatientMasterModel = async (hospitalID) => {
  const hospital = await Hospital.findOne({ where: { HospitalID: hospitalID } });
  if (!hospital) throw new Error(`Hospital with ID ${hospitalID} not found`);

  const { sequelize, testConnection } = createDynamicConnection(hospital.HospitalDatabase);
  await testConnection();

  const PatientMaster = await createPatientMasterModel(sequelize);
  console.log(typeof PatientMaster); // Check the type of PatientMaster
  console.log(PatientMaster); // Log the actual value of PatientMaster

  return PatientMaster;
};

exports.createPatient = async (req, res) => {
  const { HospitalID, ...patientData } = req.body;
  try {
    const PatientMaster = await getPatientMasterModel(HospitalID);
    const patient = await PatientMaster.create(patientData);
    res.status(200).json({
      meta: {
        status: 200,
        errorCode: null
      },
      data: patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      meta: {
        status: 500,
        errorCode: 927
      },
      message: 'Error creating patient',
      error: error.message
    });
  }
};

exports.getPatients = async (req, res) => {
  const { HospitalID } = req.params;
  try {
    const PatientMaster = await getPatientMasterModel(HospitalID);
    const patients = await PatientMaster.findAll();
    res.status(200).json({
      meta: {
        status: 200,
        errorCode: null
      },
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      meta: {
        status: 500,
        errorCode: 928
      },
      message: 'Error retrieving patients',
      error: error.message
    });
  }
};

exports.getPatientById = async (req, res) => {
  const { HospitalID, id } = req.params;
  try {
    const PatientMaster = await getPatientMasterModel(HospitalID);
    const patient = await PatientMaster.findByPk(id);
    if (patient) {
      res.status(200).json({
        meta: {
          status: 200,
          errorCode: null
        },
        data: patient
      });
    } else {
      res.status(404).json({
        meta: {
          status: 404,
          errorCode: 929
        },
        message: 'Patient not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        status: 500,
        errorCode: 930
      },
      message: 'Error retrieving patient',
      error: error.message
    });
  }
};

exports.updatePatient = async (req, res) => {
  const { HospitalID, id } = req.params;
  const updatedData = req.body;
  try {
    const PatientMaster = await getPatientMasterModel(HospitalID);
    const [updatedRows] = await PatientMaster.update(updatedData, { where: { PatientID: id } });
    if (updatedRows) {
      res.status(200).json({
        meta: {
          status: 200,
          errorCode: null
        },
        message: 'Patient updated successfully'
      });
    } else {
      res.status(404).json({
        meta: {
          status: 404,
          errorCode: 931
        },
        message: 'Patient not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        status: 500,
        errorCode: 932
      },
      message: 'Error updating patient',
      error: error.message
    });
  }
};

exports.deletePatient = async (req, res) => {
  const { HospitalID, id } = req.params;
  try {
    const PatientMaster = await getPatientMasterModel(HospitalID);
    const deletedRows = await PatientMaster.destroy({ where: { PatientID: id } });
    if (deletedRows) {
      res.status(200).json({
        meta: {
          status: 200,
          errorCode: null
        },
        message: 'Patient deleted successfully'
      });
    } else {
      res.status(404).json({
        meta: {
          status: 404,
          errorCode: 933
        },
        message: 'Patient not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        status: 500,
        errorCode: 934
      },
      message: 'Error deleting patient',
      error: error.message
    });
  }
};
