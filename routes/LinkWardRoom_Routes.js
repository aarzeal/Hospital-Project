const express = require("express");
const WardRoomLink_Controller = require("../controllers/LinkWardRoom_Controller");
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
//const validateTax = require('../validators/TaxValidators');
const Userverification = require('../validators/Accesstokenverify');
const validation = require("../validators/validation");

const router = express.Router();

router.post('/wardroomlink', validateJSONContentType, authenticate, Userverification, validation.wardroomlinkcreate ,ensureSequelizeInstance, WardRoomLink_Controller.createWardRoomLink);
router.get('/wardroomlink', authenticate, Userverification, ensureSequelizeInstance, WardRoomLink_Controller.getallwardroomlink);
router.get('/wardroomlink/:wardRoomLink_ID', authenticate, Userverification, ensureSequelizeInstance, WardRoomLink_Controller.getWardRoomLinkById);
router.put('/wardroomlink/:wardRoomLink_ID', validateJSONContentType, Userverification, authenticate, validation.wardroomlinkupdate, ensureSequelizeInstance, WardRoomLink_Controller.updateWardRoomLink);
router.delete('/wardroomlink/:wardRoomLink_ID', authenticate, Userverification, ensureSequelizeInstance, WardRoomLink_Controller.deleteWardRoomLinkById);

module.exports = router;