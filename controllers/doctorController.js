const DoctorMaster = require('../models/doctorMaster');
const logger = require('../logger'); // Adjust path as needed
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const requestIp = require('request-ip');

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', {  erroerCode: 1056 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

const logExecutionTime = (start, end, functionName) => {
  const executionTime = end - start;
  logger.info(`Execution time for ${functionName}: ${executionTime}ms`);
};

// Get Doctor by ID
// Get all doctors
exports.getAllDoctors = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    const doctors = await DoctorMaster.findAll();

    const end = Date.now();
    const executionTime = `${end - start}ms`;
   
  
    // Log the warning
    logger.logWithMeta("warn", `Fetched all doctors successfully`, {
  
      statusCode:200,
      executionTime,
      hospitalId: req.hospitalId,
      
  
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    // logger.info('Fetched all doctors successfully');
    res.status(200).json({
      meta: { statusCode: 200 },
      data: doctors
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1057;
    const statusCode = 500;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching doctors:`, {
      errorCode,
      statusCode,
    
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error fetching doctors: ,errorCode: ${errorCode}`, { error });
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1057 },
      error: { message: 'Failed to fetch doctors due to a server error.' }
    });
  }
};
// exports.getAllDoctors = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);

//   // Extract the startDate and endDate from the request query
//   const { startDate, endDate } = req.query;

//   try {
//     const DoctorMaster = require('../models/doctorMaster')(req.sequelize);

//     // Build where clause for filtering doctors by date range
//     let whereClause = {};
    
