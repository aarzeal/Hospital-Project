// const { validationResult } = require('express-validator');
// const Hospital = require('../models/HospitalModel');
// const sequelize = require('../database/connection');
// const createUserMasterModel = require('../models/userMaster');
// const createPatientMasterModel = require('../models/paitentMaster');
// const createDynamicConnection = require('../database/dynamicConnection');
// const bcrypt = require('bcrypt');


// // exports.createHospital = async (req, res) => {
// //   const errors = validationResult(req);
// //   if (!errors.isEmpty()) {
// //     return res.status(400).json({
// //       meta: {
// //         statusCode: 400,
// //         errorCode: 908
// //       },
// //       error: {
// //         message: 'Validation errors occurred',
// //         details: errors.array().map(err => ({
// //           field: err.param,
// //           message: err.msg
// //         }))
// //       }

// //     });
// //   }

// //   try {
// //     const hospital = await Hospital.create(req.body);
// //     res.status(200).json({
// //       meta: {
// //         statusCode: 200
// //       },
// //       data: hospital
// //     });
// //   } catch (error) {
// //     res.status(400).json({
// //       meta: {
// //         statusCode: 400,
// //         errorCode: 909
// //       },
// //       error: {
// //         message: 'Error creating hospital: ' + error.message
// //       }
// //     });
// //   }
// // };


//   // exports.createHospital = async (req, res) => {

//   //   const errors = validationResult(req);
//   //   if (!errors.isEmpty()) {
//   //     return res.status(400).json({
//   //       meta: {
//   //         statusCode: 400,
//   //         errorCode: 908
//   //       },
//   //       error: {
//   //         message: 'Validation errors occurred',
//   //         details: errors.array().map(err => ({
//   //           field: err.param,
//   //           message: err.msg
//   //         }))
//   //       }
//   //     });
//   //   }

//   //   try {
//   //     const hospital = await Hospital.create(req.body);

//   //     // Generate database name (e.g., from HospitalName)
//   //     const databaseName = hospital.HospitalDatabase.replace(/\s+/g, '_').toLowerCase();

//   //     // Check if database exists (MySQL specific query)
//   //     // const [databases] = await sequelize.query(`SHOW DATABASES LIKE '${databaseName}'`);


//   //     // if (databases.length === 0) {
//   //       // Create new database
//   //       await sequelize.query(`CREATE DATABASE \`${databaseName}\``);
//   //     // }


//   //     const { sequelize: dynamicDb, testConnection } = createDynamicConnection(databaseName);
      
//   //     // Define the models for the new database
//   //     // const User_Master = createUserMasterModel(dynamicDb);
//   //     // const Patient_master = createPatientMasterModel(dynamicDb);

//   //     await testConnection();

//   //     await dynamicDb.sync();
     

//   //     // Associate hospital with database (store the association in your application's database)
//   //     // Add code here if you need to store this association

//   //     res.status(200).json({
//   //       meta: {
//   //         statusCode: 200
//   //       },
//   //       data: hospital
//   //     });
//   //   } catch (error) {
//   //     res.status(400).json({
//   //       meta: {
//   //         statusCode: 400,
//   //         errorCode: 909
//   //       },
//   //       error: {
//   //         message: 'Error creating hospital: ' + error.message
//   //       }
//   //     });
//   //   }
//   // };



//   exports.createHospital = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 908
//         },
//         error: {
//           message: 'Validation errors occurred',
//           details: errors.array().map(err => ({
//             field: err.param,
//             message: err.msg
//           }))
//         }
//       });
//     }

//     try {
//         const hospital = await Hospital.create(req.body);

//         // Generate database name (e.g., from HospitalDatabase field)
//         const databaseName = hospital.HospitalDatabase.replace(/\s+/g, '_').toLowerCase();

//         // Create new database
//         await sequelize.query(`CREATE DATABASE \`${databaseName}\``);

//         const { sequelize: dynamicDb, testConnection } = createDynamicConnection(databaseName);
        
//         // Test the connection to the new database
//         await testConnection();

//         // Define and sync the UserMaster model in the new database
//         const UserMaster = await createUserMasterModel(dynamicDb);

//         // Sync all models
//         await dynamicDb.sync();

