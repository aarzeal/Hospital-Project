const express = require("express");
const Room_Controller = require("../controllers/Rooms_Controller");
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateTax = require('../validators/TaxValidators');
const Userverification = require('../validators/Accesstokenverify');
const validation = require("../validators/validation");

const router = express.Router();

router.post('/rooms', validateJSONContentType, authenticate, Userverification, ensureSequelizeInstance, Room_Controller.createRoom);
router.get('/rooms', authenticate, Userverification, ensureSequelizeInstance, Room_Controller.getallrooms);
router.get('/rooms/:room_ID', authenticate, Userverification, ensureSequelizeInstance, Room_Controller.getRoomsById);
router.put('/rooms/:room_ID', validateJSONContentType, Userverification, authenticate, ensureSequelizeInstance, Room_Controller.updateRoom);
router.delete('/rooms/:room_ID', authenticate, Userverification, ensureSequelizeInstance, Room_Controller.deleteroomById);

module.exports = router;