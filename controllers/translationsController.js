const fs = require("fs");
const path = require("path");
const logger = require("../logger");
const requestIp = require('request-ip');
const axios = require('axios');


async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 1089 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

// GET API to retrieve labels by language
const getLabelsByLanguage = async (req, res) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
  
  try {
    const { component, language } = req.params;
    const pathData = path.join(__dirname, `../Data/${component}.json`);

    // Check if the component file exists
    if (!fs.existsSync(pathData)) {

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1090;
  
      // Log the warning
      logger.logWithMeta("warn", `Component file not found${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });

      return res.status(404).json({
        errorCode: 1090,
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
    const end = Date.now();
    const executionTime = `${end - start}ms`;
  
    // Log the warning
    logger.logWithMeta("warn", `Translations fetched for component:`, {
      executionTime,
      component,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
   
    res.status(200).json(translations);
  } catch (error) {

    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1091;

    // Log the warning
    logger.logWithMeta("warn", `Error fetching translations ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });

    res.status(500).json({
      errorCode: 1091,
      message: "Error fetching translations",
      error: error.message,
    });
  }
};

// POST API to create or update the component JSON file
const createOrUpdateComponent = async (req, res) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
  const start = Date.now();
  try {
    const { component } = req.params;
    const pathData = path.join(__dirname, `../Data/${component}.json`);
    const newData = req.body;

    // Validate request body
    if (!newData || typeof newData !== "object") {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1092;
  
      // Log the warning
      logger.logWithMeta("warn", `Invalid data format for component:${component} ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
    
      return res.status(400).json({
        errorCode: 1092,
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

      const end = Date.now();
      const executionTime = `${end - start}ms`;
    
      // Log the warning
      logger.logWithMeta("warn", `Component data updated successfully`, {
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method   ,  
        userAgent: req.headers['user-agent'],    // HTTP method
      });
      res.status(200).json({
        message: "Component data updated successfully",
       
      });
    } else {
      // If the file doesn't exist, create it with the new data
      fs.writeFileSync(pathData, JSON.stringify(newData, null, 2), "utf8");
      const end = Date.now();
      logger.logWithMeta("info", `Component file created: ${component}`, {
        executionTime: `${end - start}ms`,
        component,
      });
      res.status(200).json({
        message: "Component file created successfully",
        
      });
    }
  } catch (error) {
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1093;

    // Log the warning
    logger.logWithMeta("warn", `Error creating/updating component::${component} ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });

    
    res.status(500).json({
      errorCode,
      message: "Error creating/updating component",
      error: error.message,
    });
  }
};

module.exports = {
  getLabelsByLanguage,
  createOrUpdateComponent,
};