//         res.status(200).json({
//             meta: {
//                 statusCode: 200
//             },
//             data: hospital
//         });
//     } catch (error) {
//         res.status(400).json({
//             meta: {
//                 statusCode: 400,
//                 errorCode: 909
//             },
//             error: {
//                 message: 'Error creating hospital: ' + error.message
//             }
//         });
//     }
// };

const validateJSONContentType = require('../Middleware/jsonvalidation');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../Middleware/sendEmail');
const { Op } = require('sequelize');
const express = require('express');
const router = express.Router();
const { createUserValidationRules } = require('../validators/hospitalValidator');

const { validationResult } = require('express-validator');
const Hospital = require('../models/HospitalModel');
const sequelize = require('../database/connection');
const createUserMasterModel = require('../models/userMaster');
const createPatientMasterModel = require('../models/PatientMaster');
const createDynamicConnection = require('../database/dynamicConnection');
const bcrypt = require('bcrypt');
const logger = require('../logger');  // Assuming logger is configured properly in '../logger'
const jwt = require('jsonwebtoken');
const {  DataTypes } = require('sequelize');


const dotenv = require('dotenv');
dotenv.config();

exports.createHospital = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.info('Validation errors occurred', errors);
        return res.status(400).json({
            meta: {
                statusCode: 400,
                errorCode: 912
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
    

    try {
      const existingHospital = await Hospital.findOne({ where: { ManagingCompanyEmail: req.body.ManagingCompanyEmail } });
    if (existingHospital) {
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 956
        },
        error: {
          message: 'Managing Company Email already exists'
        }
      });
    }
        const hospital = await Hospital.create(req.body);
        logger.info('Hospital created successfully', { hospitalId: hospital.HospitalID });

        // Generate database name (e.g., from HospitalDatabase field)
        const databaseName = hospital.HospitalDatabase.replace(/\s+/g, '_').toLowerCase();
        logger.info(`Generated database name: ${databaseName}`);

        // Create new database
        await sequelize.query(`CREATE DATABASE \`${databaseName}\``);
        logger.info(`Database ${databaseName} created successfully`);

        const { sequelize: dynamicDb, testConnection } = createDynamicConnection(databaseName);
        
        // Test the connection to the new database
        await testConnection();
        logger.info(`Connected to database ${databaseName} successfully`);

        // Define and sync the UserMaster model in the new database
        const UserMaster = createUserMasterModel(dynamicDb);

        // Sync all models
        await dynamicDb.sync();
        logger.info(`Models synchronized successfully in database ${databaseName}`);



        const uniqueKey = uuidv4();
        logger.info(`Generated unique key: ${uniqueKey}`);

        hospital.UniqueKey = uniqueKey;
         await hospital.save({ fields: ['UniqueKey'] });
        logger.info('Unique key stored in hospital record successfully');

        res.status(200).json({
            meta: {
                statusCode: 200
            },
            data: hospital
        });
    } catch (error) {
        logger.error('Error creating hospital', { error: error.message });
        res.status(400).json({
            meta: {
                statusCode: 400,
                errorCode: 913
            },
            error: {
                message: 'Error creating hospital: ' + error.message
            }
        });
    }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.findAll();
    logger.info('Retrieved all hospitals successfully');
    res.json({
      meta: {
        statusCode: 200
      },
      data: hospitals
    });
  } catch (error) {
    logger.error('Error retrieving hospitals', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 914
      },
      error: {
        message: 'Error retrieving hospitals: ' + error.message
      }
    });
  }
};

// Get hospital by ID
exports.getHospitalById = async (req, res) => {
  const id = req.params.id;
  try {
    const hospital = await Hospital.findByPk(id);
    if (!hospital) {
      logger.warn(`Hospital with ID ${id} not found`);
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 915
        },
        error: {
          message: 'Hospital not found'
        }
      });
    } else {
      logger.info(`Retrieved hospital with ID ${id} successfully`);
      res.json({
        meta: {
          statusCode: 200
        },
        data: hospital
      });
    }
  } catch (error) {
    logger.error('Error retrieving hospital', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 916
      },
      error: {
        message: 'Error retrieving hospital: ' + error.message
      }
    });
  }
};

