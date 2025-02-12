const express = require("express");
const { createService,getAllAndGetById,updateService } = require("../controllers/serviceController");

const router = express.Router();

router.post("/create_service", createService);
router.get("/create_service",getAllAndGetById );
router.put("/update/:service_id", updateService);

module.exports = router;
