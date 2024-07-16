const DoctorMaster = require('../models/doctorMaster');
const logger = require('../logger'); // Adjust path as needed
const { validationResult } = require('express-validator');

// GET all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    const doctors = await DoctorMaster.findAll();
    logger.info('Fetched all doctors successfully');
    res.json({
      meta: { statusCode: 200 },
      data: doctors
    });
  } catch (error) {
    logger.error(`Error fetching doctors: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 984 },
      error: { message: 'Failed to fetch doctors due to a server error. Please try again later.' }
    });
  }
};

// GET single doctor by ID
exports.getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    const doctor = await DoctorMaster.findByPk(id);
    if (!doctor) {
      logger.warn(`Doctor with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 985 },
        error: { message: `Doctor with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    logger.info(`Fetched doctor with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: doctor
    });
  } catch (error) {
    logger.error(`Error fetching doctor with ID ${id}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 986 },
      error: { message: `Failed to fetch doctor with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

// POST create a new doctor
exports.createDoctor = async (req, res) => {
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
  const { FirstName, MiddleName, LastName, Qualification, Specialization, Email, Address, WhatsAppNumber, MobileNumber, DateOfBirth, Gender, LicenseNumber, YearsOfExperience, CreatedBy , Reserve1, Reserve2, Reserve3, Reserve4} = req.body;
  const HospitalID = req.hospitalId;
  // const HospitalGroupIDR = req.body;


  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    await DoctorMaster.sync();
    const newDoctor = await DoctorMaster.create({
      FirstName,
      MiddleName,
      LastName,
      Qualification,
      Specialization,
      Email,
      Address,
      WhatsAppNumber,
      MobileNumber,
      DateOfBirth,
      Gender,
      LicenseNumber,
      YearsOfExperience,
      HospitalID, Reserve1, Reserve2, Reserve3, Reserve4,
      
      IsActive: true,
      CreatedBy
    });
    logger.info('Created new doctor successfully');
    res.status(201).json({
      meta: { statusCode: 201 },
      data: newDoctor
    });
  } catch (error) {
    logger.error(`Error creating doctor: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 987 },
      error: { message: 'Failed to create doctor due to a server error. Please ensure all fields are correctly filled and try again.' }
    });
  }
};

// PUT update an existing doctor
exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  const { FirstName, MiddleName, LastName, Qualification, Specialization, Email, Address, WhatsAppNumber, MobileNumber, DateOfBirth, Gender, LicenseNumber, YearsOfExperience, EditedBy, HospitalID, HospitalGroupIDR, IsActive } = req.body;

  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    let doctor = await DoctorMaster.findByPk(id);
    if (!doctor) {
      logger.warn(`Doctor with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 988 },
        error: { message: `Doctor with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    doctor = await doctor.update({
      FirstName,
      MiddleName,
      LastName,
      Qualification,
      Specialization,
      Email,
      Address,
      WhatsAppNumber,
      MobileNumber,
      DateOfBirth,
      Gender,
      LicenseNumber,
      YearsOfExperience,
      HospitalID,
      HospitalGroupIDR,
      IsActive,
      EditedBy
    });
    logger.info(`Updated doctor with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: doctor
    });
  } catch (error) {
    logger.error(`Error updating doctor with ID ${id}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 989 },
      error: { message: `Failed to update doctor with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

// DELETE delete a doctor
exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;

  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    const doctor = await DoctorMaster.findByPk(id);
    if (!doctor) {
      logger.warn(`Doctor with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 990 },
        error: { message: `Doctor with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    await doctor.destroy();
    logger.info(`Deleted doctor with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting doctor with ID ${id}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 991 },
      error: { message: `Failed to delete doctor with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

// GET doctors by HospitalID
exports.getDoctorsByHospitalId = async (req, res) => {
  const { hospitalId } = req.params;
  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    const doctors = await DoctorMaster.findAll({ where: { HospitalID: hospitalId } });
    if (!doctors.length) {
      logger.warn(`No doctors found for HospitalID ${hospitalId}`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 992 },
        error: { message: `No doctors found for HospitalID ${hospitalId}. Please check the ID and try again.` }
      });
    }
    logger.info(`Fetched doctors for HospitalID ${hospitalId} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: doctors
    });
  } catch (error) {
    logger.error(`Error fetching doctors for HospitalID ${hospitalId}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 993 },
      error: { message: `Failed to fetch doctors for HospitalID ${hospitalId} due to a server error. Please try again later.` }
    });
  }
};




// GET paginated doctors
exports.getPaginatedDoctors = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default values if not provided
  const offset = (page - 1) * limit;

  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    const { count, rows } = await DoctorMaster.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    logger.info(`Fetched page ${page} of doctors successfully`);
    res.json({
      meta: {
        statusCode: 200,
        currentPage: parseInt(page),
        totalPages,
        totalItems: count
      },
      data: rows
    });
  } catch (error) {
    logger.error(`Error fetching paginated doctors: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 996 },
      error: { message: 'Failed to fetch paginated doctors due to a server error. Please try again later.' }
    });
  }
};


// GET doctors by HospitalGroupIDR
// exports.getDoctorsByHospitalGroupId = async (req, res) => {
//   const { hospitalGroupId } = req.params;
//   try {
//     const doctors = await DoctorMaster.findAll({ where: { HospitalGroupIDR: hospitalGroupId } });
//     if (!doctors.length) {
//       logger.warn(`No doctors found for HospitalGroupIDR ${hospitalGroupId}`);
//       return res.status(404).json({
//         meta: { statusCode: 404, errorCode: 994 },
//         error: { message: `No doctors found for HospitalGroupIDR ${hospitalGroupId}. Please check the ID and try again.` }
//       });
//     }
//     logger.info(`Fetched doctors for HospitalGroupIDR ${hospitalGroupId} successfully`);
//     res.json({
//       meta: { statusCode: 200 },
//       data: doctors
//     });
//   } catch (error) {
//     logger.error(`Error fetching doctors for HospitalGroupIDR ${hospitalGroupId}: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 995 },
//       error: { message: `Failed to fetch doctors for HospitalGroupIDR ${hospitalGroupId} due to a server error. Please try again later.` }
//     });
//   }
// };
