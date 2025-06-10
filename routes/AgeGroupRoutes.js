const express = require('express');
const router = express.Router();
const controller = require('../controllers/AgeGroupController');
const authenticate = require('../validators/authenticate');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const Userverification = require('../validators/Accesstokenverify');
const validateJSONContentType = require('../Middleware/jsonvalidation');
// const validate=require('../validators/validation');

router.post('/create-age-group', authenticate, validateJSONContentType, ensureSequelizeInstance, Userverification,  controller.createAgeGroup);
router.get('/all-age-group', authenticate, ensureSequelizeInstance, Userverification, controller.getAllAgeGroups);
router.get("/age-group/:id", authenticate, ensureSequelizeInstance, Userverification, controller.getAgeGroupById);
router.put('/update-age-group/:age_group_id', authenticate, validateJSONContentType, ensureSequelizeInstance, Userverification, controller.updateAgeGroupById);
router.delete("/delete-age-group/:age_group_id", authenticate, ensureSequelizeInstance, Userverification, controller.deleteAgeGroupById);
router.get('/as-per-query', authenticate,ensureSequelizeInstance,Userverification,controller.getDataAsPerQueryParam);


module.exports = router;