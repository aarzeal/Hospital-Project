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
const { User } = require('../models/user');
const CountAPI = require('../models/ApisCounts');
const redis = require('redis');
const{ redisClient, getAsync, setAsync }  = require('../Middleware/redisClient'); 
const client = redis.createClient();



const dotenv = require('dotenv');
dotenv.config();

exports.createHospital = async (req, res) => {
  const start = Date.now(); 
  // let end;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // const end = Date.now(); 
        logger.info('Validation errors occurred', errors);
        return res.status(400).json({
            meta: {
                statusCode: 400,
                errorCode: 912,
                // executionTime: `${end - start}ms`
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
      // const end = Date.now();
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 956,
                  //  executionTime: `${end - start}ms`
        },
        error: {
          message: 'Managing Company Email already exists'
        }
      });
    }
        const hospital = await Hospital.create(req.body);
        logger.info('Hospital created successfully', {
          hospitalId: hospital.HospitalID,
          // executionTime: `${end - start}ms`
        });

        // Generate database name (e.g., from HospitalDatabase field)
        const databaseName = hospital.HospitalDatabase.replace(/\s+/g, '_').toLowerCase();
        logger.info(`Generated database name: ${databaseName}`);

        // Create new database
        await sequelize.query(`CREATE DATABASE \`${databaseName}\``);
        logger.info(`Database ${databaseName} created successfully`);

        // const { sequelize: dynamicDb, testConnection } = createDynamicConnection(databaseName);
        
        // Test the connection to the new database
        // await testConnection();
        // logger.info(`Connected to database ${databaseName} successfully`);

        // Define and sync the UserMaster model in the new database
        // const UserMaster = createUserMasterModel(dynamicDb);

        // Sync all models
        // await dynamicDb.sync();
        logger.info(`Models synchronized successfully in database ${databaseName}`);



        const uniqueKey = uuidv4();
        logger.info(`Generated unique key: ${uniqueKey}`);

        hospital.UniqueKey = uniqueKey;
         await hospital.save({ fields: ['UniqueKey'] });
        
        logger.info(`Unique key stored in hospital record successfully`);
        // const end = Date.now();
        res.status(200).json({
            meta: {
                statusCode: 200,
                    // executionTime: `${end - start}ms`
            },
            data: hospital
        });
    } catch (error) {
      // const end = Date.now(); 
        logger.error('Error creating hospital', { error: error.message });
        res.status(400).json({
            meta: {
                statusCode: 400,
                errorCode: 913,
                          // executionTime: `${end - start}ms`
            },
            error: {
                message: 'Error creating hospital: ' + error.message
            }
        });
    }
};



// exports.createHospital = async (req, res) => {
//   const start = Date.now(); // Initialize start time at the beginning

//   // Ensure the res object is correctly defined
//   if (!res || typeof res.status !== 'function') {
//     console.error('Response object is not properly defined at the start of the function');
//     return;
//   }

//   // Validation Check
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     logger.info('Validation errors occurred', errors);
//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 912,
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

//   try {
//     // Check for existing hospital by ManagingCompanyEmail
//     const existingHospital = await Hospital.findOne({ where: { ManagingCompanyEmail: req.body.ManagingCompanyEmail } });
//     if (existingHospital) {
//       const end = Date.now();
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 956,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Managing Company Email already exists'
//         }
//       });
//     }

//     // Create Hospital
//     const hospital = await Hospital.create(req.body);
//     logger.info('Hospital created successfully', {
//       hospitalId: hospital.HospitalID,
//       executionTime: `${Date.now() - start}ms`
//     });

//     // Generate database name from HospitalDatabase field
//     const databaseName = hospital.HospitalDatabase.replace(/\s+/g, '_').toLowerCase();
//     logger.info(`Generated database name: ${databaseName}`);

//     // Create new database
//     await sequelize.query(`CREATE DATABASE \`${databaseName}\``);
//     logger.info(`Database ${databaseName} created successfully`);

//     // Create dynamic connection to the new database
//     const { sequelize: dynamicDb, testConnection } = createDynamicConnection(databaseName);

//     // Test the connection to the new database
//     await testConnection();
//     logger.info(`Connected to database ${databaseName} successfully`);

//     // Define and sync the UserMaster model in the new database
//     const UserMaster = createUserMasterModel(dynamicDb);
//     await dynamicDb.sync();
//     logger.info(`Models synchronized successfully in database ${databaseName}, executionTime: ${Date.now() - start}ms`);

//     // Generate and store unique key in the hospital record
//     const uniqueKey = uuidv4();
//     logger.info(`Generated unique key: ${uniqueKey}`);
//     hospital.UniqueKey = uniqueKey;
//     await hospital.save({ fields: ['UniqueKey'] });
//     logger.info(`Unique key stored in hospital record successfully, executionTime: ${Date.now() - start}ms`);

//     // Send response with successful hospital creation
//     const end = Date.now();
//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: hospital
//     });
//   } catch (error) {
//     // Catch any errors that occur during the hospital creation process
//     const end = Date.now();
//     logger.error('Error creating hospital', { error: error.message });

//     // Log the state of res to diagnose potential issues
//     console.error('Response object in catch block:', res);

//     // Ensure the response object is correctly handled in the catch block
//     if (res && typeof res.status === 'function') {
//       res.status(500).json({
//         meta: {
//           statusCode: 500,
//           errorCode: 913,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Error creating hospital: ' + error.message
//         }
//       });
//     } else {
//       console.error('Response object is not properly defined or corrupted in catch block');
//     }
//   }
// };





exports.getAllHospitals = async (req, res) => {
  const start = Date.now();
  try {
    const hospitals = await Hospital.findAll();
    logger.info('Retrieved all hospitals successfully');
    const end = Date.now();
    res.json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: hospitals
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error retrieving hospitals', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 914,
          executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving hospitals: ' + error.message
      }
    });
  }
};