// Update hospital
exports.updateHospital = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors occurred while updating hospital', errors);
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 917
      },
      error: {
        message: errors.array().map(err => err.msg).join(', ')
      }
    });
  }

  const id = req.params.id;
  try {
    const [updatedRows] = await Hospital.update(req.body, {
      where: { HospitalID: id }
    });
    if (updatedRows === 0) {
      logger.warn(`Hospital with ID ${id} not found for update`);
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 918
        },
        error: {
          message: 'Hospital not found'
        }
      });
    } else {
      logger.info(`Hospital with ID ${id} updated successfully`);
      res.json({
        meta: {
          statusCode: 200
        },
        message: 'Hospital updated successfully'
      });
    }
  } catch (error) {
    logger.error('Error updating hospital', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 919
      },
      error: {
        message: 'Error updating hospital: ' + error.message
      }
    });
  }
};

// Delete hospital
exports.deleteHospital = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedRows = await Hospital.destroy({
      where: { HospitalID: id }
    });
    if (deletedRows === 0) {
      logger.warn(`Hospital with ID ${id} not found for deletion`);
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 920
        },
        error: {
          message: 'Hospital not found'
        }
      });
    } else {
      logger.info(`Hospital with ID ${id} deleted successfully`);
      res.json({
        meta: {
          statusCode: 200
        },
        message: 'Hospital deleted successfully'
      });
    }
  } catch (error) {
    logger.error('Error deleting hospital', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 921
      },
      error: {
        message: 'Error deleting hospital: ' + error.message
      }
    });
  }
};

// Get hospitals by HospitalGroupID
exports.getHospitalsByHospitalGroupID = async (req, res) => {
  const { HospitalGroupIDR } = req.params;
  try {
    const hospitals = await Hospital.findAll({
      where: { HospitalGroupIDR }
    });
    logger.info(`Retrieved hospitals by HospitalGroupIDR: ${HospitalGroupIDR} successfully`);
    res.json({
      meta: {
        statusCode: 200
      },
      data: hospitals
    });
  } catch (error) {
    logger.error('Error retrieving hospitals by HospitalGroupIDR', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 922
      },
      error: {
        message: 'Error retrieving hospitals by HospitalGroupIDR: ' + error.message
      }
    });
  }
};

// Login
// exports.login = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     logger.warn('Validation errors occurred during login', errors);
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 923
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

//   const { Username, Password } = req.body;

//   try {
//     // Check if the hospital exists
//     const hospital = await Hospital.findOne({ where: { Username } });
//     if (!hospital) {
//       logger.warn(`Hospital with Username ${Username} not found`);
//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 924
//         },
//         error: {
//           message: 'Hospital not found'
//         }
//       });
//     }

//     // Compare the password
//     const passwordMatch = await bcrypt.compare(Password, hospital.Password);
//     if (!passwordMatch) {
//       logger.warn(`Incorrect password for hospital with Username ${Username}`);
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 925
//         },
//         error: {
//           message: 'Incorrect password'
//         }
//       });
//     }

//     // Generate JWT token
//     const Hospitaltoken = jwt.sign(
//       { hospitalId: hospital.HospitalID ,
//         hospitalDatabase: hospital.HospitalDatabase,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     // Decode the token to retrieve the hospitalId
//     const decodedToken = jwt.verify(Hospitaltoken, process.env.JWT_SECRET);

//     logger.info(`Hospital with ID ${decodedToken.hospitalId} logged in successfully`);
//     res.status(200).json({
//       meta: {
//         statusCode: 200
//       },
//       data: {
//         Hospitaltoken,
//         hospital: {
//           id: decodedToken.hospitalId,
//           username: hospital.Username,
//           email: hospital.Email,
//           hospitalDatabase:hospital.HospitalDatabase
//         }
//       }
//     });
//   } catch (error) {
//     logger.error('Error logging in', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 926
//       },
//       error: {
//         message: 'Error logging in: ' + error.message
//       }
//     });
//   }
//   };




const { Sequelize } = require('sequelize');

// exports.login = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     logger.warn('Validation errors occurred during login', errors);
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 923
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

//   const { Username, Password } = req.body;

//   const uniqueKey = req.headers['x-unique-key'];
//   console.log("uniquekey",uniqueKey)

