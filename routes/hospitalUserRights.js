const express = require('express');
const router = express.Router();
const AccessTokenVerify = require('../validators/Accesstokenverify');
// const {ensureSequelizeInstance} = require('../Middleware/ensureSequelizeInstance');
const ensureSequelizeInstance = require('../util/databasedyanamic');
const hopsitalUserRides = require('../controllers/hopsitalUserRights');
const authenticate = require('../validators/authenticate');
// const ensureSequelizeInstance = require('../util/databasedyanamic');
// Routes
// router.get('/getmodulesbyuserId', AccessTokenVerify,authenticate, ensureSequelizeInstance.ensureSequelizeInstance, hopsitalUserRides.getUserModulesAndSubmodulesByUserId);


router.get('/getmodulesbyuserId', authenticate,AccessTokenVerify, ensureSequelizeInstance, hopsitalUserRides.getModulesAndSubModulesByUserId);

module.exports = router;


// const express = require("express");
// const router = express.Router();

// const authenticate = require("../validators/authenticate");
// const ensureSequelizeInstance = require("../util/databasedyanamic");
// const Userverification = require("../validators/Accesstokenverify");
// const validateJSONContentType = require("../Middleware/jsonvalidation");

// const hospitalUserRights = require("../controllers/hopsitalUserRights");

// // OLD route: Get Modules & Submodules by UserId  
// router.get(
//   "/getmodulesbyuserId",
//   authenticate,
//   Userverification,
//   ensureSequelizeInstance,
//   hospitalUserRights.getModulesAndSubModulesByUserId
// );

// // 👉 CREATE User Right
// router.post(
//   "/create-user-right",
//   authenticate,
//   validateJSONContentType,
//   ensureSequelizeInstance,
//   Userverification,
//   hospitalUserRights.createUserRights
// );

// // 👉 GET All User Rights
// router.get(
//   "/all-user-rights",
//   authenticate,
//   ensureSequelizeInstance,
//   Userverification,
//   hospitalUserRights.getAllUserRights
// );

// // 👉 GET User Right By ID
// router.get(
//   "/user-right/:id",
//   authenticate,
//   ensureSequelizeInstance,
//   Userverification,
//   hospitalUserRights.getUserRightById
// );

// // 👉 UPDATE User Right
// router.put(
//   "/update-user-right/:id",
//   authenticate,
//   ensureSequelizeInstance,
//   validateJSONContentType,
//   Userverification,
//   hospitalUserRights.updateUserRight
// );

// // 👉 DELETE User Right
// router.delete(
//   "/delete-user-right/:id",
//   authenticate,
//   ensureSequelizeInstance,
//   Userverification,
//   hospitalUserRights.deleteUserRight
// );

// module.exports = router;