// Get hospital by ID
exports.getHospitalById = async (req, res) => {
  const start = Date.now(); 
  const id = req.params.id;
  try {
    const hospital = await Hospital.findByPk(id);
    if (!hospital) {
      
      logger.warn(`Hospital with ID ${id} not found`);
      const end = Date.now(); 
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 915,
            executionTime: `${end - start}ms`
        },
        error: {
          message: 'Hospital not found'
        }
      });
    } else {
      const end = Date.now();
      logger.info(`Retrieved hospital with ID ${id} successfully`);
      res.json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`
          
        },
        data: hospital
      });
    }
  } catch (error) {
    const end = Date.now();
    logger.error('Error retrieving hospital', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 916,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving hospital: ' + error.message
      }
    });
  }
};

// Update hospital
exports.updateHospital = async (req, res) => {
  const start = Date.now();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors occurred while updating hospital', errors);
    const end = Date.now();
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 917,
        executionTime: `${end - start}ms`
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
      const end = Date.now();
logger.warn(`Hospital with ID ${id} not found for update, executionTime: ${end - start}ms`);

     
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 918,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Hospital not found'
        }
      });
    } else {
      const end = Date.now();
      logger.info(`Hospital with ID ${id} updated successfully, executionTime: ${end - start}ms`);
      
      res.json({
        meta: {
          statusCode: 200,
           executionTime: `${end - start}ms`
        },
        message: 'Hospital updated successfully'
      });
    }
  } catch (error) {
    const end = Date.now();
    logger.error(`Error updating hospital, executionTime: ${end - start}ms`, { error: error.message });
    
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 919,
         executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error updating hospital: ' + error.message
      }
    });
  }
};

// Delete hospital
exports.deleteHospital = async (req, res) => {
  const start = Date.now();
  const id = req.params.id;
  try {
    const deletedRows = await Hospital.destroy({
      where: { HospitalID: id }
    });
    if (deletedRows === 0) {
      const end = Date.now();
logger.warn(`Hospital with ID ${id} not found for deletion, executionTime: ${end - start}ms`);

    
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 920,
           executionTime: `${end - start}ms`
        },
        error: {
          message: 'Hospital not found'
        }
      });
    } else {
      const end = Date.now();
logger.info(`Hospital with ID ${id} deleted successfully, executionTime: ${end - start}ms`);

  
      res.json({
        meta: {
          statusCode: 200,
          executionTime: `${end - start}ms`
        },
        message: 'Hospital deleted successfully'
      });
    }
  } catch (error) {
    const end = Date.now();
    logger.error('Error deleting hospital', { error: error.message, executionTime: `${end - start}ms` });
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
  const start = Date.now(); 
  const { HospitalGroupIDR } = req.params;
  try {
    const hospitals = await Hospital.findAll({
      where: { HospitalGroupIDR }
    });
    const end = Date.now();
    logger.info(`Retrieved hospitals by HospitalGroupIDR: ${HospitalGroupIDR} successfully, executionTime: ${end - start}ms`);
    
 
    res.json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: hospitals
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error retrieving hospitals by HospitalGroupIDR', { error: error.message, executionTime: `${end - start}ms` });
    
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 922,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving hospitals by HospitalGroupIDR: ' + error.message
      }
    });
  }
};


exports.getAllHospitalsByPagination = async (req, res) => {
  const start = Date.now();
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5; // Default limit is 5, adjust as per your requirement

  const offset = (page - 1) * limit;

  try {
    const totalCount = await Hospital.count();
    const hospitals = await Hospital.findAll({
      offset,
      limit,
      // order: [[ 'ASC']] // Example ordering by createdAt, adjust as per your requirement
    });

    const end = Date.now();
    logger.info(`Retrieved hospitals for page ${page} with limit ${limit} successfully, executionTime: ${end - start}ms`);
    
    res.status(200).json({
      meta: {
        statusCode: 200,
        totalCount,
        page,
        limit,
        executionTime: `${end - start}ms`
      },
      data: hospitals
    });
  } catch (error) {
    const end = Date.now();
    logger.error(`Error retrieving hospitals with pagination, executionTime: ${end - start}ms`, { error: error.message });
    
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 923,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving hospitals with pagination: ' + error.message
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
  const start = Date.now(); 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    logger.warn(`Validation errors occurred during login, executionTime: ${end - start}ms`, errors);
    
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 923,
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

  const { Username, Password } = req.body;

  const uniqueKey = req.headers['x-unique-key'];
  console.log("uniquekey", uniqueKey);

  try {
    const hospital = await Hospital.findOne({ where: { Username } });
    if (!hospital) {
      const end = Date.now();
logger.warn(`Hospital with Username ${Username} not found, executionTime: ${end - start}ms`);

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 924,
          executionTime: `${end - start}ms`
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
      const end = Date.now();
logger.warn(`Invalid UniqueKey for hospital with Username ${Username}, executionTime: ${end - start}ms`);

      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 955,
              executionTime: `${end - start}ms`
        },
        error: {
          message: 'Unauthorized'
        }
      });
    }

    const passwordMatch = await bcrypt.compare(Password, hospital.Password);
    
    if (!passwordMatch) {
      const end = Date.now();
logger.warn(`Incorrect password for hospital with Username ${Username}, executionTime: ${end - start}ms`);

      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 925,
             executionTime: `${end - start}ms`
        },
        error: {
          message: 'Incorrect password'
        }
      });
    }

    // const Hospitaltoken = jwt.sign(
    //   { hospitalId: hospital.HospitalID,
    //      hospitalDatabase: hospital.HospitalDatabase,
    //      hospitalGroupIDR:hospital.HospitalGroupIDR,
    //      hospitalName: hospital.HospitalName },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '24h' }
    // );

    const Hospitaltoken = jwt.sign(
      {
        hospitalId: hospital.HospitalID,
        hospitalDatabase: hospital.HospitalDatabase,
        hospitalGroupIDR: hospital.HospitalGroupIDR,
        hospitalName: hospital.HospitalName,
        ManagingCompanyAdd1:hospital.ManagingCompanyAdd1,
        ManagingCompanyEmail:hospital.ManagingCompanyEmail
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );



    const decodedToken = jwt.verify(Hospitaltoken, process.env.JWT_SECRET);

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decodedToken.exp - currentTime;
    const expiresInMinutes = Math.floor(expiresIn / 60);
    console.log(`Token expires in: ${expiresIn} seconds`);

    console.log("Decoded Token:", decodedToken);
    const end = Date.now();
    logger.info(`Hospital with ID ${decodedToken.hospitalId} logged in successfully, executionTime: ${end - start}ms`);
    
    ////////////////Count apis 


    // const method = req.method; 
    // const city = req.body.city || 'Unknown'; 
    // // Using the HTTP method from the request
    // // try {
    //   await CountAPI.create({
    //     Apiname: 'login',
    //     location: city,
    //     createdby: decodedToken.hospitalId,
    //     ApiMethod: method,
    //     createdname: Username
    //   });
    // }
    //  catch (err) {
    //   logger.error('Error creating CountAPI entry', { error: err.message });
    // }

    res.status(200).json({
      meta: {
        statusCode: 200,
         executionTime: `${end - start}ms`
      },
      data: {
        Hospitaltoken,
        expiresInMinutes: `${expiresInMinutes} min`,
        
        hospital: {
          id: decodedToken.hospitalId,
          username: hospital.Username,
          email: hospital.Email,
          hospitalDatabase: hospital.HospitalDatabase,
          HospitalGroupIDR:hospital.HospitalGroupIDR,
          HospitalName: hospital.HospitalName,
          ManagingCompanyAdd1:hospital.ManagingCompanyAdd1,
        ManagingCompanyEmail:hospital.ManagingCompanyEmail
         
        },
        message: 'Login successful and token generated.'
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error logging in', { error: error.message, executionTime: `${end - start}ms` });
    
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 926,
                executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error logging in: ' + error.message
      }
    });
  }
};









exports.requestPasswordReset = async (req, res) => {
  const start = Date.now();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    logger.warn('Validation errors occurred during password reset request', { errors, executionTime: `${end - start}ms` });
    
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 957,
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

  const uniqueKey = req.headers['x-unique-key'];

  if (!uniqueKey) {
    const end = Date.now();
    logger.error('Missing unique key in request headers', { executionTime: `${end - start}ms` });
    
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 958,
         executionTime: `${end - start}ms`
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
      const end = Date.now();
      logger.warn(`Hospital with UniqueKey ${uniqueKey} not found`, { executionTime: `${end - start}ms` });
      
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 959,
          executionTime: `${end - start}ms`

        },
        error: {
          message: 'Hospital not found'
        }
      });
    }

    // Ensure managingCompanyEmail is available
    const managingCompanyEmail = hospital.ManagingCompanyEmail;
    if (!managingCompanyEmail) {
      const end = Date.now();
logger.error(`Hospital with UniqueKey ${uniqueKey} does not have a ManagingCompanyEmail`, { executionTime: `${end - start}ms` });

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 960,
            executionTime: `${end - start}ms`
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
    const end = Date.now();
logger.info(`Password reset link sent to ${managingCompanyEmail}`, { executionTime: `${end - start}ms` });


    res.status(200).json({
      meta: {
        statusCode: 200,
         executionTime: `${end - start}ms`
      },
      data: {
        message: 'Password reset link sent successfully'
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error requesting password reset', { error: error.message, executionTime: `${end - start}ms` });
    
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 960,
           executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error requesting password reset: ' + error.message
      }
    });
  }
};

exports.resetPassword = async (req, res) => {
  const start = Date.now();
  const { token, newPassword } = req.body;

  try {
    const hospital = await Hospital.findOne({
      where: {
        ResetToken: token,
        ResetTokenExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!hospital) {
      
      const end = Date.now();
      logger.warn('Invalid or expired reset token', { executionTime: `${end - start}ms` });
      
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
    const end = Date.now();
logger.info(`Password reset successfully for hospital with email ${hospital.Email}`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
         executionTime: `${end - start}ms`
      },
      data: {
        message: 'Password reset successfully'
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error resetting password', { error: error.message, executionTime: `${end - start}ms` });
    
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 962,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error resetting password: ' + error.message
      }
    });
  }
};


exports.changePassword = async (req, res) => {
  const start = Date.now();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    logger.info('Validation errors occurred', { errors, executionTime: `${end - start}ms` });
    
      return res.status(400).json({
          meta: {
              statusCode: 400,
              errorCode: 963,
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

  const { currentPassword, newPassword } = req.body;
  const uniqueKey = req.headers['x-unique-key'];

  try {
      const hospital = await Hospital.findOne({ where: { UniqueKey: uniqueKey } });
      if (!hospital) {
        const end = Date.now();
        logger.warn('Hospital not found with provided unique key', { uniqueKey, executionTime: `${end - start}ms` });
        
          return res.status(404).json({
              meta: {
                  statusCode: 404,
                  errorCode: 964,
                    executionTime: `${end - start}ms`
              },
              error: {
                  message: 'Hospital not found'
              }
          });
      }

      // Uncomment this section if you want to verify the current password
      
      const passwordMatch = await bcrypt.compare(currentPassword, hospital.Password);
      if (!passwordMatch) {
        const end = Date.now();
        logger.warn('Current password is incorrect', { executionTime: `${end - start}ms` });
        
          return res.status(400).json({
              meta: {
                  statusCode: 400,
                  errorCode: 965,
                  executionTime: `${end - start}ms`
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

      const end = Date.now();
      logger.info(`Password changed successfully for hospital with email ${hospital.ManagingCompanyEmail}`, { executionTime: `${end - start}ms` });
      
      
      res.status(200).json({
          meta: {
              statusCode: 200
          },
          data: {
              message: 'Password changed successfully'
          }
      });
  } catch (error) {
    const end = Date.now();
logger.error('Error changing password', { error: error.message, executionTime: `${end - start}ms` });

      res.status(500).json({
          meta: {
              statusCode: 500,
              errorCode: 966,
              executionTime: `${end - start}ms`
          },
          error: {
              message: 'Error changing password: ' + error.message
          }
      });
  }
};


exports.changeEmail = async (req, res) => {
  const start = Date.now();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    logger.info('Validation errors occurred', errors);
    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 967,
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

  const { ManagingCompanyEmail } = req.body;
  const uniqueKey = req.headers['x-unique-key'];

  try {
    const hospital = await Hospital.findOne({ where: { UniqueKey: uniqueKey } });
    if (!hospital) {
      const end = Date.now();
logger.warn('Hospital not found with provided unique key', { uniqueKey: providedUniqueKey, executionTime: `${end - start}ms` });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 968,
           executionTime: `${end - start}ms`
        },
        error: {
          message: 'Hospital not found'
        }
      });
    }

    // Update hospital's email
    hospital.ManagingCompanyEmail = ManagingCompanyEmail;
    await hospital.save({ fields: ['ManagingCompanyEmail'] });
    const end = Date.now();
logger.info(`Email updated successfully for hospital with unique key ${uniqueKey}`, { uniqueKey, executionTime: `${end - start}ms` });


    res.status(200).json({
      meta: {
        statusCode: 200,
         executionTime: `${end - start}ms`
      },
      data: {
        message: 'Email changed successfully'
      }
    });
  } catch (error) {
    const end = Date.now();
logger.error('Error changing email', { error: error.message, executionTime: `${end - start}ms` });

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
  const start = Date.now();
  if (!req.hospitalDatabase) {
   
    const end = Date.now();
    logger.error('Database connection not established', { executionTime: `${end - start}ms` });
    
    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 927,
        executionTime: `${end - start}ms`
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

  sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch(error => {
    console.error('Error synchronizing the database:', error);
  });
  
};


// exports.ensureSequelizeInstance = (req, res, next) => {
//   const start = Date.now();
//   if (!req.hospitalDatabase) {

//     const end = Date.now();
//     logger.error('Database connection not established', { executionTime: `${end - start}ms` });

//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 927,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Database connection not established'
//       }
//     });
//   }

//   const sequelize = new Sequelize(
//     req.hospitalDatabase,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//       host: process.env.DB_HOST,
//       dialect: process.env.DB_DIALECT
//     }
//   );

//   req.sequelize = sequelize;
//   logger.info('Sequelize instance created successfully');
//   next();

//   sequelize.sync({ alter: true })
//     .then(() => {
//       console.log('Database synchronized successfully.');
//     })
//     .catch(error => {
//       console.error('Error synchronizing the database:', error);
//     });
// };





//     // Import models
//     const Hospital = require('../models/HospitalModel')(sequelize, DataTypes);
//     const Department = require('../models/DepartmentModel')(sequelize, DataTypes);
//     // const Designation = require('../models/DesignationModel')(sequelize, DataTypes);

//     // Define associations
//     if (typeof Hospital.associate === 'function') {
//       Hospital.associate({ Department/*, Designation*/  });
//     }
//     if (typeof Department.associate === 'function') {
//       Department.associate({ Hospital });
//     }
//     // if (typeof Designation.associate === 'function') {
//     //   Designation.associate({ Hospital });
//     // }

//     await sequelize.sync({ force: true }); // Use force: true to recreate the table if it exists

//     console.log('Database & tables created!');
//     req.sequelize = sequelize;
//     logger.info('Sequelize instance created successfully');
//     next();
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error syncing database', {
//       executionTime: `${end - start}ms`,
//       error: error.message,
//       stack: error.stack
//     });
//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 928,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error syncing database',
//         details: error.message
//       }
//     });
//   }
// };


exports.createUser = async (req, res) => {
  const start = Date.now();
  const { name, username, phone, email, password, empid ,usertype,Reserve1, Reserve2, Reserve3, Reserve4} = req.body;
  const hospitalId = req.hospitalId;

  try {
    if (!password) {
      const end = Date.now();
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
      createdBy: hospitalId,Reserve1, Reserve2, Reserve3, Reserve4
    });
    logger.info(`User created successfully with username: ${username}, hospitalId: ${hospitalId}`);

    const verificationLink = `http://localhost:3000/api/v1/hospital/verify/${verificationToken}`; // Replace with your actual verification link
    
    await sendEmail(email, 'Verify Your Email', `Click this link to verify your email: ${verificationLink}`);
    const end = Date.now();
    res.status(201).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        // userId: user.userId,
        // username: user.username
        user
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error creating user', { error: error.message, executionTime: `${end - start}ms` });
    
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 928,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error creating user: ' + error.message
      }
    });
  }
};

