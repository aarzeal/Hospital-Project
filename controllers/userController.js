// // const createUserMasterModel = require('../models/userMaster');
// // const HospitalGroup = require('../models/HospitalGroup');
// // const createDynamicConnection = require('../database/dynamicConnection');

// // exports.createUser = async (req, res) => {
// //   try {
// //     const { HospitalDatabase, userName, password } = req.body;
// //     const dynamicDb = createDynamicConnection(HospitalDatabase);
// //     const UserMaster = createUserMasterModel(dynamicDb, HospitalGroup);
    
    
// //     await dynamicDb.sync();
// //     const user = await UserMaster.create({
// //        UserName: userName,
// //         Password: password,
// //         //  HospitalGroupIDR: hospitalGroupIDR
// //          });

// //     res.status(201).json({
// //       meta: {
// //         statusCode: 201
// //       },
// //       data: user
// //     });
// //   } catch (error) {
// //     res.status(400).json({
// //       meta: {
// //         statusCode: 400,
// //         errorCode: 921
// //       },
// //       error: {
// //         message: 'Error creating user: ' + error.message
// //       }
// //     });
// //   }
// // };

// // exports.getUsers = async (req, res) => {
// //   try {
// //     const { databaseName } = req.query;
// //     const dynamicDb = createDynamicConnection(databaseName);
// //     const UserMaster = createUserMasterModel(dynamicDb, HospitalGroup);

// //     const users = await UserMaster.findAll();

// //     res.status(200).json({
// //       meta: {
// //         statusCode: 200
// //       },
// //       data: users
// //     });
// //   } catch (error) {
// //     res.status(400).json({
// //       meta: {
// //         statusCode: 400,
// //         errorCode: 922
// //       },
// //       error: {
// //         message: 'Error retrieving users: ' + error.message
// //       }
// //     });
// //   }
// // };

// // exports.updateUser = async (req, res) => {
// //   try {
// //     const { databaseName, userId, userName, password, hospitalGroupId } = req.body;
// //     const dynamicDb = createDynamicConnection(databaseName);
// //     const UserMaster = createUserMasterModel(dynamicDb, HospitalGroup);

// //     await dynamicDb.sync();
// //     const user = await UserMaster.findByPk(userId);
// //     if (user) {
// //       user.UserName = userName;
// //       user.Password = password;
// //       user.HospitalGroupID = hospitalGroupId;
// //       await user.save();

// //       res.status(200).json({
// //         meta: {
// //           statusCode: 200
// //         },
// //         data: user
// //       });
// //     } else {
// //       res.status(404).json({
// //         meta: {
// //           statusCode: 404,
// //           errorCode: 923
// //         },
// //         error: {
// //           message: 'User not found'
// //         }
// //       });
// //     }
// //   } catch (error) {
// //     res.status(400).json({
// //       meta: {
// //         statusCode: 400,
// //         errorCode: 924
// //       },
// //       error: {
// //         message: 'Error updating user: ' + error.message
// //       }
// //     });
// //   }
// // };

// // exports.deleteUser = async (req, res) => {
// //   try {
// //     const { databaseName, userId } = req.query;
// //     const dynamicDb = createDynamicConnection(databaseName);
// //     const UserMaster = createUserMasterModel(dynamicDb, HospitalGroup);

// //     await dynamicDb.sync();
// //     const user = await UserMaster.findByPk(userId);
// //     if (user) {
// //       await user.destroy();

// //       res.status(200).json({
// //         meta: {
// //           statusCode: 200
// //         },
// //         data: {
// //           message: 'User deleted successfully'
// //         }
// //       });
// //     } else {
// //       res.status(404).json({
// //         meta: {
// //           statusCode: 404,
// //           errorCode: 925
// //         },
// //         error: {
// //           message: 'User not found'
// //         }
// //       });
// //     }
// //   } catch (error) {
// //     res.status(400).json({
// //       meta: {
// //         statusCode: 400,
// //         errorCode: 926
// //       },
// //       error: {
// //         message: 'Error deleting user: ' + error.message
// //       }
// //     });
// //   }
// // };

// const createDynamicConnection = require('../database/dynamicConnection');
// const createUserMasterModel = require('../models/userMaster');
// const UserMaster  = require('../models/userMaster');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const Hospital = require('../models/HospitalModel'); // Adjust the import path
// const verifyToken = require('../middleware/verifiyHospital');

// // const SECRET_KEY = 'your_secret_key';

// const dotenv = require('dotenv');
// dotenv.config();

// // const getUserMasterModel = async (hospitalID) => {
// //   const hospital = await Hospital.findOne({ where: { HospitalID: hospitalID } });
// //   if (!hospital) throw new Error(`Hospital with ID ${hospitalID} not found`);

