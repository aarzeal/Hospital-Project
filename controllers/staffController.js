const StaffMaster = require('../models/staffMaster');
const logger = require('../logger'); // Adjust path as needed

// GET all staff
exports.getAllStaff = async (req, res) => {
  try {
    const StaffMaster = require('../models/staffMaster')(req.sequelize);
    const staff = await StaffMaster.findAll();
    logger.info('Fetched all staff successfully');
    res.json({
      meta: { statusCode: 200 },
      data: staff
    });
  } catch (error) {
    logger.error(`Error fetching staff: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 992 },
      error: { message: 'Failed to fetch staff due to a server error. Please try again later.' }
    });
  }
};

// GET single staff by ID
exports.getStaffById = async (req, res) => {
  const { id } = req.params;
  try {
    const StaffMaster = require('../models/staffMaster')(req.sequelize);
    const staff = await StaffMaster.findByPk(id);
    if (!staff) {
      logger.warn(`Staff with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 993 },
        error: { message: `Staff with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    logger.info(`Fetched staff with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: staff
    });
  } catch (error) {
    logger.error(`Error fetching staff with ID ${id}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 994 },
      error: { message: `Failed to fetch staff with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

// POST create a new staff
// exports.createStaff = async (req, res) => {
//   const { FirstName, MiddleName, LastName, Email, Address, Age, DOB, BloodGroup, Gender, EmergencyContactName, EmergencyContactPhone, MaritalStatus, Nationality, Language, MobileNumber, Qualification, Experience, Specialization, WhatsAppNumber, CreatedBy } = req.body;
//   const HospitalIDR = req.hospitalId;
//   // const HospitalGroupIDR = req.hospitalGroupIDR;

//   try {
//     const StaffMaster = require('../models/staffMaster')(req.sequelize);

//     // Ensure the table exists
//    await StaffMaster.sync();



//     const newStaff = await StaffMaster.create({
//       FirstName,
//       MiddleName,
//       LastName,
//       Email,
//       Address,
//       Age,
//       DOB,
//       BloodGroup,
//       Gender,
//       EmergencyContactName,
//       EmergencyContactPhone,
//       MaritalStatus,
//       Nationality,
//       Language,
//       MobileNumber,
//       Qualification,
//       Experience,
//       Specialization,
//       WhatsAppNumber,
//       HospitalIDR,
//       // HospitalGroupIDR: req.hospitalGroupIDR,
//       IsActive: true,
//       CreatedBy
//     });
//     logger.info('Created new staff successfully');
//     res.status(201).json({
//       meta: { statusCode: 201 },
//       data: newStaff
//     });
//   } catch (error) {
//     logger.error(`Error creating staff: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 995 },
//       error: { message: 'Failed to create staff due to a server error. Please ensure all fields are correctly filled and try again.' }
//     });
//   }
// };

exports.createStaff = async (req, res) => {
  const { FirstName, MiddleName, LastName, Email, Address, Age, DOB, BloodGroup, Gender, EmergencyContactName, EmergencyContactPhone, MaritalStatus, Nationality, Language, MobileNumber, Qualification, Experience, Specialization, WhatsAppNumber, CreatedBy } = req.body;
  const HospitalIDR = req.hospitalId;

  try {
    const StaffMaster = require('../models/staffMaster')(req.sequelize);

    // Ensure the table exists
    
    await StaffMaster.sync();

    const newStaff = await StaffMaster.create({
      FirstName,
      MiddleName,
      LastName,
      Email,
      Address,
      Age,
      DOB,
      BloodGroup,
      Gender,
      EmergencyContactName,
      EmergencyContactPhone,
      MaritalStatus,
      Nationality,
      Language,
      MobileNumber,
      Qualification,
      Experience,
      Specialization,
      WhatsAppNumber,
      HospitalIDR,
      IsActive: true,
      CreatedBy
    });

    logger.info('Created new staff successfully');
    res.status(201).json({
      meta: { statusCode: 201 },
      data: newStaff
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Handle validation errors
      logger.error('Validation error creating staff:', error.errors);
      res.status(400).json({
        meta: { statusCode: 400, errorCode: 996 },
        error: { message: error.message }
      });
    } else {
      // Handle other Sequelize errors or generic server errors
      logger.error(`Error creating staff: ${error.message}`);
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 995 },
        error: { message: 'Failed to create staff due to a server error. Please try again later.' }
      });
    }
  }
};