exports.verifyEmail = async (req, res) => {
  const start = Date.now();
  const { token } = req.params;
  const User = require('../models/user');

  try {
    // Find user by email token
    const user = await User(req.sequelize).findOne({ where: { emailtoken: token } });

    if (!user) {
      const end = Date.now();
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 952
          ,
        executionTime: `${end - start}ms`
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
    const end = Date.now();
logger.info(`User email verified successfully with username: ${user.username}`, { executionTime: `${end - start}ms` });


    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        message: 'Email verified successfully'
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error verifying email', { error: error.message, executionTime: `${end - start}ms` });
    
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 953,
        executionTime: `${end - start}ms`
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
  const start = Date.now();
  const { id } = req.params;

  try {

    const User = require('../models/user')(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      const end = Date.now();
      logger.warn(`User with ID ${id} not found`, { executionTime: `${end - start}ms` });
      
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 937,
        executionTime: `${end - start}ms`
        },
        error: {
          message: 'User not found'
        }
      });
    }

    const end = Date.now();
    logger.info(`User with ID ${id} retrieved successfully`, { executionTime: `${end - start}ms` });
    
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        userId: user.userId,
        username: user.username,
        name:user.name,
        phone:user.phone

      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error retrieving user', { error: error.message, executionTime: `${end - start}ms` });
    
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 931,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving user: ' + error.message
      }
    });
  }
};

