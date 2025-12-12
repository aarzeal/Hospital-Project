const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const hospitalController = require('../controllers/HospitalController');
const { 
  createUserPermission,
  getAllUserPermissions,
  getUserPermissionById,
  getPermissionsByUserId,
  updateUserPermissionById,
  deleteUserPermissionById,
  getUserPermissionByQueryParams
} = require("../controllers/UserPermissionController");

// CREATE single permission
router.post(
  "/create-user-permission",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createUserPermission
);

// GET all permissions (optional, admin)
router.get(
  "/all-user-permissions",
  authenticate,
  hospitalController.ensureSequelizeInstance,
  getAllUserPermissions
);

// GET permission by ID
router.get(
  "/user-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getUserPermissionById
);

// GET permissions by userId (main use case)
router.get(
  "/user-permissions/user/:userId",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getPermissionsByUserId
);

// UPDATE permission by ID
router.put(
  "/update-user-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updateUserPermissionById
);

// DELETE permission by ID
router.delete(
  "/delete-user-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deleteUserPermissionById
);

// GET permissions as per query params (pagination/filtering)
router.get(
  "/user-permission-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getUserPermissionByQueryParams
);

module.exports = router;
