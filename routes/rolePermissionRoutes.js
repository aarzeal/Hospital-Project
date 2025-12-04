// const express = require("express");
// const router = express.Router();
// const authenticate = require("../validators/authenticate");
// const ensureSequelizeInstance = require("../util/databasedyanamic");
// const Userverification = require("../validators/Accesstokenverify");
// const validateJSONContentType = require("../Middleware/jsonvalidation");
// const hospitalController = require('../controllers/HospitalController');
// const { createRolePermission, getAllRolePermissions, getRolePermissionById, updateRolePermissionById, deleteRolePermissionById, getRolePermissionByQueryParams } = require("../controllers/rolePermissionController");



// router.post(
//   "/create-role-permission",
//   authenticate,
//   validateJSONContentType,
//   ensureSequelizeInstance,
//   Userverification,
//   createRolePermission
// );
// router.get(
//   "/all-role-permissions",
//   authenticate,
//   // ensureSequelizeInstance,
//   // Userverification,
// hospitalController.ensureSequelizeInstance,
//   getAllRolePermissions
// );

// router.get(
//   "/role-permission/:id",
//   authenticate,
//   ensureSequelizeInstance,
//   Userverification,
//   getRolePermissionById
// );

// router.put(
//   "/update-role-permission/:id",
//   authenticate,
//   ensureSequelizeInstance,
//   validateJSONContentType,
//   Userverification,
//   updateRolePermissionById
// );

// router.delete(
//   "/delete-role-permission/:id",
//   authenticate,
//   ensureSequelizeInstance,
//   Userverification,
//   deleteRolePermissionById
// );

// router.get(
//   "/role-permission-as-per-query",
//   authenticate,
//   ensureSequelizeInstance,
//   Userverification,
//   getRolePermissionByQueryParams
// );

// module.exports = router;

const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const hospitalController = require('../controllers/HospitalController');
const { 
  createRolePermission, 
  getAllRolePermissions, 
  getRolePermissionById, 
  updateRolePermissionById, 
  deleteRolePermissionById, 
  getRolePermissionByQueryParams,
  createRolePermissionsBulk,
  replaceRolePermissions, 
  getAllAccessByRoleId
} = require("../controllers/rolePermissionController");

// Existing single create route
router.post(
  "/create-role-permission",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createRolePermission
);

// New bulk create route
router.post(
  "/create-role-permissions-bulk",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createRolePermissionsBulk
);

// New replace route
router.post(
  "/replace-role-permissions",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  replaceRolePermissions
);

router.get(
  "/all-role-permissions",
  authenticate,
  hospitalController.ensureSequelizeInstance,
  getAllRolePermissions
);

router.get(
  "/role-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getRolePermissionById
);

router.get(
  "/role-access/:roleId",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllAccessByRoleId
);

router.put(
  "/update-role-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateRolePermissionById
);

router.delete(
  "/delete-role-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteRolePermissionById
);

router.get(
  "/role-permission-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getRolePermissionByQueryParams
);

module.exports = router;