//   try {
//     const hospital = await Hospital.findOne({ where: { Username } });
//     if (!hospital) {
//       logger.warn(`Hospital with Username ${Username} not found`);
//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 924
//         },
//         error: {
//           message: 'Hospital not found'
//         }
//       });
//     }
//     logger.info(`UniqueKey from request headers: ${uniqueKey}`);
//     logger.info(`UniqueKey from database: ${hospital.UniqueKey}`);
//     console.log(hospital.UniqueKey)




//     if (!verifyUniqueKey(uniqueKey, hospital.UniqueKey)) {
//       logger.warn(`Invalid UniqueKey for hospital with Username ${Username}`);
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 955
//         },
//         error: {
//           message: 'Unauthorized'
//         }
//       });
//     }

//     const passwordMatch = await bcrypt.compare(Password, hospital.Password);
//     if (!passwordMatch) {
//       logger.warn(`Incorrect password for hospital with Username ${Username}`);
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 925
//         },
//         error: {
//           message: 'Incorrect password'
//         }
//       });
//     }

//     const Hospitaltoken = jwt.sign(
//       { hospitalId: hospital.HospitalID, hospitalDatabase: hospital.HospitalDatabase },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     const decodedToken = jwt.verify(Hospitaltoken, process.env.JWT_SECRET);

//     logger.info(`Hospital with ID ${decodedToken.hospitalId} logged in successfully`);

//     res.status(200).json({
//       meta: {
//         statusCode: 200
//       },
//       data: {
//         Hospitaltoken,
//         hospital: {
//           id: decodedToken.hospitalId,
//           username: hospital.Username,
//           email: hospital.Email,
//           hospitalDatabase: hospital.HospitalDatabase
//         },
//         message: 'Login successful and token generated.'
//       }
//     });
//   } catch (error) {
//     logger.error('Error logging in', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 926
//       },
//       error: {
//         message: 'Error logging in: ' + error.message
//       }
//     });
//   }

// };const verifyUniqueKey = (providedKey, storedKey) => {
//   logger.info(`Provided UniqueKey: ${providedKey}`);
//   logger.info(`Stored UniqueKey: ${storedKey}`);
//   return providedKey === storedKey;
// };



