const { body, validationResult } = require('express-validator');
const HospitalGroup = require('../models/HospitalGroup');
const sequelize = require('../database/connection');
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../logger'); // Assuming logger is configured properly
const requestIp = require('request-ip');
const CryptoJS = require('crypto-js');

// Login validation rules
exports.loginValidationRules = () => [
  body('SysUserName').notEmpty().withMessage('Username is required'),
  body('SysUserPwd').notEmpty().withMessage('Password is required')
];
async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '110.227.185.254' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 1121 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}


exports.login = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);

  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1122;

    logger.logWithMeta('warn', `Validation errors during login`, {
      errorCode,
      statusCode: 400,
      executionTime,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
    });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode,
        executionTime,
      },
      error: {
        message: 'Validation errors occurred',
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }

  const { SysUserName, SysUserPwd } = req.body;

  try {
    const decryptedPassword = CryptoJS.AES.decrypt(SysUserPwd, process.env.SYSTEM_SECRET_KEY

    ).toString(CryptoJS.enc.Utf8);

    if (!decryptedPassword) {
      console.error('Decryption failed. Encrypted input:', SysUserPwd);
      throw new Error('Password decryption failed');
    }
    

    console.log('Decrypted Password:', decryptedPassword);

    // Fetch user from the database
    const [user] = await sequelize.query(
      `SELECT * FROM tblsysuser WHERE SysUserName = ? AND Active = ?`,
      {
        replacements: [SysUserName, 'true'],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!user) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1123;

      logger.logWithMeta('warn', `Invalid username or password`, {
        errorCode,
        statusCode: 401,
        executionTime,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode,
          executionTime,
        },
        error: {
          message: 'Invalid username or password',
        },
      });
    }

    // Compare decrypted password with hashed password from DB
    const isPasswordValid = await bcrypt.compare(decryptedPassword, user.SysUserPwd);
    if (!isPasswordValid) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1124;

      logger.logWithMeta('warn', `Invalid password for user`, {
        errorCode,
        statusCode: 401,
        executionTime,
        ip: clientIp,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode,
          executionTime,
        },
        error: {
          message: 'Invalid username or password',
        },
      });
    }

    // Generate authentication token
    const authenticationToken = jwt.sign(
      { userId: user.SysUserID, userType: user.UserType },
      process.env.SUPERCLIENTSECRET,
      { expiresIn: '24h' }
    );

    const end = Date.now();
    logger.info(`User ${SysUserName} logged in successfully`);

    res.json({
      meta: {
        statusCode: 200,
        errorCode: 0,
        executionTime: `${end - start}ms`,
      },
      data: {
        token: authenticationToken,
      },
    });
  } catch (error) {

    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1125;

    logger.logWithMeta('error', `Error during login`, {
      errorCode,
      executionTime,
      statusCode: 500,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
      errorMessage: error.message,
    });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode,
        executionTime,
      },
      error: {
        message: 'An unexpected error occurred: ' + error.message,
      },
    });
  }
};






// Login
// exports.login = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 1122;

//     // Log the warning
//     logger.logWithMeta("warn", `Validation errors during login `, {
//       errorCode,
//       statusCode: 400,
      
//       // errorMessage: error.message,
//       executionTime,
//       // hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'],     // HTTP method
//     });

//     // logger.warn('Validation errors during login', errors.array());
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 1122,
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

//   const { SysUserName, SysUserPwd } = req.body;

//   try {
//     const [user] = await sequelize.query(
//       `SELECT * FROM tblsysuser WHERE SysUserName = ? AND Active = ?`,
//       {
//         replacements: [SysUserName, 'true'],
//         type: sequelize.QueryTypes.SELECT
//       }
//     );

//     if (!user) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 1123;
  
//       // Log the warning
//       logger.logWithMeta("warn", `Invalid username or password for user `, {
//         errorCode,
//         statusCode: 401,
//         // errorMessage: error.message,
//         executionTime,
//         // hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers['user-agent'],     // HTTP method
//       });

