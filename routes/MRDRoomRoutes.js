const express = require('express');
const router = express.Router();
const { createRoom, getAllRooms, getRoomById } = require('../controllers/MRDRoomController');

// POST - Add a new room
router.post('/rooms', createRoom);

// GET - Get all rooms
router.get('/rooms', getAllRooms);

// GET - Get a room by ID
router.get('/rooms/:id', getRoomById);

module.exports = router;


// const express = require('express');

// const RoomController = require('../controllers/MRDRoomController');

// const router = express.Router();

// // Define the routes
// router.post('/api/rooms', RoomController.createRoom);
// router.get('/api/rooms', RoomController.getAllRooms);
// router.get('/api/rooms/:mrdRoomIDP', RoomController.getRoomById);

// module.exports = router;