const verifyUniqueKey = (providedKey, storedKey) => {
  logger.info(`Provided UniqueKey: ${providedKey}`);
  logger.info(`Stored UniqueKey: ${storedKey}`);
  return providedKey === storedKey;
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors occurred during login', errors);
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 923
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

  const { Username, Password } = req.body;

  const uniqueKey = req.headers['x-unique-key'];
  console.log("uniquekey", uniqueKey);

  try {
    const hospital = await Hospital.findOne({ where: { Username } });
    if (!hospital) {
      logger.warn(`Hospital with Username ${Username} not found`);
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 924
        },
        error: {
          message: 'Hospital not found'
        }
      });
    }
    
    // if (hospital.isEmailVerified !== 1) {
    //   logger.warn(`Email not verified for hospital with Username ${Username}`);
    //   return res.status(401).json({
    //     meta: {
    //       statusCode: 401,
    //       errorCode: 927
    //     },
    //     error: {
    //       message: 'Please verify your email before logging in'
    //     }
    //   });
    // }
    
    
    logger.info(`UniqueKey from request headers: ${uniqueKey}`);
    logger.info(`UniqueKey from database: ${hospital.UniqueKey}`);
    console.log(hospital.UniqueKey);

    // Highlighted changes: Replaced direct comparison with verifyUniqueKey function
    if (!verifyUniqueKey(uniqueKey, hospital.UniqueKey)) {
      logger.warn(`Invalid UniqueKey for hospital with Username ${Username}`);
      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 955
        },
        error: {
          message: 'Unauthorized'
        }
      });
    }

    const passwordMatch = await bcrypt.compare(Password, hospital.Password);
    
    if (!passwordMatch) {
      logger.warn(`Incorrect password for hospital with Username ${Username}`);
      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 925
        },
        error: {
          message: 'Incorrect password'
        }
      });
    }

    const Hospitaltoken = jwt.sign(
      { hospitalId: hospital.HospitalID, hospitalDatabase: hospital.HospitalDatabase },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const decodedToken = jwt.verify(Hospitaltoken, process.env.JWT_SECRET);

    logger.info(`Hospital with ID ${decodedToken.hospitalId} logged in successfully`);

    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: {
        Hospitaltoken,
        hospital: {
          id: decodedToken.hospitalId,
          username: hospital.Username,
          email: hospital.Email,
          hospitalDatabase: hospital.HospitalDatabase
        },
        message: 'Login successful and token generated.'
      }
    });
  } catch (error) {
    logger.error('Error logging in', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 926
      },
      error: {
        message: 'Error logging in: ' + error.message
      }
    });
  }
};
exports.requestPasswordReset = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors occurred during password reset request', errors);
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 957
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

  const uniqueKey = req.headers['x-unique-key'];

  if (!uniqueKey) {
    logger.error('Missing unique key in request headers');
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 958
      },
      error: {
        message: 'Missing unique key in request headers'
      }
    });
  }

  try {
    // Find hospital by uniqueKey
    const hospital = await Hospital.findOne({ where: { UniqueKey: uniqueKey } });
    if (!hospital) {
      logger.warn(`Hospital with UniqueKey ${uniqueKey} not found`);
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 959
        },
        error: {
          message: 'Hospital not found'
        }
      });
    }

    // Ensure managingCompanyEmail is available
    const managingCompanyEmail = hospital.ManagingCompanyEmail;
    if (!managingCompanyEmail) {
      logger.error(`Hospital with UniqueKey ${uniqueKey} does not have a ManagingCompanyEmail`);
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 960
        },
        error: {
          message: 'Hospital does not have a managing company email'
        }
      });
    }
    const crypto = require('crypto');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // 1 hour from now

    hospital.ResetToken = resetToken;
    hospital.ResetTokenExpires = resetTokenExpires;
    await hospital.save({ fields: ['ResetToken', 'ResetTokenExpires'] });

    const resetLink = `http://localhost:3000/api/v1/hospital/reset-password${resetToken}`;

    // Use the sendEmail function
    const emailResponse = await sendEmail(
      managingCompanyEmail,
      'Password Reset Request',
      `You requested a password reset. Click the link to reset your password: ${resetLink}`
    );

    if (emailResponse.meta.statusCode !== 200 )
      {
        

      throw new Error('Failed to send reset email ');
    }

    logger.info(`Password reset link sent to ${managingCompanyEmail}`);

    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: {
        message: 'Password reset link sent successfully'
      }
    });
  } catch (error) {
    logger.error('Error requesting password reset', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 960
      },
      error: {
        message: 'Error requesting password reset: ' + error.message
      }
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const hospital = await Hospital.findOne({
      where: {
        ResetToken: token,
        ResetTokenExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!hospital) {
      logger.warn('Invalid or expired reset token');
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 961
        },
        error: {
          message: 'Invalid or expired reset token'
        }
      });
    }

    // Hash the new password
    // const SALT_ROUNDS = 10;
    // const salt = await bcrypt.genSalt(SALT_ROUNDS);
    // const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    // logger.info(`New password hashed: ${hashedNewPassword}`);

    // Save the new password
    hospital.Password = newPassword;
    await hospital.save({ fields: ['Password'] });

    // Log the password stored in the database
    const storedPassword = hospital.Password;
    logger.info(`Password stored in database: ${storedPassword}`);

    // Reload the hospital instance from the database to ensure the password was saved correctly
    await hospital.reload();
    logger.info(`Reloaded password from database: ${hospital.Password}`);

    // Verify that the saved password matches the hashed password
    // const isMatch = await bcrypt.compare(newPassword, hospital.Password);
    // logger.info(`Passwords match: ${isMatch}`);
    // if (!isMatch) {
    //   logger.error('Password mismatch: hashed password does not match stored password');
    //   logger.error(`New password: ${newPassword}`);
    //   logger.error(`Hashed password: ${hashedNewPassword}`);
    //   logger.error(`Stored password: ${hospital.Password}`);
    //   return res.status(500).json({
    //     meta: {
    //       statusCode: 500,
    //       errorCode: 962
    //     },
    //     error: {
    //       message: 'Error resetting password: password mismatch'
    //     }
    //   });
    // }

    // Clear reset token and expiration time
    hospital.ResetToken = null;
    hospital.ResetTokenExpires = null;
    await hospital.save({ fields: ['ResetToken', 'ResetTokenExpires'] });
    logger.info('Reset token and expiration time cleared in the database');

    logger.info(`Password reset successfully for hospital with email ${hospital.Email}`);
    
    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: {
        message: 'Password reset successfully'
      }
    });
  } catch (error) {
    logger.error('Error resetting password', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 962
      },
      error: {
        message: 'Error resetting password: ' + error.message
      }
    });
  }
};


exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      logger.info('Validation errors occurred', errors);
      return res.status(400).json({
          meta: {
              statusCode: 400,
              errorCode: 963
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

  const { currentPassword, newPassword } = req.body;
  const uniqueKey = req.headers['x-unique-key'];

  try {
      const hospital = await Hospital.findOne({ where: { UniqueKey: uniqueKey } });
      if (!hospital) {
          logger.warn('Hospital not found with provided unique key');
          return res.status(404).json({
              meta: {
                  statusCode: 404,
                  errorCode: 964
              },
              error: {
                  message: 'Hospital not found'
              }
          });
      }

      // Uncomment this section if you want to verify the current password
      
      const passwordMatch = await bcrypt.compare(currentPassword, hospital.Password);
      if (!passwordMatch) {
          logger.warn('Current password is incorrect');
          return res.status(400).json({
              meta: {
                  statusCode: 400,
                  errorCode: 965
              },
              error: {
                  message: 'Current password is incorrect'
              }
          });
      }
      

      // const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      // logger.info(`New password hashed: ${hashedNewPassword}`);

      hospital.Password = newPassword;

      // Save the new password to the database
      await hospital.save({ fields: ['Password'] });

      // Log the password after it has been saved to the database
      const updatedHospital = await Hospital.findOne({ where: { UniqueKey: uniqueKey } });
      logger.info(`New password stored in database: ${updatedHospital.Password}`);

      logger.info(`Password changed successfully for hospital with email ${hospital.ManagingCompanyEmail}`);
      
      res.status(200).json({
          meta: {
              statusCode: 200
          },
          data: {
              message: 'Password changed successfully'
          }
      });
  } catch (error) {
      logger.error('Error changing password', { error: error.message });
      res.status(500).json({
          meta: {
              statusCode: 500,
              errorCode: 966
          },
          error: {
              message: 'Error changing password: ' + error.message
          }
      });
  }
};


exports.changeEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.info('Validation errors occurred', errors);
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 967
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

  const { ManagingCompanyEmail } = req.body;
  const uniqueKey = req.headers['x-unique-key'];

  try {
    const hospital = await Hospital.findOne({ where: { UniqueKey: uniqueKey } });
    if (!hospital) {
      logger.warn('Hospital not found with provided unique key');
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 968
        },
        error: {
          message: 'Hospital not found'
        }
      });
    }

    // Update hospital's email
    hospital.ManagingCompanyEmail = ManagingCompanyEmail;
    await hospital.save({ fields: ['ManagingCompanyEmail'] });
    logger.info(`Email updated successfully for hospital with unique key ${uniqueKey}`);

    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: {
        message: 'Email changed successfully'
      }
    });
  } catch (error) {
    logger.error('Error changing email', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 969
      },
      error: {
        message: 'Error changing email: ' + error.message
      }
    });
  }
};
















exports.ensureSequelizeInstance = (req, res, next) => {
  if (!req.hospitalDatabase) {
    logger.error('Database connection not established');
    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 927
      },
      
      error: {
        
        message: 'Database connection not established'
      }
    });
  }

  const sequelize = new Sequelize(
    req.hospitalDatabase,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT
    }
  );

  req.sequelize = sequelize;
  logger.info('Sequelize instance created successfully');
  next();
};

// exports.createUser =async (req, res) => {

 
//   const { name, username,phone,email,password,empid } = req.body;
//   const hospitalId = req.hospitalId;

//   try {
//     if (!password) {
//       throw new Error('Password is required');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds
//     const User = require('../models/user')(req.sequelize);
//     const verificationToken = uuidv4();

//     // Ensure the table exists
//     await User.sync();

//     const user = await User.create({ username, password: hashedPassword,hospitalId ,name,phone ,email,empid, emailtoken: verificationToken});
//     logger.info(`User created successfully with username: ${username}, hospitalId: ${hospitalId}`);



//     const verificationLink = `https://example.com/verify/${verificationToken}`; // Replace with your actual verification link

