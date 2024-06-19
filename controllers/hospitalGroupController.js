// const { body, validationResult } = require('express-validator');
// const HospitalGroup = require('../models/HospitalGroup');
// const sequelize = require('../database/connection');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const logger = require('../logger');  // Assuming logger is configured properly

// // Login validation rules
// exports.loginValidationRules = () => [
//   body('SysUserName').notEmpty().withMessage('Username is required'),
//   body('SysUserPwd').notEmpty().withMessage('Password is required')
// ];

// // Login
// exports.login = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     logger.warn('Validation errors during login', errors.array());
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 935
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
//       logger.warn(`Invalid username or password for user: ${SysUserName}`);
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 936
//         },
//         error: {
//           message: 'Invalid username or password'
//         }
//       });
//     }

//     const isPasswordValid = await bcrypt.compare(SysUserPwd, user.SysUserPwd);
//     if (!isPasswordValid) {
//       logger.warn(`Invalid password for user: ${SysUserName}`);
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 937
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

//     logger.info(`User ${SysUserName} logged in successfully`);
//     res.json({
//       meta: {
//         statusCode: 200,
//         errorCode: 0
//       },
//       data: {
//         token: authenticationToken
//       }
//     });
//   } catch (error) {
//     logger.error('Error during login', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 922
//       },
//       error: {
//         message: 'An unexpected error occurred: ' + error.message
//       }
//     });
//   }
// };


// // Create Hospital Group
// exports.createHospitalGroup = async (req, res) => {
//   try {
//     const hospitalGroup = await HospitalGroup.create(req.body);
//     logger.info('Hospital group created successfully', hospitalGroup);
//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         errorCode: 0
//       },
//       data: hospitalGroup
//     });
//   } catch (error) {
//     logger.error('Error creating hospital group', { error: error.message });
//     res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 900
//       },
//       error: {
//         message: 'Error creating hospital group: ' + error.message
//       }
//     });
//   }
// };

// // Get all hospital groups
// exports.getAllHospitalGroups = async (req, res) => {
//   try {
//     const hospitalGroups = await HospitalGroup.findAll();
//     logger.info('Retrieved all hospital groups successfully');
//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         errorCode: 0
//       },
//       data: hospitalGroups
//     });
//   } catch (error) {
//     logger.error('Error retrieving hospital groups', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 901
//       },
//       error: {
//         message: 'Error retrieving hospital groups: ' + error.message
//       }
//     });
//   }
// };

// // Get hospital group by ID
// exports.getHospitalGroupById = async (req, res) => {
//   const id = req.params.id;
//   try {
//     const hospitalGroup = await HospitalGroup.findByPk(id);
//     if (!hospitalGroup) {
//       logger.warn(`Hospital group with ID ${id} not found`);
//       res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 902
//         },
//         error: {
//           message: 'Hospital group not found'
//         }
//       });
//     } else {
//       logger.info(`Retrieved hospital group with ID ${id} successfully`);
//       res.status(200).json({
//         meta: {
//           statusCode: 200,
//           errorCode: 0
//         },
//         data: hospitalGroup
//       });
//     }
//   } catch (error) {
//     logger.error('Error retrieving hospital group', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 903
//       },
//       error: {
//         message: 'Error retrieving hospital group: ' + error.message
//       }
//     });
//   }
// };

// // Update hospital group
// exports.updateHospitalGroup = async (req, res) => {
//   const id = req.params.id;
//   const { HospitalGroupName, LicensedHospitalCount } = req.body;

//   try {
//     const [updatedRows] = await HospitalGroup.update(
//       { HospitalGroupName, LicensedHospitalCount },
//       {
//         where: { HospitalGroupID: id }
//       }
//     );

//     if (updatedRows === 0) {
//       logger.warn(`Hospital group with ID ${id} not found for update`);
//       res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 904
//         },
//         error: {
//           message: 'Hospital group not found'
//         }
//       });
//     } else {
//       logger.info(`Hospital group with ID ${id} updated successfully`);
//       res.status(200).json({
//         meta: {
//           statusCode: 200,
//           errorCode: 0
//         },
//         data: {
//           message: 'Hospital group updated successfully'
//         }
//       });
//     }
//   } catch (error) {
//     logger.error('Error updating hospital group', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 905
//       },
//       error: {
//         message: 'Error updating hospital group: ' + error.message
//       }
//     });
//   }
// };

// // Delete hospital group
// exports.deleteHospitalGroup = async (req, res) => {
//   const id = req.params.id;
//   try {
//     const deletedRows = await HospitalGroup.destroy({
//       where: { HospitalGroupID: id }
//     });
//     if (deletedRows === 0) {
//       logger.warn(`Hospital group with ID ${id} not found for deletion`);
//       res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 906
//         },
//         error: {
//           message: 'Hospital group not found'
//         }
//       });
//     } else {
//       logger.info(`Hospital group with ID ${id} deleted successfully`);
//       res.status(200).json({
//         meta: {
//           statusCode: 200,
//           errorCode: 0
//         },
//         data: {
//           message: 'Hospital group deleted successfully'
//         }
//       });
//     }
//   } catch (error) {
//     logger.error('Error deleting hospital group', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 907
//       },
//       error: {
//         message: 'Error deleting hospital group: ' + error.message
//       }
//     });
//   }
// };


