
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
const getLocationData = require('../util/locationHelper');

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 987 });

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
    const errorCode = 988;

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
      meta: { statusCode: 500, errorCode: 988, executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch skills due to a server error. Please try again later.' }
    });
  }
};


exports.getcustomskillsbyqueryparam = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  const errorCode = 11111;

  try {
    const Skill = require('../models/skillMaster.js')(req.sequelize);
    const { SpecialtyId, page, limit, ...queryColumns } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let attributes = Object.keys(queryColumns);
    if (!attributes.includes("SpecialtyId")) {
      attributes.push("SpecialtyId");
    }
    if (attributes.length === 1 && attributes[0] === "SpecialtyId") {
      attributes = undefined;
    }

    let data, totalRecords;

    const queryKeys = Object.keys(req.query);
    const filterKeys = queryKeys.filter((key) => key !== "page" && key !== "limit");

    if (SpecialtyId) {
      data = await Skill.findOne({
        where: { SpecialtyId },
        attributes,
      });

      if (!data) {
        const executionTime = `${Date.now() - start}ms`;
        logger.logWithMeta("warn", `Skill not found for SpecialtyId: ${SpecialtyId}`, {
          errorCode,
          executionTime,
          hospitalId: req.hospitalId,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          ip: clientIp,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: req.username,
        });

        return res.status(404).json({ errorCode, message: "Skill not found" });
      }
    } else {
      const isPagination = req.query.page && req.query.limit;

      if (filterKeys.length === 0) {
        if (isPagination) {
          totalRecords = await Skill.count();
          data = await Skill.findAll({
            offset,
            limit: limitNum,
            attributes,
            order: [["SpecialtyId", "ASC"]],
          });
        } else {
          data = await Skill.findAll({
            attributes,
            order: [["SpecialtyId", "ASC"]],
          });
          totalRecords = data.length;
        }
      } else {
        if (isPagination) {
          totalRecords = await Skill.count();
          data = await Skill.findAll({
            offset,
            limit: limitNum,
            attributes,
            order: [["SpecialtyId", "ASC"]],
          });
        } else {
          data = await Skill.findAll({
            attributes,
            order: [["SpecialtyId", "ASC"]],
          });
          totalRecords = data.length;
        }
      }
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched skills successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    const formatData = (record) => {
      const obj = record.toJSON();
      const { SpecialtyId, ...rest } = obj;
      return { SpecialtyId, ...rest };
    };

    const formattedData = Array.isArray(data)
      ? data.map(formatData)
      : data
      ? formatData(data)
      : null;

    const meta = {
      statusCode: 200,
      executionTime,
      hospitalDatabase,
    };

    if (!SpecialtyId && req.query.page && req.query.limit) {
      meta.pagination = {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
      };
    }

    return res.status(200).json({
      meta,
      data: formattedData,
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("error", `Error fetching skills: ${error.message}`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    return res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching skills: " + error.message },
    });
  }
};


// exports.getcustomskillsbyqueryparam = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);

//   try {
//     const Skill = require('../models/skillMaster')(req.sequelize);

//     // Dynamic filters (adjust keys as per your skill model columns)
//     const { SpecialtyId, page, limit, ...queryColumns } = req.query;

//     // Pagination parameters
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const offset = (pageNum - 1) * limitNum;

//     let attributes= Object.keys(queryColumns);

//     if(!attributes.includes("SpecialtyId")){
//       attributes.push("SpecialtyId");
//     }

//     if (attributes.length === 1 && attributes[0] === "SpecialtyId") {
//       attributes = undefined;
//     }

//     let data,totalRecords;
//      const queryKeys = Object.keys(req.query);
//     const filterKeys = queryKeys.filter((key) => key !== "page" && key !== "limit");

//     if (SpecialtyId) {
//       data = await Skill.findOne({
//         where: { SpecialtyId },
//         attributes,
//       });

//       if (!data) {
//         const executionTime = `${Date.now() - start}ms`;

//       logger.logWithMeta("warn", `Error fetching skills: ${error.message}`, {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method
//     });
//      return res.status(404).json({ errorCode, message: "Error fetching skills" });
//   }
//    } else {
//       const isPagination = req.query.page && req.query.limit;

//       if (filterKeys.length === 0) {
//         if (isPagination) {
//           totalRecords = await Skill.count();
//           data = await Skill.findAll({
//             offset,
//             limit: limitNum,
//             attributes,
//             order: [['SpecialtyId', 'ASC']],
//           });
//         } else {
//           data = await Skill.findAll({
//             attributes,
//             order: [['SpecialtyId', 'ASC']],
//           });
//           totalRecords = data.length;
//         }
//       } else {
//         if (isPagination) {
//           totalRecords = await Skill.count();
//           data = await Skill.findAll({
//             offset,
//             limit: limitNum,
//             attributes,
//             order: [['SpecialtyId', 'ASC']],
//           });
//         } else {
//           data = await Skill.findAll({
//             attributes,
//             order: [['SpecialtyId', 'ASC']],
//           });
//           totalRecords = data.length;
//         }
//       }
//     }
//      const executionTime = `${end - start}ms`;

//     logger.logWithMeta("info", `Fetched skills successfully in ${executionTime}`, {
//       executionTime,
//       hospitalId: req.hospitalId,
//       userId: req.userId,
//       ip: clientIp,
//       userAgent: req.headers['user-agent'],
//       apiName: req.originalUrl,
//       method: req.method
//     });
//     const formatData = (record) => {
//       const obj = record.toJSON();
//       const { SpecialtyId, ...rest } = obj;
//       return { SpecialtyId, ...rest };
//     };

//     const formattedData = Array.isArray(data)
//       ? data.map(formatData)
//       : data
//       ? formatData(data)
//       : null;

//     const meta = {
//       statusCode: 200,
//       executionTime,
//       hospitalDatabase,
//     };

//     if (!SpecialtyId && req.query.page && req.query.limit) {
//       meta.pagination = {
//         page: pageNum,
//         limit: limitNum,
//         totalRecords,
//         totalPages: Math.ceil(totalRecords / limitNum),
//       };
//     }
//      res.status(200).json({
//       meta,
//       data: formattedData,
//     });
//   } catch(error){
//      const executionTime = `${Date.now() - start}ms`;
//      const errorCode=11111;
//       logger.logWithMeta("warn", `Error fetching skills: ${error.message}`, {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method
//     });
//  res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime },
//       error: { message: 'Failed to fetch skills due to a server error. Please try again later.'+error.message }  
//     })
//   }
  
// };




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
    const errorCode = 989;

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
        meta: { statusCode: 404, errorCode: 989, executionTime: `${end - start}ms` },
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
    const errorCode = 990;

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
      meta: { statusCode: 500, errorCode: 990, executionTime: `${end - start}ms` },
      error: { message: `Failed to fetch skill with ID ${id} due to a server error. Please try again later.` }
    });
  }
};