exports.updateUser = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;
  const { username, password } = req.body;

  try {

    const User = require('../models/user')(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      const end = Date.now();
logger.warn(`User with ID ${id} not found`, { executionTime: `${end - start}ms` });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 932,
        executionTime: `${end - start}ms`
        },
        error: {
          message: 'User not found'
        }
      });
    }

    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    const end = Date.now();
logger.info(`User with ID ${id} updated successfully`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        userId: user.userId,
        username: user.username
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error updating user', { error: error.message, executionTime: `${end - start}ms` });
    
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 933,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error updating user: ' + error.message
      }
    });
  }
};

exports.deleteUser = async (req, res) => {
  const start = Date.now();
  const { id } = req.params;

  try {
    const User = require('../models/user')(req.sequelize);
    const user = await User.findByPk(id);

    if (!user) {
      const end = Date.now();
      logger.warn(`User with ID ${id} not found`, { executionTime: `${end - start}ms` });
      
      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 934,
        executionTime: `${end - start}ms`
        },
        error: {
          message: 'User not found'
        }
      });
    }

    await user.destroy();

    const end = Date.now();
    logger.info(`User with ID ${id} deleted successfully`, { executionTime: `${end - start}ms` });
    
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        message: 'User deleted successfully'
      }
    });
  } catch (error) {
    const end = Date.now();
logger.error('Error deleting user', { error: error.message, executionTime: `${end - start}ms` });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 935,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error deleting user: ' + error.message
      }
    });
  }
};
exports.getAllUsers = async (req, res) => {
  const start = Date.now();
  try {
    const User = require('../models/user')(req.sequelize);
    const users = await User.findAll();

    const end = Date.now();
logger.info(`Retrieved all users successfully`, { executionTime: `${end - start}ms` });


    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: users
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error retrieving all users', { error: error.message, executionTime: `${end - start}ms` });
    
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 936,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving all users: ' + error.message
      }
    });
  }
};
exports.getAllUsersByPagination = async (req, res) => {
  const start = Date.now();
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5; // Default limit is 5, adjust as per your requirement

  const offset = (page - 1) * limit;

  try {
    const totalCount = await User(req.sequelize).count();
    const users = await User(req.sequelize).findAll({
      offset,
      limit,
      order: [['createdAt', 'ASC']] // Example ordering by createdAt, adjust as per your requirement
    });
    const end = Date.now();
    logger.info(`Retrieved users for page ${page} with limit ${limit} successfully`, { executionTime: `${end - start}ms` });
    

    res.status(200).json({
      meta: {
        statusCode: 200,
        totalCount,
        page,
        limit,
        executionTime: `${end - start}ms`
      },
      data: users
    });
  } catch (error) {
    const end = Date.now();
logger.error('Error retrieving users with pagination', { error: error.message, executionTime: `${end - start}ms` });


    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 937,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error retrieving users with pagination: ' + error.message
      }
    });
  }
};

