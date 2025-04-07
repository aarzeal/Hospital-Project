const express = require('express');
const router = express.Router();
const store_Controller= require('../controllers/Store_Controller');
const authenticate = require('../validators/authenticate');
const validateJSONContentType = require('../Middleware/jsonvalidation');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const Userverification = require('../validators/Accesstokenverify');
const validation = require("../validators/validation")

router.post('/stores', validateJSONContentType,authenticate,Userverification,ensureSequelizeInstance,validation.storecreate,store_Controller.create_Store);
router.get('/stores',authenticate, Userverification, ensureSequelizeInstance, store_Controller.get_all_Stores);
router.get('/stores/:store_id', authenticate, Userverification, ensureSequelizeInstance, store_Controller.get_Store_ById);
router.put('/stores/:store_id', validateJSONContentType, Userverification, authenticate, ensureSequelizeInstance,validation.storeupdate,store_Controller.update_Store_ById);
router.delete('/stores/:store_id',authenticate,Userverification,ensureSequelizeInstance,store_Controller.delete_Strore_By_Id);


module.exports = router;