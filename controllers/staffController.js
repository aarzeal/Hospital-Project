// const StaffMaster = require('../models/staffMaster');
// const logger = require('../logger'); // Adjust path as needed

// // GET all staff
// exports.getAllStaff = async (req, res) => {
//   try {
//     const StaffMaster = require('../models/staffMaster')(req.sequelize);
//     const staff = await StaffMaster.findAll();
//     logger.info('Fetched all staff successfully');
//     res.json({
//       meta: { statusCode: 200 },
//       data: staff
//     });
//   } catch (error) {
//     logger.error(`Error fetching staff: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 992 },
//       error: { message: 'Failed to fetch staff due to a server error. Please try again later.' }
//     });
//   }
// };

// // GET single staff by ID
// exports.getStaffById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const StaffMaster = require('../models/staffMaster')(req.sequelize);
//     const staff = await StaffMaster.findByPk(id);
//     if (!staff) {
//       logger.warn(`Staff with ID ${id} not found`);
//       return res.status(404).json({
//         meta: { statusCode: 404, errorCode: 993 },
//         error: { message: `Staff with ID ${id} not found. Please check the ID and try again.` }
//       });
//     }
//     logger.info(`Fetched staff with ID ${id} successfully`);
//     res.json({
//       meta: { statusCode: 200 },
//       data: staff
//     });
//   } catch (error) {
//     logger.error(`Error fetching staff with ID ${id}: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 994 },
//       error: { message: `Failed to fetch staff with ID ${id} due to a server error. Please try again later.` }
//     });
//   }
// };

// // POST create a new staff
// // exports.createStaff = async (req, res) => {
// //   const { FirstName, MiddleName, LastName, Email, Address, Age, DOB, BloodGroup, Gender, EmergencyContactName, EmergencyContactPhone, MaritalStatus, Nationality, Language, MobileNumber, Qualification, Experience, Specialization, WhatsAppNumber, CreatedBy } = req.body;
// //   const HospitalIDR = req.hospitalId;
// //   // const HospitalGroupIDR = req.hospitalGroupIDR;

// //   try {
// //     const StaffMaster = require('../models/staffMaster')(req.sequelize);

// //     // Ensure the table exists
// //    await StaffMaster.sync();



// //     const newStaff = await StaffMaster.create({
// //       FirstName,
// //       MiddleName,
// //       LastName,
// //       Email,
// //       Address,
// //       Age,
// //       DOB,
// //       BloodGroup,
// //       Gender,
// //       EmergencyContactName,
// //       EmergencyContactPhone,
// //       MaritalStatus,
// //       Nationality,
// //       Language,
// //       MobileNumber,
// //       Qualification,
// //       Experience,
// //       Specialization,
// //       WhatsAppNumber,
// //       HospitalIDR,
// //       // HospitalGroupIDR: req.hospitalGroupIDR,
// //       IsActive: true,
// //       CreatedBy
// //     });
// //     logger.info('Created new staff successfully');
// //     res.status(201).json({
// //       meta: { statusCode: 201 },
// //       data: newStaff
// //     });
// //   } catch (error) {
// //     logger.error(`Error creating staff: ${error.message}`);
// //     res.status(500).json({
// //       meta: { statusCode: 500, errorCode: 995 },
// //       error: { message: 'Failed to create staff due to a server error. Please ensure all fields are correctly filled and try again.' }
// //     });
// //   }
// // };

// exports.createStaff = async (req, res) => {
//   const { FirstName, MiddleName, LastName, Email, Address, Age, DOB, BloodGroup, Gender, EmergencyContactName, EmergencyContactPhone, MaritalStatus, Nationality, Language, MobileNumber, Qualification, Experience, Specialization, WhatsAppNumber, CreatedBy } = req.body;
//   const HospitalIDR = req.hospitalId;

//   try {
//     const StaffMaster = require('../models/staffMaster')(req.sequelize);

//     // Ensure the table exists
    
//     await StaffMaster.sync();

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
//       IsActive: true,
//       CreatedBy
//     });

