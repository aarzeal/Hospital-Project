const fs = require("fs");
const path = require("path");
const logger = require("../logger");

// GET API to retrieve labels by language
const getLabelsByLanguage = async (req, res) => {
  try {
    const { component, language } = req.params;
    const pathData = path.join(__dirname, `../Data/${component}.json`);

    // Check if the component file exists
    if (!fs.existsSync(pathData)) {
        logger.warn(`Component file not found: ${component}`);
      return res.status(404).json({
        errorCode: 1077,
        message: "Component file not found",
      });
    }

    const rawData = fs.readFileSync(pathData);
    const labels = JSON.parse(rawData);

    const translations = {};

    for (const key in labels) {
      if (labels[key][language]) {
        translations[key] = labels[key][language];
      } else {
        translations[key] = labels[key]["en"];
      }
    }
    logger.info(`Translations fetched for component: ${component}`);
    res.status(200).json(translations);
  } catch (error) {
    logger.error(`Error fetching translations: ${error.message}`);
    res.status(500).json({
      errorCode: 1078,
      message: "Error fetching translations",
      error: error.message,
    });
  }
};

// POST API to create or update the component JSON file
const createOrUpdateComponent = async (req, res) => {
  try {
    const { component } = req.params;
    const pathData = path.join(__dirname, `../Data/${component}.json`);
    const newData = req.body;

    // Validate request body
    if (!newData || typeof newData !== "object") {
        logger.warn(`Invalid data format for component: ${component}`);
      return res.status(400).json({
        errorCode: 1079,
        message: "Invalid data format. Expected a JSON object.",
      });
    }

    // Check if the file already exists
    if (fs.existsSync(pathData)) {
      // Read the existing data from the file
      const rawData = fs.readFileSync(pathData);
      const existingData = JSON.parse(rawData);

      // Merge the existing data with the new data
      const updatedData = { ...existingData, ...newData };

      // Write the updated data back to the file
      fs.writeFileSync(pathData, JSON.stringify(updatedData, null, 2), "utf8");

      logger.info(`Component data updated: ${component}`);
      res.status(200).json({
        message: "Component data updated successfully",
       
      });
    } else {
      // If the file doesn't exist, create it with the new data
      fs.writeFileSync(pathData, JSON.stringify(newData, null, 2), "utf8");
      logger.info(`Component file created: ${component}`);
      res.status(200).json({
        message: "Component file created successfully",
        
      });
    }
  } catch (error) {
    logger.error(`Error creating/updating component: ${error.message}`);
    res.status(500).json({
      errorCode: 1080,
      message: "Error creating/updating component",
      error: error.message,
    });
  }
};

module.exports = {
  getLabelsByLanguage,
  createOrUpdateComponent,
};
