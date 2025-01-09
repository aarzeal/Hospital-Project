// const poolPromise = require('../database/mssqlConnection');
// const sql = require('mssql');


// class Room {
//     static async createRoom(roomName, roomCode, type, Active, hospitalIDF) {
//         try {
//             const pool = await poolPromise;
//             const result = await pool.request()
//                 .input('RoomName', sql.NVarChar, roomName)
//                 .input('RoomCode', sql.NVarChar, roomCode)
//                 .input('Type', sql.TinyInt, type)
//                 .input('NonActive', sql.Bit, Active)
//                 .input('HospitalIDF', sql.Int, hospitalIDF)
//                 .query(`
//                     INSERT INTO tbMRDRoomMaster (RoomName, RoomCode, Type, Active, HospitalIDF)
//                     VALUES (@RoomName, @RoomCode, @Type, @NonActive, @HospitalIDF)
//                 `);
//             return result;
//         } catch (err) {
//             throw new Error('Error inserting into database: ' + err.message);
//         }
//     }

//     static async getAllRooms() {
//         try {
//             const pool = await poolPromise;
//             const result = await pool.request().query('SELECT * FROM tbMRDRoomMaster');
//             return result.recordset;
//         } catch (err) {
//             throw new Error('Error fetching rooms: ' + err.message);
//         }
//     }

//     static async getRoomById(mrdRoomIDP) {
//         try {
//             const pool = await poolPromise;
//             const result = await pool.request()
//                 .input('MRDRoomIDP', sql.Int, mrdRoomIDP)
//                 .query('SELECT * FROM tbMRDRoomMaster WHERE MRDRoomIDP = @MRDRoomIDP');
//             return result.recordset[0];  // return the first result or null if not found
//         } catch (err) {
//             throw new Error('Error fetching room by ID: ' + err.message);
//         }
//     }
// }

// module.exports = Room;



const { DataTypes } = require('sequelize');
const sequelize = require('../database/mssqlConnection');

// Room model definition
const Room = sequelize.define('Room', {
    MRDRoomIDP: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    RoomName: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    RoomCode: {
        type: DataTypes.STRING(8),
        allowNull: false,
    },
    Type: {
        type: DataTypes.TINYINT,
        allowNull: false,
    },
    Active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    HospitalIDF: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'tbMRDRoomMaster',
    timestamps: false, // Disables createdAt/updatedAt fields
});

module.exports = Room;