//       // logger.warn(`Invalid username or password for user: ${SysUserName}`);
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 1123,
//         executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Invalid username or password'
//         }
//       });
//     }

//     const isPasswordValid = await bcrypt.compare(SysUserPwd, user.SysUserPwd);
//     if (!isPasswordValid) {
//       const end = Date.now();
//       const executionTime = `${end - start}ms`;
//       const errorCode = 1124;
  
//       // Log the warning
//       logger.logWithMeta("warn", `Invalid password for user `, {
//         errorCode,
//         statusCode: 401,
//         // errorMessage: error.message,
//         executionTime,
//         // hospitalId: req.hospitalId,
//         ip: clientIp,
//         apiName: req.originalUrl, // API name
//         method: req.method,
//         userAgent: req.headers['user-agent'],     // HTTP method
//       });


//       // logger.warn(`Invalid password for user: ${SysUserName}`);
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 1124,
//         executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Invalid username or password'
//         }
//       });
//     }

//     const authenticationToken = jwt.sign(
//       { userId: user.SysUserID, userType: user.UserType },
//       process.env.SUPERCLIENTSECRET,
//       { expiresIn: '24h' }
//     );

//     const end = Date.now();
//     logger.info(`User ${SysUserName} logged in successfully`);
//     res.json({
//       meta: {
//         statusCode: 200,
//         errorCode: 0,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         token: authenticationToken
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     const executionTime = `${end - start}ms`;
//     const errorCode = 1125;

//     // Log the warning
//     logger.logWithMeta("warn", `Error during login `, {
//       errorCode,
//       // errorMessage: error.message,
//       executionTime, 
//       statusCode: 500,
//       // hospitalId: req.hospitalId,
//       ip: clientIp,
//       apiName: req.originalUrl, // API name
//       method: req.method,
//       userAgent: req.headers['user-agent'],     // HTTP method
//     });
//     // logger.error('Error during login', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 1125,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'An unexpected error occurred: ' + error.message
//       }
//     });
//   }
// };



// Create Hospital Group
exports.createHospitalGroup = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  try {
    const hospitalGroup = await HospitalGroup.create(req.body);
    const end = Date.now();
    logger.info('Hospital group created successfully', hospitalGroup);
    res.status(200).json({
      meta: {
        statusCode: 200,
        errorCode: 0,
        executionTime: `${end - start}ms`
      },
      data: hospitalGroup
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1126;

    // Log the warning
    logger.logWithMeta("warn", `Error creating hospital group `, {
      errorCode,
      statusCode: 400,
      // errorMessage: error.message,
      executionTime,
      // hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });

    // logger.error('Error creating hospital group', { error: error.message });
    res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1126,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error creating hospital group: ' + error.message
      }
    });
  }
};

// Get all hospital groups
exports.getAllHospitalGroups = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  try {
    const hospitalGroups = await HospitalGroup.findAll();
    const end = Date.now();
    logger.info('Retrieved all hospital groups successfully');
    res.status(200).json({
      meta: {
        statusCode: 200,
        errorCode: 0,
        executionTime: `${end - start}ms`
      },
      data: hospitalGroups
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1127;

    // Log the warning
    logger.logWithMeta("warn", `Error retrieving hospital groups `, {
      errorCode,
      statusCode: 500,
      // errorMessage: error.message,
      executionTime,
      // hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });

    // logger.error('Error retrieving hospital groups', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1127,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving hospital groups: ' + error.message
      }
    });
  }
};

// Get hospital group by ID
exports.getHospitalGroupById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const id = req.params.id;
  try {
    const hospitalGroup = await HospitalGroup.findByPk(id);
    if (!hospitalGroup) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1128;
  
      // Log the warning
      logger.logWithMeta("warn", `Hospital group with ID ${id} not found `, {
        errorCode,
        statusCode: 404,
        // errorMessage: error.message,
        executionTime,
        // hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });

      // logger.warn(`Hospital group with ID ${id} not found`);
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 1128,
        executionTime: `${end - start}ms`
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      const end = Date.now();
      logger.info(`Retrieved hospital group with ID ${id} successfully`);
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0,
        executionTime: `${end - start}ms`
        },
        data: hospitalGroup
      });
    }
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1129;

    // Log the warning
    logger.logWithMeta("warn", `Error retrieving hospital group `, {
      errorCode,
      statusCode: 500,
      // errorMessage: error.message,
      executionTime,
      // hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });

    // logger.error('Error retrieving hospital group', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1129,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving hospital group: ' + error.message
      }
    });
  }
};