// POST create a new skill
exports.createSkill = async (req, res) => {
  const start = Date.now();
  const { SkillName, IsClinicalSkill, Reserve1, Reserve2, Reserve3, Reserve4 ,CreatedBy} = req.body;
  const HospitalIDR = req.hospitalId; // Get the HospitalIDR from the decoded token
  // const CreatedBy = req.user.userId
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
    const errorCode = 991;

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
      meta: { statusCode: 500, errorCode: 991, executionTime: `${end - start}ms` },
      error: { message: 'Failed to create skill due to a server error. Please ensure all fields are correctly filled and try again.' }
    });
  }
};

// PUT update an existing skill
exports.updateSkill = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;
  const { SkillName, IsClinicalSkill, EditedBy, HospitalIDR } = req.body;

  try {
    const Skill = require('../models/skillMaster')(req.sequelize);
    let skill = await Skill.findByPk(id);

    if (!skill) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 992;
  
      // Log the warning
      logger.logWithMeta("warn", `Skill with ID ${id} not found`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
      });

      return res.status(404).json({
        meta: { statusCode: 404, errorCode, executionTime },
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
    const executionTime = `${end - start}ms`;
    
    logger.logWithMeta("info", `Updated skill with ID ${id} successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
    });

    res.json({
      meta: { statusCode: 200, executionTime },
      data: skill
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 993;

    logger.logWithMeta("error", `Error updating skill with ID ${id}: ${error.message}`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: `Failed to update skill with ID ${id} due to a server error. Please try again later.` }
    });
  }
};


// DELETE delete a skill
exports.deleteSkill = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.params;

  try {
    const Skill = require('../models/skillMaster')(req.sequelize);
    const Doctor = require('../models/doctorMaster')(req.sequelize); // Assuming a model for DoctorMaster exists

    const skill = await Skill.findByPk(id);
    if (!skill) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 994;
      logger.logWithMeta("warn", `Skill with ID ${id} not found`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method
      });

      return res.status(404).json({
        meta: { statusCode: 404, errorCode, executionTime },
        error: { message: `Skill with ID ${id} not found. Please check the ID and try again.` }
      });
    }

    // Check if any doctor references this skill
    const dependentDoctors = await Doctor.findOne({ where: { Specialization: id } });
    if (dependentDoctors) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 996;

      logger.logWithMeta("warn", `Cannot delete skill with ID ${id} as it is referenced in Doctor records`, {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method
      });

      return res.status(409).json({
        meta: { statusCode: 409, errorCode, executionTime },
        error: { message: `Skill with ID ${id} cannot be deleted as it is referenced in Doctor records. Please remove the dependencies first.` }
      });
    }

    // Proceed to delete if no dependencies are found
    await skill.destroy();
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", `Deleted skill with ID ${id} successfully`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method
    });

    res.json({
      meta: { statusCode: 200, executionTime },
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 995;

    logger.logWithMeta("error", `Error deleting skill with ID ${id}: ${error.message}`, {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      stack: error.stack
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
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
    const errorCode = 996;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching skills with pagination: ${error.message} in ${end - start}ms`, {
      errorCode,

      executionTime,
      hospitalId: req.hospitalId,
      // ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method         // HTTP method
    });
    // logger.error(`Error fetching skills with pagination: ${error.message} in ${end - start}ms`);
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 996, executionTime: `${end - start}ms` },
      error: { message: 'Failed to fetch skills due to a server error. Please try again later.' }
    });
  }
};