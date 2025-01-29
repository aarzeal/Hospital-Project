
const Module = require("../models/masterModule");
const logger = require('../logger');

exports.getModules = async (req, res) => {
  try {
    const moduleId = req.params.id;

    let result;
    if (moduleId) {
      result = await Module.findByPk(moduleId);
      if (!result) {
        return res.status(404).json({ success: false, message: "Module not found" });
      }
    } else {
      result = await Module.findAll();
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
};