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





const express = require('express');
const router = express.Router();

const { validationResult } = require('express-validator');
const Hospital = require('../models/HospitalModel');
const sequelize = require('../database/connection');
const createUserMasterModel = require('../models/userMaster');
const createPatientMasterModel = require('../models/paitentMaster');
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
      { expiresIn: '1h' }
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

exports.createUser = async (req, res) => {
  const { username, password } = req.body;
  const hospitalId = req.hospitalId;

  try {
    if (!password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds
    const User = require('../models/user')(req.sequelize);

    // Ensure the table exists
    await User.sync();

    const user = await User.create({ username, password: hashedPassword,hospitalId  });
    logger.info(`User created successfully with username: ${username}, hospitalId: ${hospitalId}`);

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
        username: user.username
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