//     logger.info('Created new staff successfully');
//     res.status(201).json({
//       meta: { statusCode: 201 },
//       data: newStaff
//     });
//   } catch (error) {
//     if (error.name === 'SequelizeValidationError') {
//       // Handle validation errors
//       logger.error('Validation error creating staff:', error.errors);
//       res.status(400).json({
//         meta: { statusCode: 400, errorCode: 996 },
//         error: { message: error.message }
//       });
//     } else {
//       // Handle other Sequelize errors or generic server errors
//       logger.error(`Error creating staff: ${error.message}`);
//       res.status(500).json({
//         meta: { statusCode: 500, errorCode: 995 },
//         error: { message: 'Failed to create staff due to a server error. Please try again later.' }
//       });
//     }
//   }
// };


// // PUT update an existing staff
// exports.updateStaff = async (req, res) => {
//   const { id } = req.params;
//   const { FirstName, MiddleName, LastName, Email, Address, Age, DOB, BloodGroup, Gender, EmergencyContactName, EmergencyContactPhone, MaritalStatus, Nationality, Language, MobileNumber, Qualification, Experience, Specialization, WhatsAppNumber, EditedBy, HospitalIDR, HospitalGroupIDR, IsActive } = req.body;

//   try {
//     const StaffMaster = require('../models/staffMaster')(req.sequelize);
//     let staff = await StaffMaster.findByPk(id);
//     if (!staff) {
//       logger.warn(`Staff with ID ${id} not found`);
//       return res.status(404).json({
//         meta: { statusCode: 404, errorCode: 996 },
//         error: { message: `Staff with ID ${id} not found. Please check the ID and try again.` }
//       });
//     }
//     staff = await staff.update({
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
//       HospitalGroupIDR,
//       IsActive,
//       EditedBy
//     });
//     logger.info(`Updated staff with ID ${id} successfully`);
//     res.json({
//       meta: { statusCode: 200 },
//       data: staff
//     });
//   } catch (error) {
//     logger.error(`Error updating staff with ID ${id}: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 997 },
//       error: { message: `Failed to update staff with ID ${id} due to a server error. Please try again later.` }
//     });
//   }
// };

// // DELETE delete a staff
// exports.deleteStaff = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const StaffMaster = require('../models/staffMaster')(req.sequelize);
//     const staff = await StaffMaster.findByPk(id);
//     if (!staff) {
//       logger.warn(`Staff with ID ${id} not found`);
//       return res.status(404).json({
//         meta: { statusCode: 404, errorCode: 998 },
//         error: { message: `Staff with ID ${id} not found. Please check the ID and try again.` }
//       });
//     }
//     await staff.destroy();
//     logger.info(`Deleted staff with ID ${id} successfully`);
//     res.json({
//       meta: { statusCode: 200 },
//       message: 'Staff deleted successfully'
//     });
//   } catch (error) {
//     logger.error(`Error deleting staff with ID ${id}: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 999 },
//       error: { message: `Failed to delete staff with ID ${id} due to a server error. Please try again later.` }
//     });
//   }
// };


// // GET staff by HospitalIDR
// exports.getStaffByHospitalIDR = async (req, res) => {
//   const { hospitalId } = req.params;
//   try {
//     const StaffMaster = require('../models/staffMaster')(req.sequelize);
//     const staff = await StaffMaster.findAll({ where: { HospitalIDR: hospitalId } });
//     if (!staff.length) {
//       logger.warn(`No staff found for HospitalIDR ${hospitalId}`);
//       return res.status(404).json({
//         meta: { statusCode: 404, errorCode: 1000 },
//         error: { message: `No staff found for HospitalIDR ${hospitalId}. Please check the ID and try again.` }
//       });
//     }
//     logger.info(`Fetched staff for HospitalIDR ${hospitalId} successfully`);
//     res.json({
//       meta: { statusCode: 200 },
//       data: staff
//     });
//   } catch (error) {
//     logger.error(`Error fetching staff for HospitalIDR ${hospitalId}: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 1001 },
//       error: { message: `Failed to fetch staff for HospitalIDR ${hospitalId} due to a server error. Please try again later.` }
//     });
//   }
// };