// exports.loginUser = async (req, res) => {
//   const start = Date.now();
//   const { Username, Password } = req.body;

//   if (!Username || !Password) {
//     const end = Date.now();
//     logger.error('Username or Password not provided', { executionTime: `${end - start}ms` });

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 930,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Username and Password are required'
//       }
//     });
//   }

//   try {
//     const User = require('../models/user')(req.sequelize);
//     console.log('Username:', Username); // Debugging log
//     const user = await User.findOne({ where: { username: Username } });

//     if (!user || !await bcrypt.compare(Password, user.password)) {
//       const end = Date.now();
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 925,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Invalid username or password'
//         }
//       });
//     }

//     const token = jwt.sign(
//       { userId: user.userId },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     const end = Date.now();
//     return res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         token,
//         user: {
//           id: user.userId,
//           username: user.username,
//           email: user.email
//         },
//         message: 'Login successful'
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 926,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error logging in: ' + error.message
//       }
//     });
//   }
// };



// client.on('error', (err) => {
//   console.error('Redis error:', err);
// });
// exports.HospitalCode = async (req, res) => {

//   const start = Date.now();
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     logger.warn(`Validation errors occurred during login, executionTime: ${end - start}ms`, errors);

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 1044,
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

//   const { HospitalCode } = req.body;

//   try {
//     const hospital = await Hospital.findOne({ where: { HospitalCode } });
//     if (!hospital) {
//       const end = Date.now();
//       logger.warn(`Hospital with HospitalCode ${HospitalCode} not found, executionTime: ${end - start}ms`);

//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 1045,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Hospital not found'
//         }
//       });
//     }
//      // Check if the hospital already has a valid token in Redis
//     //  client.get(hospital.HospitalID.toString(), (err, existingToken) => {
//     //   if (err) {
//     //     const end = Date.now();
//     //     logger.error('Error checking Redis for existing token', { executionTime: `${end - start}ms`, error: err });

//     //     return res.status(500).json({
//     //       meta: {
//     //         statusCode: 500,
//     //         errorCode: 1050,
//     //         executionTime: `${end - start}ms`
//     //       },
//     //       error: {
//     //         message: 'Error checking existing login session'
//     //       }
//     //     });
//     //   }

