const express = require('express');
const router = express.Router();
const controller = require('../controllers/LabTestRefDetailsController');
const authenticate = require('../validators/authenticate');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const Userverification = require('../validators/Accesstokenverify');
const validateJSONContentType = require('../Middleware/jsonvalidation');

router.post('/create-labtest-refdetail', authenticate, validateJSONContentType, ensureSequelizeInstance, Userverification, controller.createLabTestRefDetail);
router.get('/getall-labtest-refdetails', authenticate,ensureSequelizeInstance,Userverification,controller.getAllLabTestRefDetails);
router.get('/get-labtest-refdetails-byid/:id', authenticate, ensureSequelizeInstance,Userverification,controller.getLabTestRefDetailsById);
router.get('/get-asper-queryparam',authenticate,ensureSequelizeInstance,Userverification,controller.getLabTestRefDetailAsPerQueryParam);
router.put('/update-labtest-refdetails-byid/:lab_test_ref_id',authenticate,ensureSequelizeInstance,Userverification,controller.updateLabTestRefDetailsById);
router.delete('/delete-labtest-refdetails-byid/:lab_test_ref_id', authenticate, ensureSequelizeInstance, Userverification, controller.deleteLabTestRefDetailsById);
module.exports=router;