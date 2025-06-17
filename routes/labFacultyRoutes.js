const express = require("express");
const router = express.Router();
const authenticate = require("../validators/authenticate");
const ensureSequelizeInstance = require("../util/databasedyanamic");
const Userverification = require("../validators/Accesstokenverify");
const validateJSONContentType = require("../Middleware/jsonvalidation");
const {
  createLabFaculty,
  getAllLabFaculties,
  getLabFacultyById,
} = require("../controllers/labFacultyController");

router.post(
  "/create-lab-faculty",
  authenticate,
  validateJSONContentType,
  ensureSequelizeInstance,
  Userverification,
  createLabFaculty
);
router.get(
  "/all-lab-faculties",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getAllLabFaculties
);

router.get(
  "/lab-faculty/:id",
  authenticate,
  ensureSequelizeInstance,
  Userverification,
  getLabFacultyById
);

module.exports = router;