//     //   if (existingToken) {
//     //     const end = Date.now();
//     //     return res.status(400).json({
//     //       meta: {
//     //         statusCode: 400,
//     //         errorCode: 1051,
//     //         executionTime: `${end - start}ms`
//     //       },
//     //       error: {
//     //         message: 'Hospital already logged in'
//     //       }
//     //     });
//     //   }
//     // })
//   // Generate a new token
//     const Hospitaltoken = jwt.sign(
//       { hospitalId: hospital.HospitalID, hospitalDatabase: hospital.HospitalDatabase, hospitalGroupIDR: hospital.HospitalGroupIDR },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//   // // Store the token in Redis with an expiration time
//   // redisClient.set(hospital.HospitalID.toString(), Hospitaltoken, 'EX', 24 * 60 * 60, (err, reply) => {
//   //   if (err) {
//   //     const end = Date.now();
//   //     logger.error('Error storing token in Redis', { executionTime: `${end - start}ms`, error: err });

//   //     return res.status(500).json({
//   //       meta: {
//   //         statusCode: 500,
//   //         errorCode: 1052,
//   //         executionTime: `${end - start}ms`
//   //       },
//   //       error: {
//   //         message: 'Error storing login session'
//   //       }
//   //     });
//   //   }

//     const end = Date.now();
//     logger.info(`Hospital with HospitalCode ${HospitalCode} found successfully, executionTime: ${end - start}ms`);

//     req.hospitalDatabase = hospital.HospitalDatabase;
//     const decodedToken = jwt.decode(Hospitaltoken);
//     const currentTime = Math.floor(Date.now() / 1000);
//     const expiresIn = decodedToken.exp - currentTime;
//     const expiresInMinutes = Math.floor(expiresIn / 60);
//     console.log(`Token expires in: ${expiresIn} seconds`);

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         Hospitaltoken,
//         expiresInMinutes: `${expiresInMinutes} min`,
//         hospital: {
//           hospitalId: hospital.HospitalID,
//           hospitalDatabase: hospital.HospitalDatabase,
//           hospitalGroupIDR: hospital.HospitalGroupIDR
//         },
//         message: 'Database name found successfully'
//       }
//     });
//   // });

//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error finding hospital', { error: error.message, executionTime: `${end - start}ms` });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 1046,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error finding hospital: ' + error.message
//       }
//     });
//   }
// };

// exports.HospitalCode = async (req, res) => {
//   const start = Date.now();
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const end = Date.now();
//     logger.warn(`Validation errors occurred during login, executionTime: ${end - start}ms`, errors);

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 1044,
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

//   const { HospitalCode } = req.body;

//   try {
//     const hospital = await Hospital.findOne({ where: { HospitalCode } });
//     if (!hospital) {
//       const end = Date.now();
//       logger.warn(`Hospital with HospitalCode ${HospitalCode} not found, executionTime: ${end - start}ms`);

//       return res.status(404).json({
//         meta: {
//           statusCode: 404,
//           errorCode: 1045,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Hospital not found'
//         }
//       });
//     }

//     // Check if the hospital already has a valid token in Redis
//     const existingToken = await getAsync(hospital.HospitalID.toString());
//     if (existingToken) {
//       const end = Date.now();
//       return res.status(400).json({
//         meta: {
//           statusCode: 400,
//           errorCode: 1051,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Hospital already logged in'
//         }
//       });
//     }

//     // Generate a new token
//     const Hospitaltoken = jwt.sign(
//       { hospitalId: hospital.HospitalID, hospitalDatabase: hospital.HospitalDatabase, hospitalGroupIDR: hospital.HospitalGroupIDR },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     // Store the token in Redis with an expiration time
//     await setAsync(hospital.HospitalID.toString(), Hospitaltoken, 'EX', 24 * 60 * 60);

//     const end = Date.now();
//     logger.info(`Hospital with HospitalCode ${HospitalCode} found successfully, executionTime: ${end - start}ms`);

//     req.hospitalDatabase = hospital.HospitalDatabase;
//     const decodedToken = jwt.decode(Hospitaltoken);
//     const currentTime = Math.floor(Date.now() / 1000);
//     const expiresIn = decodedToken.exp - currentTime;
//     const expiresInMinutes = Math.floor(expiresIn / 60);
//     console.log(`Token expires in: ${expiresIn} seconds`);

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         Hospitaltoken,
//         expiresInMinutes: `${expiresInMinutes} min`,
//         hospital: {
//           hospitalId: hospital.HospitalID,
//           hospitalDatabase: hospital.HospitalDatabase,
//           hospitalGroupIDR: hospital.HospitalGroupIDR
//         },
//         message: 'Database name found successfully'
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     logger.error('Error finding hospital', { error: error.message, executionTime: `${end - start}ms` });

//     res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 1046,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error finding hospital: ' + error.message
//       }
//     });
//   }
// };


exports.HospitalCode = async (req, res) => {
  const start = Date.now();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    logger.warn(`Validation errors occurred during login, executionTime: ${end - start}ms`, errors);

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1044,
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

  const { HospitalCode } = req.body;

  try {
    const hospital = await Hospital.findOne({ where: { HospitalCode } });
    if (!hospital) {
      const end = Date.now();
      logger.warn(`Hospital with HospitalCode ${HospitalCode} not found, executionTime: ${end - start}ms`);

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 1045,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Hospital not found'
        }
      });
    }

    // Check if the hospital already has a valid token in Redis
    const existingToken = await getAsync(hospital.HospitalID.toString());
    let Hospitaltoken = existingToken;

    // If token is not present, generate a new one
    if (!existingToken) {
      Hospitaltoken = jwt.sign(
        { hospitalId: hospital.HospitalID, hospitalDatabase: hospital.HospitalDatabase, hospitalGroupIDR: hospital.HospitalGroupIDR },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Store the new token in Redis with an expiration time
      await setAsync(hospital.HospitalID.toString(), Hospitaltoken, 'EX', 24 * 60 * 60);
    }

    const end = Date.now();
    logger.info(`Hospital with HospitalCode ${HospitalCode} found successfully, executionTime: ${end - start}ms`);

    req.hospitalDatabase = hospital.HospitalDatabase;
    const decodedToken = jwt.decode(Hospitaltoken);
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decodedToken.exp - currentTime;
    const expiresInMinutes = Math.floor(expiresIn / 60);
    console.log(`Token expires in: ${expiresIn} seconds`);

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        Hospitaltoken,
        expiresInMinutes: `${expiresInMinutes} min`,
        hospital: {
          hospitalId: hospital.HospitalID,
          hospitalDatabase: hospital.HospitalDatabase,
          hospitalGroupIDR: hospital.HospitalGroupIDR
        },
        message: 'Database name found successfully'
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error finding hospital', { error: error.message, executionTime: `${end - start}ms` });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1046,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error finding hospital: ' + error.message
      }
    });
  }
};

