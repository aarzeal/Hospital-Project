const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const { 
    createPermission,
     getAllPermissions, 
     getPermissionById, 
     updatePermissionById, 
     deletePermissionById, 
     getPermissionByQueryParams } = require("../controllers/PermissionController");

// Create Permission
router.post(
  "/create-permission",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createPermission
);

// Get All Permissions
router.get(
  "/all-permissions",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllPermissions
  
);

// Get Permission by ID
router.get(
  "/permission/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getPermissionById
  
);

// Update Permission by ID
router.put(
  "/update-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  validateJSONContentType,
  Userverification,
  updatePermissionById
  
);

// Delete Permission by ID
router.delete(
  "/delete-permission/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  deletePermissionById
  
);

// Get Permission by Query Params (Optional filter)
router.get(
  "/permission-as-per-query",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getPermissionByQueryParams
  
);

module.exports = router;
