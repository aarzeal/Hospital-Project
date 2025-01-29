const Room = require('../models/MRDRoomModel');

// Add a new room
const createRoom = async (req, res) => {
    try {
        const { RoomName, RoomCode, Type, NonActive, HospitalIDF } = req.body;

        if (!RoomName || !RoomCode || Type === undefined || NonActive === undefined || !HospitalIDF) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const room = await Room.create({ RoomName, RoomCode, Type, NonActive, HospitalIDF });
        res.status(201).json({ message: 'Room added successfully', room });
    } catch (err) {
        console.error('Error inserting room:', err.message);
        res.status(500).json({ message: 'Error inserting room', error: err.message });
    }
};

// Get all rooms
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll();
        res.status(200).json(rooms);
    } catch (err) {
        console.error('Error fetching rooms:', err.message);
        res.status(500).json({ message: 'Error fetching rooms', error: err.message });
    }
};

// Get room by ID
const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findByPk(id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json(room);
    } catch (err) {
        console.error('Error fetching room by ID:', err.message);
        res.status(500).json({ message: 'Error fetching room', error: err.message });
    }
};

module.exports = { createRoom, getAllRooms, getRoomById };



// const Room = require('../models/MRDRoomModel');

// class RoomController {
//     static async createRoom(req, res) {
//         const { roomName, roomCode, type, nonActive, hospitalIDF } = req.body;

//         if (!roomName || !roomCode || type === undefined || nonActive === undefined || !hospitalIDF) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         try {
//             await Room.createRoom(roomName, roomCode, type, nonActive, hospitalIDF);
//             res.status(201).json({ message: 'Room added successfully' });
//         } catch (err) {
//             console.error('Error inserting into database:', err);
//             res.status(500).json({ message: 'Error inserting into database', error: err.message });
//         }
//     }

//     static async getAllRooms(req, res) {
//         try {
//             const rooms = await Room.getAllRooms();
//             res.status(200).json(rooms);
//         } catch (err) {
//             console.error('Error fetching rooms:', err);
//             res.status(500).json({ message: 'Error fetching rooms', error: err.message });
//         }
//     }

//     static async getRoomById(req, res) {
//         const { mrdRoomIDP } = req.params;

//         if (!mrdRoomIDP) {
//             return res.status(400).json({ message: 'Room ID is required' });
//         }

//         try {
//             const room = await Room.getRoomById(mrdRoomIDP);
//             if (room) {
//                 res.status(200).json(room);
//             } else {
//                 res.status(404).json({ message: 'Room not found' });
//             }
//         } catch (err) {
//             console.error('Error fetching room by ID:', err);
//             res.status(500).json({ message: 'Error fetching room', error: err.message });
//         }
//     }
// }

// module.exports = RoomController;
