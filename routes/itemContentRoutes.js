const express = require('express');
const router = express.Router();
const itemContentController = require('../controllers/itemContentController.js');
const authenticate = require('../validators/authenticate.js');
const userverifiction = require('../validators/Accesstokenverify.js');
const validateJSONContentType = require('../Middleware/jsonvalidation.js');
const ensureSequelizeInstance = require('../util/databasedyanamic.js');
const validator = require('../validators/TaxValidators.js');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// const upload = multer({ dest: 'uploads/' });

router.post('/bulk-upload', upload.single('file'), itemContentController.uploadItemContentBulk);
router.post('/item-content',   upload.single("file"),authenticate, userverifiction, ensureSequelizeInstance, itemContentController.createItemContent);
router.get('/item-content', authenticate, userverifiction, ensureSequelizeInstance, itemContentController.getAllItemContent);
router.get('/item-content/:id', authenticate, userverifiction, ensureSequelizeInstance, itemContentController.getItemContentById);
router.put('/item-content/:id', validateJSONContentType, validator.validateItemContentUpdate, userverifiction, authenticate, ensureSequelizeInstance, itemContentController.updateItemContentById);
router.delete('/item-content/:id', authenticate, userverifiction, ensureSequelizeInstance, itemContentController.deleteItemContentById);

module.exports = router;