//     await sendEmail(User.email, 'Verify Your Email', `Click this link to verify your email: ${verificationLink}`);

//     res.status(201).json({
//       meta: {
//         statusCode: 200
//       },
//       data: {
//         userId: user.userId,
//         username: user.username
//       }
//     });
//   } catch (error) {
//     logger.error('Error creating user', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 928
//       },
//       error: {
//         message: 'Error creating user: ' + error.message
//       }
//     });
//   }
// };



exports.createUser = async (req, res) => {
  const { name, username, phone, email, password, empid ,usertype} = req.body;
  const hospitalId = req.hospitalId;

  try {
    if (!password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds
    const verificationToken = uuidv4();
    const tokenExpiration = new Date();
    tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 10); 
    const User = require('../models/user')(req.sequelize)

    // Ensure the table exists
    await User.sync();

    const user = await User.create({
      username,
      password: hashedPassword,
      hospitalId,
      name,
      phone,
      email,
      empid,
      usertype,
      emailtoken: verificationToken,
      createdBy: hospitalId
    });
    logger.info(`User created successfully with username: ${username}, hospitalId: ${hospitalId}`);

    const verificationLink = `http://localhost:3000/api/v1/hospital/verify/${verificationToken}`; // Replace with your actual verification link
    
    await sendEmail(email, 'Verify Your Email', `Click this link to verify your email: ${verificationLink}`);

    res.status(201).json({
      meta: {
        statusCode: 200
      },
      data: {
        userId: user.userId,
        username: user.username
      }
    });
  } catch (error) {
    logger.error('Error creating user', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 928
      },
      error: {
        message: 'Error creating user: ' + error.message
      }
    });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  const User = require('../models/user');

  try {
    // Find user by email token
    const user = await User(req.sequelize).findOne({ where: { emailtoken: token } });

    if (!user) {
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 952
        },
        error: {
          message: 'Invalid or expired verification token'
        }
      });
    }

    // Update user's email verification status
    user.is_emailVerify = true; // Ensure correct field name as per your model definition
    user.emailtoken = null; // Clear the token after verification
    await user.save();

    logger.info(`User email verified successfully with username: ${user.username}`);

    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: {
        message: 'Email verified successfully'
      }
    });
  } catch (error) {
    logger.error('Error verifying email', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 953
      },
      error: {
        message: 'Error verifying email: ' + error.message
      }
    });
  }
};


// exports.verifyEmail = async (req, res) => {
//   const { token } = req.params;
//   const User = require('../models/user')(req.sequelize);

//   try {
//     const user = await User.findOne({ where: { emailtoken: token } });

//     if (!user) {
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 929
//         },
//         error: {
//           message: 'Invalid or expired token'
//         }
//       });
//     }

//     user.emailVerified = true;
//     user.emailtoken = null;
//     await user.save();

//     res.status(200).json({
//       meta: {
//         statusCode: 200
//       },
//       data: {
//         message: 'Email verified successfully'
//       }
//     });
//   } catch (error) {
//     logger.error('Error verifying email', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 930
//       },
//       error: {
//         message: 'Error verifying email: ' + error.message
//       }
//     });
//   }
// };

// exports.verifyEmail = async (req, res) => {
//   const token = req.params.token;

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, 'your_secret_key'); // Replace 'your_secret_key' with your actual JWT secret key

//     console.log('Decoded token:', decoded);

//     // Extract the email from the decoded token
//     const email = decoded.email;
//     console.log('Email extracted from token:', email);

//     // Update the user's verification status in the database based on email
//     const [updatedRowsCount] = await User.update({ is_emailVerify: true }, { where: { email } });

//     // Check if any rows were updated
//     if (updatedRowsCount === 0) {
//       return res.status(404).json({
//         meta: {
//           statusCode: 404
//         },
//         data: {
//           message: 'User not found or already verified'
//         }
//       });
//     }

//     // Send a success response
//     logger.info({ message: 'Email verified successfully.' });
//     return res.status(200).json({
//       meta: {
//         statusCode: 200
//       },
//       data: {
//         message: 'Email verified successfully.'
//       }
//     });
//   } catch (error) {
//     // Handle token verification errors
//     console.error('Failed to verify email:', error);
//     return res.status(500).json({
//       meta: {
//         statusCode: 500
//       },
//       error: {
//         message: 'Failed to verify email',
//         error: error.message
//       }
//     });
//   }
// };