// Update hospital group
exports.updateHospitalGroup = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const id = req.params.id;
  const { HospitalGroupName, LicensedHospitalCount } = req.body;

  try {
    const [updatedRows] = await HospitalGroup.update(
      { HospitalGroupName, LicensedHospitalCount },
      {
        where: { HospitalGroupID: id }
      }
    );

    if (updatedRows === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1130;
  
      // Log the warning
      logger.logWithMeta("warn", `Hospital group with ID ${id} not found for update `, {
        errorCode,
        statusCode: 404,
        // errorMessage: error.message,
        executionTime,
        // hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });

      // logger.warn(`Hospital group with ID ${id} not found for update`);
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 1130,
        executionTime: `${end - start}ms`
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      const end = Date.now();
      logger.info(`Hospital group with ID ${id} updated successfully`);
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0,
        executionTime: `${end - start}ms`
        },
        data: {
          message: 'Hospital group updated successfully'
        }
      });
    }
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1131;

    // Log the warning
    logger.logWithMeta("warn", `Error updating hospital group `, {
      errorCode,
      statusCode: 500,
      // errorMessage: error.message,
      executionTime,
      // hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error('Error updating hospital group', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1131,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error updating hospital group: ' + error.message
      }
    });
  }
};

// Delete hospital group
exports.deleteHospitalGroup = async (req, res) => {
  const start = Date.now();
  const id = req.params.id;
  const clientIp = await getClientIp(req);
  try {
    const deletedRows = await HospitalGroup.destroy({
      where: { HospitalGroupID: id }
    });
    if (deletedRows === 0) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1132;
  
      // Log the warning
      logger.logWithMeta("warn", `Hospital group with ID ${id} not found for deletion `, {
        errorCode,
        statusCode: 404,
        // errorMessage: error.message,
        executionTime,
        // hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.warn(`Hospital group with ID ${id} not found for deletion`);
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 1132,
        executionTime: `${end - start}ms`
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      const end = Date.now();
      logger.info(`Hospital group with ID ${id} deleted successfully`);
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0,
        executionTime: `${end - start}ms`
        },
        data: {
          message: 'Hospital group deleted successfully'
        }
      });
    }
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1133;

    // Log the warning
    logger.logWithMeta("warn", `Error deleting hospital group `, {
      errorCode,
      statusCode: 500,
      // errorMessage: error.message,
      executionTime,
      // hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error('Error deleting hospital group', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1133,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error deleting hospital group: ' + error.message
      }
    });
  }
};


exports.getAllHospitalGroupsByPagination = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5; // Default limit is 5, adjust as per your requirement

  const offset = (page - 1) * limit;

  try {
    const totalCount = await HospitalGroup.count();
    const hospitalGroups = await HospitalGroup.findAll({
      offset,
      limit,
      order: [['createdAt', 'ASC']] // Example ordering by createdAt, adjust as per your requirement
    });

    const end = Date.now();
    logger.info(`Retrieved hospital groups for page ${page} with limit ${limit} successfully`);

    res.status(200).json({
      meta: {
        statusCode: 200,
        totalCount,
        page,
        limit,
        executionTime: `${end - start}ms`
      },
      data: hospitalGroups
    });
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1134;

    // Log the warning
    logger.logWithMeta("warn", `Error retrieving hospital groups with pagination`, {
      errorCode,
      statusCode: 500,
      // errorMessage: error.message,
      executionTime,
      // hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    // logger.error('Error retrieving hospital groups with pagination', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1134,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving hospital groups with pagination: ' + error.message
      }
    });
  }
};