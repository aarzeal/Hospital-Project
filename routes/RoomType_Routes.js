const express = require("express");
const router = express.Router();
const RoomType_Controller = require("../controllers/RoomType_Controller");
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateTax = require('../validators/TaxValidators');
const Userverification = require('../validators/Accesstokenverify');
const validation = require("../validators/validation")

router.post('/create-room-type', validateJSONContentType, authenticate, validation.validateRoomTypeRegister, Userverification, ensureSequelizeInstance, RoomType_Controller.createRoomType);
router.get('/get-room-type', authenticate, Userverification, ensureSequelizeInstance, RoomType_Controller.getallroomtype);
router.get('/get-room-type-by-id/:roomType_ID', authenticate, Userverification, ensureSequelizeInstance, RoomType_Controller.getRoomTypeById);
router.put('/update-room-type-by-id/:roomType_ID', validateJSONContentType, Userverification, validation.validateRoomTypeUpdate, authenticate, ensureSequelizeInstance, RoomType_Controller.updateRoomType);
router.delete('/delete-room-type-by-id/:roomType_ID', authenticate, Userverification, ensureSequelizeInstance, RoomType_Controller.deleteroomTypeById);


module.exports = router;