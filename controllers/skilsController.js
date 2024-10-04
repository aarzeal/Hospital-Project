
// const Skill = require('../models/skillMaster');
// const logger = require('../logger'); // Adjust path as per your project structure
// // const Skill = require('../models/skillMaster')(req.sequelize);

// exports.getAllSkills = async (req, res) => {
//   try {
//     const Skill = require('../models/skillMaster')(req.sequelize);

//     const skills = await Skill.findAll();

//     logger.info('Fetched all skills successfully');
//     res.json({
//       meta: { statusCode: 200 },
//       data: skills
//     });
//   } catch (error) {
//     logger.error(`Error fetching skills: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 984 },
//       error: { message: 'Failed to fetch skills due to a server error. Please try again later.' }
//     });
//   }
// };

// // GET single skill by ID
// exports.getSkillById = async (req, res) => {
//   const { id } = req.params;
//   try {

//     const Skill = require('../models/skillMaster')(req.sequelize);
//     const skill = await Skill.findByPk(id);
    
//     // const skill = await Skill.findByPk(id);
//     if (!skill) {
//       logger.warn(`Skill with ID ${id} not found`);
//       return res.status(404).json({
//         meta: { statusCode: 404, errorCode: 985 },
//         error: { message: `Skill with ID ${id} not found. Please check the ID and try again.` }
//       });
//     }
//     logger.info(`Fetched skill with ID ${id} successfully`);
//     res.json({
//       meta: { statusCode: 200 },
//       data: skill
//     });
//   } catch (error) {
//     logger.error(`Error fetching skill with ID ${id}: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 986 },
//       error: { message: `Failed to fetch skill with ID ${id} due to a server error. Please try again later.` }
//     });
//   }
// };

// // POST create a new skill
// exports.createSkill = async (req, res) => {
//   const { SkillName, IsClinicalSkill, CreatedBy } = req.body;
//   const HospitalIDR = req.hospitalId; // Get the HospitalIDR from the decoded token

//   try {
//           const Skill = require('../models/skillMaster')(req.sequelize);

//           // Ensure the table exists
//          await Skill.sync();

//     const newSkill = await Skill.create({
//       SkillName,
//       IsClinicalSkill,
//       CreatedBy,
//       HospitalIDR
//     });
//     logger.info('Created new skill successfully');
//     res.status(201).json({
//       meta: { statusCode: 201 },
//       data: newSkill
//     });
//   } catch (error) {
//     logger.error(`Error creating skill: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 987 },
//       error: { message: 'Failed to create skill due to a server error. Please ensure all fields are correctly filled and try again.' }
//     });
//   }
// };



// // PUT update an existing skill

// exports.updateSkill = async (req, res) => {
//   const { id } = req.params;
//   const { SkillName, IsClinicalSkill, EditedBy, HospitalIDR } = req.body;

//   try {
//     const Skill = require('../models/skillMaster')(req.sequelize); // Adjust the path to your model
//     let skill = await Skill.findByPk(id); // Fetch skill by primary key

//     if (!skill) {
//       logger.warn(`Skill with ID ${id} not found`);
//       return res.status(404).json({
//         meta: { statusCode: 404, errorCode: 988 },
//         error: { message: `Skill with ID ${id} not found. Please check the ID and try again.` }
//       });
//     }

//     // Update the skill
//     skill = await skill.update({
//       SkillName,
//       IsClinicalSkill,
//       EditedBy,
//       HospitalIDR
//     });

//     logger.info(`Updated skill with ID ${id} successfully`);
//     res.json({
//       meta: { statusCode: 200 },
//       data: skill
//     });
//   } catch (error) {
//     logger.error(`Error updating skill with ID ${id}: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 989 },
//       error: { message: `Failed to update skill with ID ${id} due to a server error. Please try again later.` }
//     });
//   }
// };

// // DELETE delete a skill
// exports.deleteSkill = async (req, res) => {
//   const { id } = req.params;
//   try {

//     const Skill = require('../models/skillMaster')(req.sequelize);

