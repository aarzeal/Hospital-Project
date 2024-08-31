
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const router = express.Router();

let User; 
// const express = require('express');
// const userController = require('../controllers/userController');
// const { verifyToken } = require('../validators/verify');
// const UserMaster = require('../models/userMaster');

// const router = express.Router();

// // router.post('/user', verifyToken(['admin']),userController.createUser);
// // router.get('/users', userController.getUsers);
// // router.put('/user', userController.updateUser);
// // router.delete('/user', userController.deleteUser);

// // router.post('/users',verifyToken(['admin']), userController.createUser);
// // router.get('/users/:HospitalID',verifyToken(['admin']), userController.getUsers);
// // router.get('/users/:HospitalID/:id',verifyToken(['admin']), userController.getUserById);
// // router.put('/users/:HospitalID/:id', verifyToken(['admin']),userController.updateUser);
// // router.delete('/users/:HospitalID/:id',verifyToken(['admin']), userController.deleteUser);
// // router.post('/login', userController.login);

// router.post('/users', userController.createUser);
// router.post('/users', verifyToken, userController.createUser);




// router.get('/users', async (req, res) => {
//     try {
//       // Use UserMaster model to fetch all users
//       const users = await UserMaster.findAll(); // Ensure UserMaster has a findAll function
  
//       // Send the users as JSON response
//       res.json(users);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       // Send an error response if there's an error
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });


// module.exports = router;
// routes/userRoutes.js

const express = require('express');
const userController = require('../controllers/userController');
const loginController = require('../controllers/hospitallogin');

const verifyToken = require('../validators/verify'); // Ensure correct import path
const router = express.Router();

// router.post('/users', verifyToken, userController.createUser);
router.post('/HospitalLogin', loginController.login);


// Middleware to ensure Sequelize instance is available
const ensureSequelizeInstance = (req, res, next) => {
    // Check if Sequelize instance is available in the session
    if (!req.session || !req.session.sequelize) {
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
  
    // Proceed to the next middleware
    next();
  };
  
  // Route to create a new user
  router.post('/users', ensureSequelizeInstance, async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Access the User model using Sequelize instance from the session
      const User = require('../models/user')(req.session.sequelize);
  
      // Create the user
      const user = await User.create({ username, password: hashedPassword });
  
      // Respond with success
      res.status(201).json({
        meta: {
          statusCode: 201
        },
        data: {
          userId: user.userId,
          username: user.username
        }
      });
    } catch (error) {
      // Handle errors
      logger.error('Error creating user', { error: error.message });
      res.status(500).json({
        meta: {
          statusCode: 500,
          errorCode: 929
        },
        error: {
          message: 'Error creating user: ' + error.message
        }
      });
    }
  });
  










module.exports = router;