// // GET staff by HospitalGroupIDR
// exports.getStaffByHospitalGroupId = async (req, res) => {
//   const { hospitalGroupId } = req.params;
//   try {
//     const staff = await StaffMaster.findAll({ where: { HospitalGroupIDR: hospitalGroupId } });
//     if (!staff.length) {
//       logger.warn(`No staff found for HospitalGroupIDR ${hospitalGroupId}`);
//       return res.status(404).json({
//         meta: { statusCode: 404, errorCode: 1002 },
//         error: { message: `No staff found for HospitalGroupIDR ${hospitalGroupId}. Please check the ID and try again.` }
//       });
//     }
//     logger.info(`Fetched staff for HospitalGroupIDR ${hospitalGroupId} successfully`);
//     res.json({
//       meta: { statusCode: 200 },
//       data: staff
//     });
//   } catch (error) {
//     logger.error(`Error fetching staff for HospitalGroupIDR ${hospitalGroupId}: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 1003 },
//       error: { message: `Failed to fetch staff for HospitalGroupIDR ${hospitalGroupId} due to a server error. Please try again later.` }
//     });
//   }
// };



const StaffMaster = require('../models/staffMaster');
const logger = require('../logger'); // Adjust path as needed

const logExecutionTime = (start, end, functionName) => {
  const duration = end - start;
  logger.info(`${functionName} executed in ${duration}ms`);
};

// GET all staff
exports.getAllStaff = async (req, res) => {
  const start = Date.now();
  try {
    const StaffMaster = require('../models/staffMaster')(req.sequelize);
    const staff = await StaffMaster.findAll();
    logger.info('Fetched all staff successfully');
    const end = Date.now(); 
    res.json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      data: staff
    });
  } catch (error) {
    logger.error(`Error fetching staff: ${error.message}`);
    const end = Date.now(); 
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1001, executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch staff due to a server error. Please try again later.' }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'getAllStaff');
  }
};