const { body, validationResult } = require('express-validator');
const HospitalGroup = require('../models/HospitalGroup');
const sequelize = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../logger'); // Assuming logger is configured properly

// Login validation rules
exports.loginValidationRules = () => [
  body('SysUserName').notEmpty().withMessage('Username is required'),
  body('SysUserPwd').notEmpty().withMessage('Password is required')
];

// Login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors during login', errors.array());
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 900
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

  const { SysUserName, SysUserPwd } = req.body;

  try {
    const [user] = await sequelize.query(
      `SELECT * FROM tblsysuser WHERE SysUserName = ? AND Active = ?`,
      {
        replacements: [SysUserName, 'true'],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      logger.warn(`Invalid username or password for user: ${SysUserName}`);
      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 901
        },
        error: {
          message: 'Invalid username or password'
        }
      });
    }

    const isPasswordValid = await bcrypt.compare(SysUserPwd, user.SysUserPwd);
    if (!isPasswordValid) {
      logger.warn(`Invalid password for user: ${SysUserName}`);
      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 902
        },
        error: {
          message: 'Invalid username or password'
        }
      });
    }

    const authenticationToken = jwt.sign(
      { userId: user.SysUserID, userType: user.UserType },
      process.env.SUPERCLIENTSECRET,
      { expiresIn: '24h' }
    );

    logger.info(`User ${SysUserName} logged in successfully`);
    res.json({
      meta: {
        statusCode: 200,
        errorCode: 0
      },
      data: {
        token: authenticationToken
      }
    });
  } catch (error) {
    logger.error('Error during login', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 903
      },
      error: {
        message: 'An unexpected error occurred: ' + error.message
      }
    });
  }
};

// Create Hospital Group
exports.createHospitalGroup = async (req, res) => {
  try {
    const hospitalGroup = await HospitalGroup.create(req.body);
    logger.info('Hospital group created successfully', hospitalGroup);
    res.status(200).json({
      meta: {
        statusCode: 200,
        errorCode: 0
      },
      data: hospitalGroup
    });
  } catch (error) {
    logger.error('Error creating hospital group', { error: error.message });
    res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 904
      },
      error: {
        message: 'Error creating hospital group: ' + error.message
      }
    });
  }
};

// Get all hospital groups
exports.getAllHospitalGroups = async (req, res) => {
  try {
    const hospitalGroups = await HospitalGroup.findAll();
    logger.info('Retrieved all hospital groups successfully');
    res.status(200).json({
      meta: {
        statusCode: 200,
        errorCode: 0
      },
      data: hospitalGroups
    });
  } catch (error) {
    logger.error('Error retrieving hospital groups', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 905
      },
      error: {
        message: 'Error retrieving hospital groups: ' + error.message
      }
    });
  }
};

// Get hospital group by ID
exports.getHospitalGroupById = async (req, res) => {
  const id = req.params.id;
  try {
    const hospitalGroup = await HospitalGroup.findByPk(id);
    if (!hospitalGroup) {
      logger.warn(`Hospital group with ID ${id} not found`);
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 906
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      logger.info(`Retrieved hospital group with ID ${id} successfully`);
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0
        },
        data: hospitalGroup
      });
    }
  } catch (error) {
    logger.error('Error retrieving hospital group', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 907
      },
      error: {
        message: 'Error retrieving hospital group: ' + error.message
      }
    });
  }
};

// Update hospital group
exports.updateHospitalGroup = async (req, res) => {
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
      logger.warn(`Hospital group with ID ${id} not found for update`);
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 908
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      logger.info(`Hospital group with ID ${id} updated successfully`);
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0
        },
        data: {
          message: 'Hospital group updated successfully'
        }
      });
    }
  } catch (error) {
    logger.error('Error updating hospital group', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 909
      },
      error: {
        message: 'Error updating hospital group: ' + error.message
      }
    });
  }
};

// Delete hospital group
exports.deleteHospitalGroup = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedRows = await HospitalGroup.destroy({
      where: { HospitalGroupID: id }
    });
    if (deletedRows === 0) {
      logger.warn(`Hospital group with ID ${id} not found for deletion`);
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 910
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      logger.info(`Hospital group with ID ${id} deleted successfully`);
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0
        },
        data: {
          message: 'Hospital group deleted successfully'
        }
      });
    }
  } catch (error) {
    logger.error('Error deleting hospital group', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 911
      },
      error: {
        message: 'Error deleting hospital group: ' + error.message
      }
    });
  }
};