//     if (startDate || endDate) {
//       whereClause.createdAt = {}; // Assuming we are filtering based on creation date
//       if (startDate) {
//         const start = new Date(startDate);
//         if (isNaN(start)) {
//           throw new Error("Invalid start date format");
//         }
//         whereClause.createdAt[Op.gte] = start; // Filter doctors created on or after startDate
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         if (isNaN(end)) {
//           throw new Error("Invalid end date format");
//         }
//         whereClause.createdAt[Op.lte] = end; // Filter doctors created on or before endDate
//       }
//     }

//     // Query the DoctorMaster model with the optional date filter
//     const doctors = await DoctorMaster.findAll({
//       where: whereClause
//     });

//     const end = Date.now();
//     const executionTime = `${end - start}ms`;

//     // Log the success
//     logger.logWithMeta("warn", `Fetched all doctors successfully`, {
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,       // HTTP method
//       userAgent: req.headers['user-agent'],
//     });

//     res.status(200).json({
//       meta: { statusCode: 200 },
//       data: doctors
//     });
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 1057;

//     // Log the error
//     logger.logWithMeta("warn", `Error fetching doctors: `, {
//       errorCode,
//     
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,       // HTTP method
//       userAgent: req.headers['user-agent'],
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 1057 },
//       error: { message: 'Failed to fetch doctors due to a server error.' }
//     });
//   }
// };
// Get doctor by ID
exports.getDoctorById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const doctorId = req.params.id; // Assuming you pass the ID in the URL

  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    const doctor = await DoctorMaster.findByPk(doctorId);

    if (!doctor) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1058;
      const statusCode = 404;

      // Log the warning for not found
      logger.logWithMeta("warn", `Doctor not found:`, {
        errorCode,
        statusCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      return res.status(404).json({
        meta: { statusCode, errorCode },
        error: { message: 'Doctor not found' }
      });
    }

    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const statusCode = 200;

    // Log success for found doctor
    logger.logWithMeta("info", `Fetched doctor with ID: ${doctorId} successfully`, {
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });

    res.status(statusCode).json({
      meta: { statusCode },
      data: doctor
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1059;
    const statusCode = 500;

    // Log server error
    logger.logWithMeta("error", `Error fetching doctor by ID:`, {
      errorCode,
      statusCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
      error: error.message,
    });

    res.status(statusCode).json({
      meta: { statusCode, errorCode },
      error: { message: 'Failed to fetch doctor due to a server error.' }
    });
  }
};


// exports.getDoctorById = async (req, res) => {
//   const { id } = req.params;
//   const start = Date.now(); // Start time for execution logging
//   try {
//     const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
//     const Skill = require('../models/skillMaster')(req.sequelize);

//     const doctor = await DoctorMaster.findByPk(id, {
//       include: [
//         {
//           model: Skill,
//           attributes: ['SpecialtyId', 'SkillName'], // Adjust attributes as needed
//           as: 'specialty' // Ensure this matches the alias in the association
//         }
//       ]
//     });

//     if (!doctor) {
//       logger.warn(`Doctor with ID ${id} not found`);
//       return res.status(404).json({
//         meta: { statusCode: 404, errorCode: 1053 },
//         error: { message: `Doctor with ID ${id} not found. Please check the ID and try again.` }
//       });
//     }

//     logger.info(`Fetched doctor with ID ${id} successfully`);
//     const end = Date.now(); // End time for execution logging
//     res.json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: doctor
//     });
//   } catch (error) {
//     logger.error(`Error fetching doctor with ID ${id}: `);
//     const end = Date.now(); // End time for execution logging
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 1054,
//         executionTime: `${end - start}ms`
//       },
//       error: { message: `Failed to fetch doctor with ID ${id} due to a server error. Please try again later.` }
//     });
//   } finally {
//     logExecutionTime(start, Date.now(), 'getDoctorById'); // Log execution time
//   }
// };

// POST create a new doctor
// exports.createDoctor = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now(); 
//       logger.info('Validation errors occurred', errors);
//       return res.status(400).json({
//           meta: {
//               statusCode: 400,
//               errorCode: 1055,
//               // executionTime: `${end - start}ms`
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
//   const { FirstName, MiddleName, LastName, Qualification, Specialization, Email, Address, WhatsAppNumber, MobileNumber, DateOfBirth, Gender, LicenseNumber, YearsOfExperience, CreatedBy , Reserve1, Reserve2, Reserve3, Reserve4} = req.body;
//   const HospitalID = req.hospitalId;
//   console.log("HospitalID*******",HospitalID)
//   // const HospitalGroupIDR = req.body;


//   try {
//     const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
//     await DoctorMaster.sync();
//     const newDoctor = await DoctorMaster.create({
//       FirstName,
//       MiddleName,
//       LastName,
//       Qualification,
//       Specialization,
//       Email,
//       Address,
//       WhatsAppNumber,
//       MobileNumber,
//       DateOfBirth,
//       Gender,
//       LicenseNumber,
//       YearsOfExperience,
//       HospitalID, Reserve1, Reserve2, Reserve3, Reserve4,
      
//       IsActive: true,
//       CreatedBy
//     });
//     logger.info('Created new doctor successfully');
//     res.status(200).json({
//       meta: { statusCode: 200 },
//       data: newDoctor
//     });
//   } catch (error) {
//     logger.error(`Error creating doctor: `);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 1056 },
//       error: { message: 'Failed to create doctor due to a server error. Please ensure all fields are correctly filled and try again.' }
//     });
//   }
// };



exports.createDoctor = async (req, res) => {
  const start = Date.now();
  const errors = validationResult(req);
  const clientIp = await getClientIp(req);
  const token = req.headers["accesstoken"];

  // Check for access token
  if (!token) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1060;
    const statusCode = 401;

    logger.logWithMeta("warn", `No access token provided`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(401).json({
      meta: { statusCode, errorCode, executionTime },
      error: { message: "Access token is required" },
    });
  }

  // Check for validation errors
  if (!errors.isEmpty()) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1061;
    const statusCode = 400;

    logger.logWithMeta("warn", `Validation errors occurred`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(400).json({
      meta: { statusCode, errorCode },
      error: {
        message: "Validation errors occurred",
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { 
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
    //  Reserve1, 
    //  Reserve2,
    //   Reserve3,
    //    Reserve4 
  } = req.body;

  const parsedQualification = parseInt(Qualification, 10);
  const parsedGender = parseInt(Gender, 10);
  const HospitalID = req.hospitalId;
  const CreatedBy = req.userId;

  try {
    // Decode the token
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    logger.info("Decoded token:", decoded);

    // Dynamically require the DoctorMaster model
    const DoctorMaster = require("../models/doctorMaster")(req.sequelize);
    const Skill = require("../models/skillMaster")(req.sequelize);

    // Check if the Specialization exists in the Skill table
    const specializationExists = await Skill.findOne({
      where: { SpecialtyId: Specialization },
    });

    if (!specializationExists) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1062;
      const statusCode = 400;

      logger.logWithMeta("warn", `Specialization not found`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        statusCode,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(400).json({
        meta: { statusCode, errorCode, executionTime },
        error: { message: "Invalid Specialization provided. Please provide a valid specialization." },
      });
    }

    // Create the new doctor
    const newDoctor = await DoctorMaster.create({
      FirstName, MiddleName, LastName, Qualification: parsedQualification,
      Specialization, Email, Address, WhatsAppNumber, MobileNumber, DateOfBirth,
      Gender: parsedGender, LicenseNumber, YearsOfExperience, HospitalID,
      // Reserve1, Reserve2, Reserve3, Reserve4,
       IsActive: true, CreatedBy
    });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", `Created new doctor successfully`, {
      statusCode: 200,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      meta: { statusCode: 200 },
      data: newDoctor,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;

    if (error.name === "SequelizeUniqueConstraintError") {
      const errorCode = 1063;
      const statusCode = 400;

      logger.logWithMeta("warn", `Unique constraint error while creating doctor`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        statusCode,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
      });

      return res.status(400).json({
        meta: { statusCode, errorCode },
        error: { message: "A doctor with this Email, Mobile Number, or License Number already exists." },
      });
    }

    // General server error
    const errorCode = 1064;
    const statusCode = 500;

    logger.logWithMeta("error", `Error creating doctor`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    return res.status(500).json({
      meta: { statusCode, errorCode },
      error: { message: "Failed to create doctor due to a server error. Please ensure all fields are correctly filled and try again." },
    });
  }
};

// PUT update an existing doctor
exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { FirstName, MiddleName, LastName, Qualification, Specialization, Email, Address, WhatsAppNumber, MobileNumber, DateOfBirth, Gender, LicenseNumber, YearsOfExperience, EditedBy, HospitalID, HospitalGroupIDR, IsActive } = req.body;

  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    let doctor = await DoctorMaster.findByPk(id);
    if (!doctor) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1065;
      const statusCode = 404;
    
      // Log the warning
      logger.logWithMeta("warn", `Doctor with ID ${id} not found`, {
        errorCode,
      
        executionTime,
        hospitalId: req.hospitalId,
        statusCode,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
    
      // logger.warn(`Doctor with ID ${id} not found, errorCode: ${errorCode}`);
      return res.status(404).json({
          meta: { statusCode: 404, errorCode },
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
    const end = Date.now();
    const executionTime = `${end - start}ms`;
   
  
    // Log the warning
    logger.logWithMeta("warn", `Updated doctor with ID ${id} successfully`, {
  
      statusCode:200,
      executionTime,
      hospitalId: req.hospitalId,
      
  
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    // logger.info(`Updated doctor with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: doctor
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1066;
    const statusCode = 500;
  
    // Log the warning
    logger.logWithMeta("warn", `Error updating doctor with ID ${id}`, {
      errorCode,
    
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error updating doctor with ID ${id}: , errorCode: ${errorCode}`);
    res.status(500).json({
        meta: { statusCode: 500, errorCode },
        error: { message: `Failed to update doctor with ID ${id} due to a server error. Please try again later.` }
    });
}

};

// DELETE delete a doctor
exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;
  const start = Date.now();
  const clientIp = await getClientIp(req);

  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    const doctor = await DoctorMaster.findByPk(id);
    if (!doctor) {
      const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1067;
    const statusCode = 404;
  
    // Log the warning
    logger.logWithMeta("warn", `Doctor with ID ${id} not found`, {
      errorCode,
    
      executionTime,
      hospitalId: req.hospitalId,
  
      statusCode,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
      // logger.warn(`Doctor with ID ${id} not found, errorCode: ${errorCode}`);
      return res.status(404).json({
          meta: { statusCode: 404, errorCode },
          error: { message: `Doctor with ID ${id} not found. Please check the ID and try again.` }
      });
  }
  
    await doctor.destroy();
    const end = Date.now();
    const executionTime = `${end - start}ms`;
   
  
    // Log the warning
    logger.logWithMeta("warn", `Deleted doctor with ID ${id} successfully`, {
  
      statusCode:200,
      executionTime,
      hospitalId: req.hospitalId,
      
  
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    // logger.info(`Deleted doctor with ID ${id} successfully`);
    res.json({
      meta: { statusCode: 200 },
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1068;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error deleting doctor with ID ${id}:`, {
      errorCode,
    
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error deleting doctor with ID ${id}: , errorCode: ${errorCode}`);
    res.status(500).json({
        meta: { statusCode: 500, errorCode },
        error: { message: `Failed to delete doctor with ID ${id} due to a server error. Please try again later.` }
    });
}

};

// GET doctors by HospitalID
exports.getDoctorsByHospitalId = async (req, res) => {
  const { hospitalId } = req.params;
  const start = Date.now();
  const clientIp = await getClientIp(req);
  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    const doctors = await DoctorMaster.findAll({ where: { HospitalID: hospitalId } });
    if (!doctors.length) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1069;
      const statusCode = 404;
    
      // Log the warning
      logger.logWithMeta("warn", `No doctors found for HospitalID ${id}:`, {
        errorCode,
      
        executionTime,
        hospitalId: req.hospitalId,
        statusCode,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.warn(`No doctors found for HospitalID ${hospitalId}, errorCode: ${errorCode}`);
      return res.status(404).json({
          meta: { statusCode: 404, errorCode },
          error: { message: `No doctors found for HospitalID ${hospitalId}. Please check the ID and try again.` }
      });
  }

  const end = Date.now();
  const executionTime = `${end - start}ms`;
 

  // Log the warning
  logger.logWithMeta("warn", `Fetched doctors for HospitalID ${hospitalId} successfully`, {

    statusCode:200,
    executionTime,
    hospitalId: req.hospitalId,
    

    ip: clientIp,
    apiName: req.originalUrl, // API name
    method: req.method   ,  
    userAgent: req.headers['user-agent'],    // HTTP method
  });
  
    // logger.info(`Fetched doctors for HospitalID ${hospitalId} successfully`);
    res.json({
      meta: { statusCode: 200 },
      data: doctors
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1070;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error fetching doctors for HospitalID ${hospitalId}::`, {
      errorCode,
    
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error fetching doctors for HospitalID ${hospitalId}: ,errorCode: ${errorCode}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1070 },
      error: { message: `Failed to fetch doctors for HospitalID ${hospitalId} due to a server error. Please try again later.` }
    });
  }
};




// GET paginated doctors
exports.getPaginatedDoctors = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default values if not provided
  const offset = (page - 1) * limit;
  const clientIp = await getClientIp(req);
  const start = Date.now();

  try {
    const DoctorMaster = require('../models/doctorMaster')(req.sequelize);
    const { count, rows } = await DoctorMaster.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);
    const end = Date.now();
    const executionTime = `${end - start}ms`;
   

    // Log the warning
    logger.logWithMeta("warn", `Fetched page ${page} of doctors successfully`, {

      statusCode:200,
      executionTime,
      hospitalId: req.hospitalId,
      

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    // logger.info(`Fetched page ${page} of doctors successfully`);
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
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1071;
    const statusCode = 500;
    // Log the warning
    logger.logWithMeta("warn", `Error fetching paginated doctors::`, {
      errorCode,
    
      executionTime,
      hospitalId: req.hospitalId,
      statusCode,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error(`Error fetching paginated doctors: ,errorCode: ${errorCode}`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1071 },
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
//     logger.error(`Error fetching doctors for HospitalGroupIDR ${hospitalGroupId}: `);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 995 },
//       error: { message: `Failed to fetch doctors for HospitalGroupIDR ${hospitalGroupId} due to a server error. Please try again later.` }
//     });
//   }
// };