//     const skill = await Skill.findByPk(id);
//     if (!skill) {
//       logger.warn(`Skill with ID ${id} not found`);
//       return res.status(404).json({
//         meta: { statusCode: 404, errorCode: 990 },
//         error: { message: `Skill with ID ${id} not found. Please check the ID and try again.` }
//       });
//     }
//     await skill.destroy();
//     logger.info(`Deleted skill with ID ${id} successfully`);
//     res.json({
//       meta: { statusCode: 200 },
//       message: 'Skill deleted successfully'
//     });
//   } catch (error) {
//     logger.error(`Error deleting skill with ID ${id}: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 991 },
//       error: { message: `Failed to delete skill with ID ${id} due to a server error. Please try again later.` }
//     });
//   }
// };

// exports.getSkillsWithPagination = async (req, res) => {
//   const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

//   try {
//     const Skill = require('../models/skillMaster')(req.sequelize);

//     const offset = (page - 1) * limit;

//     const { count, rows } = await Skill.findAndCountAll({
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     });

//     logger.info('Fetched skills with pagination successfully');
//     res.json({
//       meta: {
//         statusCode: 200,
//         totalItems: count,
//         totalPages: Math.ceil(count / limit),
//         currentPage: parseInt(page)
//       },
//       data: rows
//     });
//   } catch (error) {
//     logger.error(`Error fetching skills with pagination: ${error.message}`);
//     res.status(500).json({
//       meta: { statusCode: 500, errorCode: 992 },
//       error: { message: 'Failed to fetch skills due to a server error. Please try again later.' }
//     });
//   }
// };


const Skill = require('../models/skillMaster');
const logger = require('../logger'); // Adjust path as per your project structure
const requestIp = require('request-ip');

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


exports.getAllSkills = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  
  try {
    const Skill = require('../models/skillMaster')(req.sequelize);
    const skills = await Skill.findAll();

    
    
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
    logger.logWithMeta("info", `Fetched all skills successfully in ${end - start}ms`, {
      executionTime,
      hospitalId: req.hospitalId,
      // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
      userId: req.userId,
      ip: clientIp, // Correctly log the client IP
      userAgent: req.headers['user-agent'],
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    // logger.info(`Fetched all skills successfully in ${end - start}ms`);
    res.json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      data: skills
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 987;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching skills:`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    // logger.error(`Error fetching skills: ${error.message} in ${end - start}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 987, executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch skills due to a server error. Please try again later.' }
    });
  }
};


// GET single skill by ID
exports.getSkillById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const Skill = require('../models/skillMaster')(req.sequelize);
    const skill = await Skill.findByPk(id);

    if (!skill) {
      const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 988;

    // Log the warning
    logger.logWithMeta("warn", `Skill with ID ${id} not found in `, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
      // logger.warn(`Skill with ID ${id} not found in ${end - start}ms`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 988, executionTime: `${end - start}ms` },
        error: { message: `Skill with ID ${id} not found. Please check the ID and try again.` }
      });
    }
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
    logger.logWithMeta("info", `Fetched skill with ID ${id} successfully in ${executionTime}`, {
      executionTime,
      hospitalId: req.hospitalId,
      SkillName: req.SkillName,
      ip: clientIp,
      userAgent: req.headers['user-agent'],
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    

    logger.info(`Fetched skill with ID ${id} successfully in ${end - start}ms`);
    res.json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      data: skill
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 989;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching skill with ID ${id}: `, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    // logger.error(`Error fetching skill with ID ${id}: ${error.message} in ${end - start}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 989, executionTime: `${end - start}ms` },
      error: { message: `Failed to fetch skill with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

// POST create a new skill
exports.createSkill = async (req, res) => {
  const start = Date.now();
  const { SkillName, IsClinicalSkill, Reserve1, Reserve2, Reserve3, Reserve4 } = req.body;
  const HospitalIDR = req.hospitalId; // Get the HospitalIDR from the decoded token
  const CreatedBy = req.user.userId
  console.log("CreatedBy*******",CreatedBy)

  try {
    const clientIp = await getClientIp(req);
    const Skill = require('../models/skillMaster')(req.sequelize);

    // Ensure the table exists
    await Skill.sync();

    const newSkill = await Skill.create({
      SkillName,
      IsClinicalSkill,
      CreatedBy,
      HospitalIDR,
      Reserve1,
      Reserve2,
      Reserve3,
      Reserve4
    });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    // logger.info('Retrieved all patients successfully', { executionTime: `${end - start}ms` });
    logger.logWithMeta("info", `Created new skill successfully in ${end - start}ms`, {
      executionTime,
      hospitalId: req.hospitalId,
      // patientFirstName: patient.PatientFirstName, // Adjust to match actual field
      userId: req.userId,
      ip: clientIp, // Correctly log the client IP
      userAgent: req.headers['user-agent'],
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    logger.info(`Created new skill successfully in ${end - start}ms`);
    res.status(200).json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      data: newSkill
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 990;

    // Log the warning
    logger.logWithMeta("warn", `Error creating skill:`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    // logger.error(`Error creating skill: ${error.message} in ${end - start}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 990, executionTime: `${end - start}ms` },
      error: { message: 'Failed to create skill due to a server error. Please ensure all fields are correctly filled and try again.' }
    });
  }
};