// exports.loginUser = async (req, res) => {
//   const start = Date.now();
//   const { Username, Password } = req.body;

//   if (!Username || !Password) {
//     const end = Date.now();
//     logger.error('Username or Password not provided', { executionTime: `${end - start}ms` });

//     return res.status(400).json({
//       meta: {
//         statusCode: 400,
//         errorCode: 1047,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Username and Password are required'
//       }
//     });
//   }

//   try {
//     const User = require('../models/user')(req.sequelize);
//     console.log('Username:', Username); // Debugging log
//     const user = await User.findOne({ where: { username: Username } });

//     if (!user || !await bcrypt.compare(Password, user.password)) {
//       const end = Date.now();
//       return res.status(401).json({
//         meta: {
//           statusCode: 401,
//           errorCode: 1048,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Invalid username or password'
//         }
//       });
//     }
//     if (user.is_emailVerify !== '1' || user.phoneverify !== '1') {
//       const end = Date.now();
//       return res.status(403).json({
//         meta: {
//           statusCode: 403,
//           errorCode: 1049,
//           executionTime: `${end - start}ms`
//         },
//         error: {
//           message: 'Email or phone not verified. Please verify email and phone.'
//         }
//       });
//     }


//     const AccessToken = jwt.sign(
//       { userId: user.userId,
//         username :user.username,
//         HospitalId :user.hospitalId



//        },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     const decodedToken = jwt.decode(AccessToken);
//     const currentTime = Math.floor(Date.now() / 1000);
//     const expiresIn = decodedToken.exp - currentTime;
//     const expiresInMinutes = Math.floor(expiresIn / 60);
//     console.log(`Token expires in: ${expiresIn} seconds`);



//     const end = Date.now();
//     return res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime: `${end - start}ms`
//       },
//       data: {
//         AccessToken,
//       expiresInMinutes: `${expiresInMinutes} min`,
//         user: {
//           id: user.userId,
//           username: user.username,
//           email: user.email
//         },
//         message: 'Login successful'
//       }
//     });
//   } catch (error) {
//     const end = Date.now();
//     return res.status(500).json({
//       meta: {
//         statusCode: 500,
//         errorCode: 1050,
//         executionTime: `${end - start}ms`
//       },
//       error: {
//         message: 'Error logging in: ' + error.message
//       }
//     });
//   }
// };



exports.loginUser = async (req, res) => {
  const start = Date.now();
  const { Username, Password } = req.body;

  if (!Username || !Password) {
    const end = Date.now();
    logger.error('Username or Password not provided', { executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1047,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Username and Password are required'
      }
    });
  }

  try {
    const User = require('../models/user')(req.sequelize);
    console.log('Username:', Username); // Debugging log
    const user = await User.findOne({ where: { username: Username } });

    if (!user || !await bcrypt.compare(Password, user.password)) {
      const end = Date.now();
      logger.error('Invalid username or password', { executionTime: `${end - start}ms` });

      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 1048,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Invalid username or password'
        }
      });
    }

    if (user.is_emailVerify !== '1' || user.phoneverify !== '1') {
      const end = Date.now();
      logger.error('Email or phone not verified', { executionTime: `${end - start}ms` });

      return res.status(403).json({
        meta: {
          statusCode: 403,
          errorCode: 1049,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Email or phone not verified. Please verify email and phone.'
        }
      });
    }

    // Check if the user already has a valid token in Redis
    const existingToken = await getAsync(user.userId.toString());
    let AccessToken = existingToken;

    // If token is not present, generate a new one
    if (!existingToken) {
      AccessToken = jwt.sign(
        { userId: user.userId, username: user.username, HospitalId: user.hospitalId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Store the new token in Redis with an expiration time
      await setAsync(user.userId.toString(), AccessToken, 'EX', 24 * 60 * 60);
    }

    const decodedToken = jwt.decode(AccessToken);
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decodedToken.exp - currentTime;
    const expiresInMinutes = Math.floor(expiresIn / 60);
    console.log(`Token expires in: ${expiresIn} seconds`);

    const end = Date.now();
    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        AccessToken,
        expiresInMinutes: `${expiresInMinutes} min`,
        user: {
          id: user.userId,
          username: user.username,
          email: user.email
        },
        message: 'Login successful'
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error logging in', { error: error.message, executionTime: `${end - start}ms` });

    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1050,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error logging in: ' + error.message
      }
    });
  }
};
exports.getProfile = (req, res) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({
      meta: {
        statusCode: 401,
        errorCode: 401,
        message: 'No token provided'
      }
    });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); // Adjust the secret as necessary

    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: {
        userId: decoded.userId || 'Unknown',
        hospitalId: decoded.hospitalId || 'Unknown',
        // Add other fields you have in the token
      }
    });
  } catch (error) {
    logger.error('Failed to authenticate token', { error: error.message });
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 500,
        message: 'Failed to authenticate token'
      }
    });
  }
};

