const submodule = require("../models/MasterSubmodule");

// Get all modules or a single module by ID



exports.getSubModules = async (req, res) => {
  try {
    const submoduleId = req.params.id;

    let result;
    if (submoduleId) {
      result = await submodule.findByPk(submoduleId);
      if (!result) {
        return res.status(404).json({ success: false, message: "subModule not found" });
      }
    } else {
      result = await submodule.findAll();
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching submodules:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
};


