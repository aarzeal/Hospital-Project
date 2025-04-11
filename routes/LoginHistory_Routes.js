const express = require('express');
const router = express.Router();
const loginHistory= require('../controllers/LoginHistory_Controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const Userverification = require('../validators/Accesstokenverify');
//const validation = require("../validators/validation")

router.post('/login-history', validateJSONContentType,authenticate,Userverification,ensureSequelizeInstance,loginHistory.create_Login_History);

module.exports=router;