exports.requestUserPasswordReset = async (req, res) => {
  const { User } = require('../models/user');
  const start = Date.now();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    logger.warn('Validation errors occurred during password reset request', { errors, executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 957,
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

  const { email } = req.body;

  if (!email) {
    const end = Date.now();
    logger.error('Email not provided', { executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 958,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Email is required'
      }
    });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      const end = Date.now();
      logger.warn(`User with email ${email} not found`, { executionTime: `${end - start}ms` });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 959,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'User not found'
        }
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `http://localhost:3000/api/v1/hospital/reset-Userpassword/${resetToken}`;

    const emailResponse = await sendEmail(
      email,
      'Password Reset Request',
      `You requested a password reset. Click the link to reset your password: ${resetLink}`
    );

    if (emailResponse.meta.statusCode !== 200) {
      throw new Error('Failed to send reset email');
    }

    const end = Date.now();
    logger.info(`Password reset link sent to ${email}`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        message: 'Password reset link sent successfully'
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error requesting password reset', { error: error.message, executionTime: `${end - start}ms` });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 960,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error requesting password reset: ' + error.message
      }
    });
  }
};
exports.resetuserPassword = async (req, res) => {
  const start = Date.now();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const end = Date.now();
    logger.warn('Validation errors occurred during password reset', { errors, executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 961,
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

  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      const end = Date.now();
      logger.warn('Invalid or expired reset token', { executionTime: `${end - start}ms` });

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 962,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Invalid or expired reset token'
        }
      });
    }

    const SALT_ROUNDS = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    user.password = hashedNewPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    const end = Date.now();
    logger.info(`Password reset successfully for user with email ${user.email}`, { executionTime: `${end - start}ms` });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        message: 'Password reset successfully'
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error resetting password', { error: error.message, executionTime: `${end - start}ms` });

    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 963,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error resetting password: ' + error.message
      }
    });
  }
};





exports.decodeToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const AccessToken = authHeader.split(' ')[1]; // Assuming the token is in the format "Bearer <token>"

  try {
    const decoded = jwt.verify(AccessToken, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debugging log
    req.user = decoded; // Attach the decoded token to the request object
    next();
  } catch (error) {
    console.error('Token verification failed:', error); // Debugging log
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Import the User model at the top of your controller file
// const User = require('../models/user'); // Adjust path as needed

exports.changePassword = async (req, res) => {
  const start = Date.now();
  const { oldPassword, newPassword, ConfirmPassword } = req.body;

  if (!oldPassword || !newPassword || !ConfirmPassword) {
    const end = Date.now();
    logger.error('All password fields are required', { executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1050,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Old password, new password, and re-enter new password are required'
      }
    });
  }

  if (newPassword !== ConfirmPassword) {
    const end = Date.now();
    logger.error('New passwords do not match', { executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 1051,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'New passwords do not match'
      }
    });
  }

  try {
    console.log('req.user:', req.user); // Debugging log to check if req.user is set

    if (!req.user) {
      throw new Error('User ID is not defined in the token');
    }

    // Check if User model is loaded correctly
    // if (!User || typeof User.findOne !== 'function') {
    //   throw new Error('User model is not correctly defined or loaded');
    // }

    const user = await User.findOne({ where: { userId: req.user.userId } });


    if (!user || !await bcrypt.compare(oldPassword, user.password)) {
      const end = Date.now();
      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 1052,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Old password is incorrect'
        }
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    const end = Date.now();
    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        message: 'Password updated successfully'
      }
    });
  } catch (error) {
    console.error('Error in changePassword:', error); // Debugging log
    const end = Date.now();
    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1053,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error updating password: ' + error.message
      }
    });
  }
};



exports.forgotPassword = async (req, res) => {
  const start = Date.now();
  const { email } = req.body;

  if (!email) {
    const end = Date.now();
    logger.error('Email not provided', { executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 970,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Email is required'
      }
    });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const end = Date.now();
      logger.warn('User not found with provided email', { email, executionTime: `${end - start}ms` });

      return res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 971,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'User not found'
        }
      });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

    // Save token and expiration to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send email with the reset token
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Use your email service
      auth: {
        user: process.env.EMAIL, // Your email
        pass: process.env.EMAIL_PASSWORD // Your email password
      }
    });

    const mailOptions = {
      to: email,
      from: process.env.EMAIL,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset/${resetToken}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    await transporter.sendMail(mailOptions);

    const end = Date.now();
    logger.info(`Password reset token sent to ${email}`, { email, executionTime: `${end - start}ms` });

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        message: 'Password reset token sent successfully'
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error in forgot password', { error: error.message, executionTime: `${end - start}ms` });

    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 972,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error in forgot password: ' + error.message
      }
    });
  }
};

exports.resetPassword = async (req, res) => {
  const start = Date.now();
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    const end = Date.now();
    logger.error('Token or new password not provided', { executionTime: `${end - start}ms` });

    return res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 973,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Token and new password are required'
      }
    });
  }

  try {
    const user = await User.findOne({ where: { resetPasswordToken: token, resetPasswordExpires: { [Op.gt]: Date.now() } } });

    if (!user) {
      const end = Date.now();
      logger.warn('Invalid or expired token', { token, executionTime: `${end - start}ms` });

      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 974,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Invalid or expired token'
        }
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear the reset token and expiration
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    const end = Date.now();
    logger.info('Password reset successfully', { userId: user.userId, executionTime: `${end - start}ms` });

    return res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${end - start}ms`
      },
      data: {
        message: 'Password reset successfully'
      }
    });
  } catch (error) {
    const end = Date.now();
    logger.error('Error in resetting password', { error: error.message, executionTime: `${end - start}ms` });

    return res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 975,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Error in resetting password: ' + error.message
      }
    });
  }
};




