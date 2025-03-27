const express=require("express");
const router=express.Router();
const RoomType_Controller=require("../controllers/RoomType_Controller");
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const validateTax  = require('../validators/TaxValidators');
const Userverification = require('../validators/Accesstokenverify');

router.post('/create-room-type', validateJSONContentType,authenticate,Userverification,ensureSequelizeInstance,RoomType_Controller.createRoomType);
router.get('/get-room-type', authenticate,Userverification,ensureSequelizeInstance,RoomType_Controller.getroomtype);

module.exports = router;