// //   const { sequelize, testConnection } = createDynamicConnection(hospital.HospitalDatabase);
// //   await testConnection();

// //   const UserMaster = await createUserMasterModel(sequelize); // Change this line
// //   console.log(typeof UserMaster); // Check the type of UserMaster
// //   console.log(UserMaster); // Log the actual value of UserMaster

// //   return UserMaster;
// // };


// // const getUserMasterModel = async (hospitalID) => {
// //   // Assuming you already have the hospitalID to determine the database name
// //   const databaseName = 'umcdatabse'; // Example database name
  
// //   const { sequelize, testConnection } = createDynamicConnection(databaseName);
// //   await testConnection();

// //   const UserMaster = await createUserMasterModel(sequelize);

// //   return UserMaster;
// // };



// // exports.createUser = async (req, res) => {
// //   const { HospitalID, ...userData } = req.body;
// //   try {
// //     const UserMaster = await getUserMasterModel(HospitalID);
// //     const user = await UserMaster.create(userData);
// //     res.status(200).json({
// //       meta: {
// //         status: 200,
// //         errorCode: null
// //       },
// //       data: user
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({
// //       meta: {
// //         status: 500,
// //         errorCode: 927
// //       },
// //       message: 'Error creating user',
// //       error: error.message
// //     });
// //   }
// // };


// const generateToken = (payload, expiresIn = '1h') => {
//   return jwt.sign(payload, SECRET_KEY, { expiresIn });
// };


// exports.login = async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     // Assuming createDynamicConnection, createUserMasterModel, and getUserMasterModel functions are correctly defined elsewhere
//     const defaultConnection = createDynamicConnection('hospital'); // Adjust 'hospital' to your actual default database name
//     const { sequelize, testConnection } = defaultConnection;
//     await testConnection();

//     const UserMasterDefault = await createUserMasterModel(sequelize);

//     const foundUser = await UserMasterDefault.findOne({ where: { UserName: username } });
//     if (!foundUser) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const hospitalID = foundUser.HospitalID;

//     const UserMaster = await getUserMasterModel(hospitalID);
//     const user = await UserMaster.findOne({ where: { UserName: username } });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.Password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: 'Invalid password' });
//     }

//     const payload = {
//       UserID: user.UserID,
//       UserName: user.UserName,
//       Role: user.Role,
//       HospitalID: user.HospitalID
//     };

//     // Assuming generateToken function is correctly defined elsewhere
//     let token;
//     if (user.Role === 'admin') {
//       token = generateToken({ ...payload, type: 'hospitalUserSessionToken' }, '1h');
//     } else {
//       token = generateToken({ ...payload, type: 'accessToken' }, '1h');
//     }

//     res.json({ token });
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({
//       meta: {
//         status: 500,
//         errorCode: 935
//       },
//       message: 'Error during login',
//       error: error.message
//     });
//   }
// };


// // exports.login = async (req, res) => {
// //   const { username, password } = req.body;
// //   try {
// //       const UserMaster = await getUserMasterModel();

// //       const user = await UserMaster.findOne({ where: { UserName: username, Password: password } });
// //       if (!user) {
// //           return res.status(401).json({ error: 'Invalid credentials' });
// //       }

// //       const payload = {
// //           UserID: user.UserID,
// //           UserName: user.UserName,
// //           Role: user.Role,
// //           HospitalID: user.HospitalID
// //       };

// //       let token;
// //       if (user.Role === 'admin') {
// //           token = generateToken({ ...payload, type: 'hospitalUserSessionToken' }, '1h');
// //       } else {
// //           token = generateToken({ ...payload, type: 'accessToken' }, '1h');
// //       }

// //       res.json({ token });
// //   } catch (error) {
// //       console.error('Error during login:', error);
// //       res.status(500).json({
// //           meta: {
// //               status: 500,
// //               errorCode: 935
// //           },
// //           message: 'Error during login',
// //           error: error.message
// //       });
// //   }
// // };






// exports.getUsers = async (req, res) => {
//   const { HospitalID } = req.params;
//   try {
//     const UserMaster = await getUserMasterModel(HospitalID);
//     const users = await UserMaster.findAll();
//     res.status(200).json({
//       meta: {
//         status: 200,
//         errorCode: null
//       },
//       data: users
//     });
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         status: 500,
//         errorCode: 928
//       },
//       message: 'Error retrieving users',
//       error: error.message
//     });
//   }
// };

// exports.getUserById = async (req, res) => {
//   const { HospitalID, id } = req.params;
//   try {
//     const UserMaster = await getUserMasterModel(HospitalID);
//     const user = await UserMaster.findByPk(id);
//     if (user) {
//       res.status(200).json({
//         meta: {
//           status: 200,
//           errorCode: null
//         },
//         data: user
//       });
//     } else {
//       res.status(404).json({
//         meta: {
//           status: 404,
//           errorCode: 929
//         },
//         message: 'User not found'
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         status: 500,
//         errorCode: 930
//       },
//       message: 'Error retrieving user',
//       error: error.message
//     });
//   }
// };

// exports.updateUser = async (req, res) => {
//   const { HospitalID, id } = req.params;
//   const updatedData = req.body;
//   try {
//     const UserMaster = await getUserMasterModel(HospitalID);
//     const [updatedRows] = await UserMaster.update(updatedData, { where: { UserID: id } });
//     if (updatedRows) {
//       res.status(200).json({
//         meta: {
//           status: 200,
//           errorCode: null
//         },
//         message: 'User updated successfully'
//       });
//     } else {
//       res.status(404).json({
//         meta: {
//           status: 404,
//           errorCode: 931
//         },
//         message: 'User not found'
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         status: 500,
//         errorCode: 932
//       },
//       message: 'Error updating user',
//       error: error.message
//     });
//   }
// };

// exports.deleteUser = async (req, res) => {
//   const { HospitalID, id } = req.params;
//   try {
//     const UserMaster = await getUserMasterModel(HospitalID);
//     const deletedRows = await UserMaster.destroy({ where: { UserID: id } });
//     if (deletedRows) {
//       res.status(200).json({
//         meta: {
//           status: 200,
//           errorCode: null
//         },
//         message: 'User deleted successfully'
//       });
//     } else {
//       res.status(404).json({
//         meta: {
//           status: 404,
//           errorCode: 933
//         },
//         message: 'User not found'
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       meta: {
//         status: 500,
//         errorCode: 934
//       },
//       message: 'Error deleting user',
//       error: error.message
//     });
//   }
// };


// // const getAllUsers = async () => {
// //   try {
// //     // Fetch all users from the UserMaster model
// //     const users = await UserMaster.findAll();
// //     return users;
// //   } catch (error) {
// //     console.error('Error fetching users:', error);
// //     throw error; // Rethrow the error for handling at a higher level
// //   }
// // };
// // getAllUsers()
// //   .then(users => {
// //     console.log('All users:', users);
// //   })
// //   .catch(error => {
// //     console.error('Error:', error);
// //   });

// controllers/userController.js
const { Sequelize } = require('sequelize');
const createUserMasterModel = require('../models/userMaster');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Function to create Sequelize instance and connect to the database
const createDatabaseConnection = (databaseName) => {
  const sequelize = new Sequelize(
    // Specify the database name here
    "umc9",
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT
    }
  );
  return sequelize;
};

exports.createUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 928,
        },
        error: {
          message: 'Unauthorized: No token provided',
        },
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
    } catch (error) {
      // Token is invalid, handle accordingly
      return res.status(401).json({
        meta: {
          statusCode: 401,
          errorCode: 929,
        },
        error: {
          message: 'Unauthorized: Invalid token',
        },
      });
    }

    // Check if the token contains the hospital database name
    const hospitalDatabase = decoded.HospitalDatabase;

    // Fallback database name if the token does not contain it
    const fallbackDatabaseName = 'default_database_name';

    // Use the fallback database name if the token does not provide it
    const databaseNameToUse = hospitalDatabase || fallbackDatabaseName;

    // Create Sequelize instance and connect to the database
    const sequelize = createDatabaseConnection(databaseNameToUse);

    // Create user model using Sequelize instance
    const UserMaster = createUserMasterModel(sequelize);

    // Other user creation logic goes here...

    // Example: Hash user password
    // userData.Password = await bcrypt.hash(userData.Password, 10);

    // Example: Create user
    // const user = await UserMaster.create(userData);

    res.status(201).json({
      meta: {
        statusCode: 201,
        errorCode: null,
      },
      data: 'User created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 927,
      },
      error: {
        message: 'Error creating user: ' + error.message,
      },
    });
  }
};



// exports.createUser = [
//   verifyToken,
//   async (req, res) => {
//     try {
//       const { hospitalId } = req; // Get the hospitalId from the request object
//       const userData = { ...req.body, HospitalID: hospitalId };
      

//       const { sequelize, testConnection } = createDynamicConnection();
//       await testConnection();
//       const UserMaster = createUserMasterModel(sequelize);
      

//       userData.Password = await bcrypt.hash(userData.Password, 10);

//       const user = await UserMaster.create(userData);

//       res.status(201).json({
//         meta: {
//           statusCode: 201,
//           errorCode: null,
//         },
//         data: user,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         meta: {
//           statusCode: 500,
//           errorCode: 927,
//         },
//         error: {
//           message: 'Error creating user: ' + error.message,
//         },
//       });
//     }
//   },
// ];
