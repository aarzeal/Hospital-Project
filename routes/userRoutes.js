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
const verifyToken = require('../validators/verify'); // Ensure correct import path
const router = express.Router();

router.post('/users', verifyToken, userController.createUser);

module.exports = router;
