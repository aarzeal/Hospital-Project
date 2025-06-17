const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const { createLabFaculty } = require("../controllers/labFacultyController");

router.post(
  "/create-age-group",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createLabFaculty
);

module.exports = router;