// PUT update an existing skill
exports.updateSkill = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const { SkillName, IsClinicalSkill, EditedBy, HospitalIDR } = req.body;

  try {
    const Skill = require('../models/skillMaster')(req.sequelize);
    let skill = await Skill.findByPk(id);
    const clientIp = await getClientIp(req);

    if (!skill) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 991;
  
      // Log the warning
      logger.logWithMeta("warn", `Skill with ID ${id} not found in ${end - start}ms:`, {
        errorCode,
  
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method         // HTTP method
      });

      // logger.warn(`Skill with ID ${id} not found in ${end - start}ms`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 991, executionTime: `${end - start}ms` },
        error: { message: `Skill with ID ${id} not found. Please check the ID and try again.` }
      });
    }

    skill = await skill.update({
      SkillName,
      IsClinicalSkill,
      EditedBy,
      HospitalIDR
    });

    const end = Date.now();
    logger.logWithMeta("warn", `Updated skill with ID ${id} successfully in ${end - start}ms`, {
      

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    logger.info(`Updated skill with ID ${id} successfully in ${end - start}ms`);
    res.json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      data: skill
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 992;

    // Log the warning
    logger.logWithMeta("warn", `Error updating skill with ID ${id}: ${error.message} in ${end - start}ms`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    // logger.error(`Error updating skill with ID ${id}: ${error.message} in ${end - start}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 992, executionTime: `${end - start}ms` },
      error: { message: `Failed to update skill with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

// DELETE delete a skill
exports.deleteSkill = async (req, res) => {
  const start = Date.now();

  const { id } = req.params;

  try {
    const clientIp = await getClientIp(req);
    const Skill = require('../models/skillMaster')(req.sequelize);
    const skill = await Skill.findByPk(id);

    if (!skill) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 993;
  
      // Log the warning
      logger.logWithMeta("warn", `Skill with ID ${id} not found in ${end - start}ms`, {
        errorCode,
  
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method         // HTTP method
      });
      // logger.warn(`Skill with ID ${id} not found in ${end - start}ms`);
      return res.status(404).json({
        meta: { statusCode: 404, errorCode: 993, executionTime: `${end - start}ms` },
        error: { message: `Skill with ID ${id} not found. Please check the ID and try again.` }
      });
    }

    await skill.destroy();
    const end = Date.now();
    logger.logWithMeta("warn", `Deleted skill with ID ${id} successfully in ${end - start}ms`, {
   

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    logger.info(`Deleted skill with ID ${id} successfully in ${end - start}ms`);
    res.json({
      meta: { statusCode: 200, executionTime: `${end - start}ms` },
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 994;

    // Log the warning
    logger.logWithMeta("warn", `Error deleting skill with ID ${id}: ${error.message} in ${end - start}ms`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    // logger.error(`Error deleting skill with ID ${id}: ${error.message} in ${end - start}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 994, executionTime: `${end - start}ms` },
      error: { message: `Failed to delete skill with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

exports.getSkillsWithPagination = async (req, res) => {
  const start = Date.now();
  const { page = 1, limit = 10 } = req.query;

  try {
    const Skill = require('../models/skillMaster')(req.sequelize);
    const offset = (page - 1) * limit;

    const { count, rows } = await Skill.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const end = Date.now();
    logger.logWithMeta("warn", `Fetched skills with pagination successfully in ${end - start}ms`, {
  

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    // logger.info(`Fetched skills with pagination successfully in ${end - start}ms`);
    res.json({
      meta: {
        statusCode: 200,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        executionTime: `${end - start}ms`
      },
      data: rows
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 995;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching skills with pagination: ${error.message} in ${end - start}ms`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    // logger.error(`Error fetching skills with pagination: ${error.message} in ${end - start}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 995, executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch skills due to a server error. Please try again later.' }
    });
  }
};