// GET single staff by ID
exports.getStaffById = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  try {
    const StaffMaster = require('../models/staffMaster')(req.sequelize);
    const staff = await StaffMaster.findByPk(id);
    if (!staff) {
      logger.warn(`Staff with ID ${id} not found`);
      const end = Date.now(); 
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1002 , executionTime: `${end - start}ms`},
        error: { message: `Staff with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    logger.info(`Fetched staff with ID ${id} successfully`);
    const end = Date.now(); 
    res.json({
      meta: { statusCode: 200 },
      data: staff
    });
  } catch (error) {
    logger.error(`Error fetching staff with ID ${id}: ${error.message}`);
    const end = Date.now(); 
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1003, executionTime: `${end - start}ms`

       },
      error: { message: `Failed to fetch staff with ID ${id} due to a server error. Please try again later.` }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'getStaffById');
  }
};

// POST create a new staff
exports.createStaff = async (req, res) => {
  const start = Date.now();
  
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
    const end = Date.now(); 
    res.status(200).json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      data: newStaff
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Handle validation errors
      logger.error('Validation error creating staff:', error.errors);
      const end = Date.now(); 
      res.status(400).json({
        meta: { statusCode: 400, errorCode: 1004, executionTime: `${end - start}ms`},
        error: { message: error.message }
      });
    } else {
      // Handle other Sequelize errors or generic server errors
      logger.error(`Error creating staff: ${error.message}`);
      const end = Date.now(); 
      res.status(500).json({
        meta: { statusCode: 500, errorCode: 1005, executionTime: `${end - start}ms` },
        error: { message: 'Failed to create staff due to a server error. Please try again later.' }
      });
    }
  } finally {
    logExecutionTime(start, Date.now(), 'createStaff');
  }
};

// PUT update an existing staff
exports.updateStaff = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const { FirstName, MiddleName, LastName, Email, Address, Age, DOB, BloodGroup, Gender, EmergencyContactName, EmergencyContactPhone, MaritalStatus, Nationality, Language, MobileNumber, Qualification, Experience, Specialization, WhatsAppNumber, EditedBy, HospitalIDR, HospitalGroupIDR, IsActive } = req.body;

  try {
    const StaffMaster = require('../models/staffMaster')(req.sequelize);
    let staff = await StaffMaster.findByPk(id);
    if (!staff) {
      const end = Date.now(); 
      logger.warn(`Staff with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1006 , executionTime: `${end - start}ms`},
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
      meta: { statusCode: 200 , executionTime: `${end - start}ms`},
      data: staff
    });
  } catch (error) {
    const end = Date.now(); 
    logger.error(`Error updating staff with ID ${id}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1007, executionTime: `${end - start}ms` },
      error: { message: `Failed to update staff with ID ${id} due to a server error. Please try again later.` }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'updateStaff');
  }
};

// DELETE delete a staff
exports.deleteStaff = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;

  try {
    const StaffMaster = require('../models/staffMaster')(req.sequelize);
    const staff = await StaffMaster.findByPk(id);
    if (!staff) {
      const end = Date.now(); 
      logger.warn(`Staff with ID ${id} not found`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1008, executionTime: `${end - start}ms` },
        error: { message: `Staff with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    await staff.destroy();
    logger.info(`Deleted staff with ID ${id} successfully`);
    const end = Date.now(); 
    res.json({
      meta: { statusCode: 200 , executionTime: `${end - start}ms`},
      message: 'Staff deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting staff with ID ${id}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1009 , executionTime: `${end - start}ms`},
      error: { message: `Failed to delete staff with ID ${id} due to a server error. Please try again later.` }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'deleteStaff');
  }
};

// GET staff by HospitalIDR
exports.getStaffByHospitalIDR = async (req, res) => {
  const start = Date.now();
  const { hospitalId } = req.params;
  try {

    const StaffMaster = require('../models/staffMaster')(req.sequelize);
    const staff = await StaffMaster.findAll({ where: { HospitalIDR: hospitalId } });
    if (!staff.length) {
      const end = Date.now(); 
      logger.warn(`No staff found for HospitalIDR ${hospitalId}`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1010 , executionTime: `${end - start}ms`},
        error: { message: `No staff found for HospitalIDR ${hospitalId}. Please check the ID and try again.` }
      });
    }
    logger.info(`Fetched staff for HospitalIDR ${hospitalId} successfully`);
    res.json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      data: staff
    });
  } catch (error) {
    logger.error(`Error fetching staff for HospitalIDR ${hospitalId}: ${error.message}`);
    const end = Date.now(); 
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1011, executionTime: `${end - start}ms` },
      error: { message: `Failed to fetch staff for HospitalIDR ${hospitalId} due to a server error. Please try again later.` }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'getStaffByHospitalIDR');
  }
};

// GET staff by HospitalGroupIDR
exports.getPaginatedStaff = async (req, res) => {
  const start = Date.now();
  const { page = 1, pageSize = 10 } = req.query; // Default values for page and pageSize

  try {
    const StaffMaster = require('../models/staffMaster')(req.sequelize);
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows: staff } = await StaffMaster.findAndCountAll({
      offset,
      limit
    });

    if (!staff.length) {
      const end = Date.now(); 
      logger.warn('No staff found for the given page and page size');
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 1013, executionTime: `${end - start}ms` },
        error: { message: 'No staff found for the given page and page size. Please adjust your parameters and try again.' }
      });
    }

    logger.info(`Fetched staff for page ${page} with pageSize ${pageSize} successfully`);
    const end = Date.now(); 
    res.json({
      meta: { statusCode: 200 },
      data: {
        staff,
        pagination: {
          total: count,
          page,
          pageSize,
          totalPages: Math.ceil(count / pageSize)
        }
      }
    });
  } catch (error) {
    logger.error(`Error fetching staff for page ${page} with pageSize ${pageSize}: ${error.message}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1014, executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch staff due to a server error. Please try again later.' }
    });
  } finally {
    logExecutionTime(start, Date.now(), 'getPaginatedStaff');
  }
};