exports.getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const User = require('../models/user')(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      logger.warn(`User with ID ${id} not found`);
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 937
        },
        error: {
          message: 'User not found'
        }
      });
    }

    logger.info(`User with ID ${id} retrieved successfully`);
    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: {
        userId: user.userId,
        username: user.username,
        name:user.name,
        phone:user.phone

      }
    });
  } catch (error) {
    logger.error('Error retrieving user', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 931
      },
      error: {
        message: 'Error retrieving user: ' + error.message
      }
    });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  try {
    const User = require('../models/user')(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      logger.warn(`User with ID ${id} not found`);
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 932
        },
        error: {
          message: 'User not found'
        }
      });
    }

    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    logger.info(`User with ID ${id} updated successfully`);
    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: {
        userId: user.userId,
        username: user.username
      }
    });
  } catch (error) {
    logger.error('Error updating user', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 933
      },
      error: {
        message: 'Error updating user: ' + error.message
      }
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const User = require('../models/user')(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      logger.warn(`User with ID ${id} not found`);
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 934
        },
        error: {
          message: 'User not found'
        }
      });
    }

    await user.destroy();

    logger.info(`User with ID ${id} deleted successfully`);
    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: {
        message: 'User deleted successfully'
      }
    });
  } catch (error) {
    logger.error('Error deleting user', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 935
      },
      error: {
        message: 'Error deleting user: ' + error.message
      }
    });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const User = require('../models/user')(req.sequelize);
    const users = await User.findAll();

    logger.info(`Retrieved all users successfully`);

    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: users
    });
  } catch (error) {
    logger.error('Error retrieving all users', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 936
      },
      error: {
        message: 'Error retrieving all users: ' + error.message
      }
    });
  }
};























// exports.createUser = async (req, res,hospital) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     logger.warn('Validation errors occurred while creating user', errors);
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 930
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

//   const { username, email, password } = req.body;

//   try {
//     // Assuming sequelized is the Sequelize instance established for the hospital's database
//     const sequelize = new Sequelize(
//       hospital.HospitalDatabase,
//       process.env.DB_USER,
//       process.env.DB_PASSWORD,
//       {
//         host: process.env.DB_HOST,
//         dialect: process.env.DB_DIALECT
//       }
//     );

//     // Define the User model using the sequelize instance
//     const User = sequelize.define('User', {
//       // Define user attributes here
//       username: {
//         type: DataTypes.STRING,
//         allowNull: false
//       },
//       email: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true
//       },
//       password: {
//         type: DataTypes.STRING,
//         allowNull: false
//       }
//     });

//     // Sync the model with the database
//     await User.sync();

//     // Create the user
//     const newUser = await User.create({
//       username,
//       email,
//       password
//     });

//     logger.info('User created successfully', { userId: newUser.id });

//     res.status(201).json({
//       meta: {
//         statusCode: 201
//       },
//       data: newUser
//     });
//   } catch (error) {
//     logger.error('Error creating user', { error: error.message });
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 931
//       },
//       error: {
//         message: 'Error creating user: ' + error.message
//       }
//     });
//   }
// };
  

  
  


















// exports.login = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 920,
//       },
//       error: {
//         message: 'Validation errors occurred',
//         details: errors.array().map((err) => ({
//           field: err.param,
//           message: err.msg,
//         })),
//       },
//     });
//   }

//   const { Username, Password } = req.body;

//   try {
//     const hospital = await Hospital.findOne({ where: { Username } });

//     if (!hospital) {
//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 921,
//         },
//         error: {
//           message: 'Hospital not found',
//         },
//       });
//     }

//     const isPasswordValid = await bcrypt.compare(Password, hospital.Password);

//     if (!isPasswordValid) {
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 922,
//         },
//         error: {
//           message: 'Invalid password',
//         },
//       });
//     }

//     const token = jwt.sign(
//       { HospitalID: hospital.HospitalID, Username: hospital.Username },
//       JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//       },
//       data: {
//         token,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 923,
//       },
//       error: {
//         message: 'Error logging in: ' + error.message,
//       },
//     });
//   }
// };