// PUT update an existing staff
exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  const { FirstName, MiddleName, LastName, Email, Address, Age, DOB, BloodGroup, Gender, EmergencyContactName, EmergencyContactPhone, MaritalStatus, Nationality, Language, MobileNumber, Qualification, Experience, Specialization, WhatsAppNumber, EditedBy, HospitalIDR, HospitalGroupIDR, IsActive } = req.body;

  try {
    const StaffMaster = require('../models/staffMaster')(req.sequelize);
    let staff = await StaffMaster.findByPk(id);
    if (!staff) {
      logger.warn(`Staff with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 996 },
        error: { message: `Staff with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    staff = await staff.update({
      FirstName,
      MiddleName,
      LastName,
      Email,
      Address,
      Age,
      DOB,
      BloodGroup,
      Gender,
      EmergencyContactName,
      EmergencyContactPhone,
      MaritalStatus,
      Nationality,
      Language,
      MobileNumber,
      Qualification,
      Experience,
      Specialization,
      WhatsAppNumber,
      HospitalIDR,
      HospitalGroupIDR,
      IsActive,
      EditedBy
    });
    logger.info(`Updated staff with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: staff
    });
  } catch (error) {
    logger.error(`Error updating staff with ID ${id}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 997 },
      error: { message: `Failed to update staff with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

// DELETE delete a staff
exports.deleteStaff = async (req, res) => {
  const { id } = req.params;

  try {
    const StaffMaster = require('../models/staffMaster')(req.sequelize);
    const staff = await StaffMaster.findByPk(id);
    if (!staff) {
      logger.warn(`Staff with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 998 },
        error: { message: `Staff with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    await staff.destroy();
    logger.info(`Deleted staff with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      message: 'Staff deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting staff with ID ${id}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 999 },
      error: { message: `Failed to delete staff with ID ${id} due to a server error. Please try again later.` }
    });
  }
};


// GET staff by HospitalIDR
exports.getStaffByHospitalIDR = async (req, res) => {
  const { hospitalId } = req.params;
  try {
    const StaffMaster = require('../models/staffMaster')(req.sequelize);
    const staff = await StaffMaster.findAll({ where: { HospitalIDR: hospitalId } });
    if (!staff.length) {
      logger.warn(`No staff found for HospitalIDR ${hospitalId}`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1000 },
        error: { message: `No staff found for HospitalIDR ${hospitalId}. Please check the ID and try again.` }
      });
    }
    logger.info(`Fetched staff for HospitalIDR ${hospitalId} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: staff
    });
  } catch (error) {
    logger.error(`Error fetching staff for HospitalIDR ${hospitalId}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1001 },
      error: { message: `Failed to fetch staff for HospitalIDR ${hospitalId} due to a server error. Please try again later.` }
    });
  }
};

// GET staff by HospitalGroupIDR
exports.getStaffByHospitalGroupId = async (req, res) => {
  const { hospitalGroupId } = req.params;
  try {
    const staff = await StaffMaster.findAll({ where: { HospitalGroupIDR: hospitalGroupId } });
    if (!staff.length) {
      logger.warn(`No staff found for HospitalGroupIDR ${hospitalGroupId}`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1002 },
        error: { message: `No staff found for HospitalGroupIDR ${hospitalGroupId}. Please check the ID and try again.` }
      });
    }
    logger.info(`Fetched staff for HospitalGroupIDR ${hospitalGroupId} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: staff
    });
  } catch (error) {
    logger.error(`Error fetching staff for HospitalGroupIDR ${hospitalGroupId}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1003 },
      error: { message: `Failed to fetch staff for HospitalGroupIDR ${hospitalGroupId} due to a server error. Please try again later.` }
    });
  }
};