
const dotenv = require('dotenv');
const axios = require('axios');
const logger = require('../logger'); 
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
const HospitalId = require("../models/HospitalModel");
const { validationResult } = require('express-validator');

dotenv.config();
async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {
      logger.logWithMeta('Error fetching public IP', { error: error.message, errorCode: 971 });
    //   clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

exports.createTaxMap = async (req, res) => {
 const errors = validationResult(req);

    const start = Date.now();
    const clientIp = await getClientIp(req);
  console.log('Client IP:', clientIp);

    // const logId = uuidv4();

    let locationData = { city: 'Unknown' };

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

     try {
       const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
       locationData = locationResponse.data;
       console.log('Location Data:', locationData);
     } catch (error) {
       logger.error('Error fetching location data', { error: error.message });
     }


    const { item_IDR,tax_IDR,hospital_IDR,type } = req.body;
    
    const hospitalDatabase = req.hospitalDatabase;

    try {
        const Tax_map = require("../models/Itom_TaxMap_model")(req.sequelize);
    
        const tax_map = await HospitalId.findOne({ where: { hospitalId: hospital_IDR } });

        console.log("tax_map0000000000", tax_map)


        if (!tax_map) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 1278;
    
            logger.logWithMeta("error", "Invalid HospitalId, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
              city: locationData?.city,
              country: locationData?.country,
              regionName: locationData?.regionName,
              zip: locationData?.zip,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });
            return res.status(400).json({ message: "Invalid HospitalId, not found in MasterDB" });
        }



        const item_ID = require("../models/Item_Model")(req.sequelize);

        const Item_IDR = await item_ID.findOne({
            where: {Item_id : item_IDR }
        });

        if (!Item_IDR) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 1279;
    
            logger.logWithMeta("error", "Invalid Item_IDR  not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
              city: locationData?.city,
              country: locationData?.country,
              regionName: locationData?.regionName,
              zip: locationData?.zip,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });
            return res.status(400).json({errorCode, message: "Invalid Item_IDR, not found in MasterDB" });
        }


        const tax_ID = require("../models/Tax_Model")(req.sequelize);

        const Tax_IDR = await tax_ID.findOne({
            where: { tax_id: tax_IDR }
        });

        if (!Tax_IDR) {
            const executionTime = `${Date.now() - start}ms`;
            const errorCode = 1280;
    
            logger.logWithMeta("error", "Invalid Tax_IDR, not found in MasterDB", {
                errorCode,
                executionTime,
                hospitalName: req.hospitalName,
                ip: clientIp,
              city: locationData?.city,
              country: locationData?.country,
              regionName: locationData?.regionName,
              zip: locationData?.zip,
                apiName: req.originalUrl,
                method: req.method,
                userAgent: req.headers["user-agent"],
            });

            return res.status(400).json({ message: "Invalid Tax_IDR, not found in MasterDB" });
        }





        await Tax_map.sync();

        const service = await Tax_map.create({
          item_IDR,tax_IDR,hospital_IDR,type
        });






        const executionTime = `${Date.now() - start}ms`;

        logger.logWithMeta("info", "service created successfully", {
            executionTime,
            // logId,
            hospitalName: req.hospitalName,
            ip: clientIp,
          city: locationData?.city,
          country: locationData?.country,
          regionName: locationData?.regionName,
          zip: locationData?.zip,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
            
      
            
        });

        res.status(200).json({
            meta: {
                statusCode: 200,
                executionTime,
                hospitalDatabase,
            },
            data: { service },
        });
    } catch (error) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1281;

        logger.logWithMeta("error", "Error creating service", {
            errorCode,
            executionTime,
            hospitalName: req.hospitalName,
            ip: clientIp,
          city: locationData?.city,
          country: locationData?.country,
          regionName: locationData?.regionName,
          zip: locationData?.zip,
            apiName: req.originalUrl,
            method: req.method,
            userAgent: req.headers["user-agent"],
        });

        res.status(500).json({
            meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
            error: { message: "Error creating service: " + error.message },
        });
    }
};

exports.getAllTaxMaps = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { id } = req.query; // Get ledger_id from query params
  const hospitalDatabase = req.hospitalDatabase;

  try {
    // Load Sequelize models properly
    const Tax_Map = require("../models/Itom_TaxMap_model");
    const tax_map = Tax_Map(req.sequelize); // Initialize model with Sequelize instance

    if (id) {
      // Fetch single record by ID
      const item = await tax_map.findOne({ where: { taxMap_id } });
      if (!item) {
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 1270;
    
        logger.logWithMeta("error", "Error fetching tax_map", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalId,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
        });
        return res.status(404).json({errorCode, message: "tax_map not found" });
      }
      return res.status(200).json({
        meta: { statusCode: 200, hospitalDatabase },
        data: accLedger,
      });
    } else {
      // Fetch all records
      const tax_maps = await tax_map.findAll();
      return res.status(200).json({
        meta: { statusCode: 200, hospitalDatabase },
        data: tax_maps,
      });
    }
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1271;

    logger.logWithMeta("error", "Error fetching tax_map", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching tax_map: " + error.message },
    });
  }
};
exports.getTaxMapById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { taxMap_id } = req.params;

  try {
    // Ensure model initialization with Sequelize instance
    const TaxMap = require("../models/Itom_TaxMap_model")(req.sequelize);

    // Fetch the tax map entry by primary key
    const taxmap = await TaxMap.findByPk(taxMap_id);

    if (!taxmap) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1272;

      logger.logWithMeta("error", "Tax map not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        ip: clientIp,
      });

      return res.status(404).json({ errorCode, message: "Tax map not found" });
    }

    const executionTime = `${Date.now() - start}ms`;

    res.status(200).json({
      meta: { statusCode: 200, executionTime },
      data: taxmap, // Fix: Returning the correct variable
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1273;

    logger.logWithMeta("error", "Error retrieving tax map", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      ip: clientIp,
      error: error.message,
    });

    res.status(500).json({
      errorCode,
      message: "Error retrieving tax map",
      error: error.message,
    });
  }
};


exports.deleteTaxMap = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { taxMap_id } = req.params;

  try {
    const TaxMap = require("../models/Itom_TaxMap_model")(req.sequelize);
    const taxmap = await TaxMap.findByPk(taxMap_id);

    if (!taxmap) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1274;

      logger.logWithMeta("error", "Tax map not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        ip: clientIp,
      });

      return res.status(404).json({ errorCode, message: "Tax map not found" });
    }

    await taxmap.destroy();

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Tax map deleted successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      ip: clientIp,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime },
      message: "Tax map deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1275;

    logger.logWithMeta("error", "Error deleting tax map", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      ip: clientIp,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error deleting tax map: " + error.message },
    });
  }
};

exports.updateTaxMap = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const { taxMap_id } = req.params;
  const updateData = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const TaxMap = require("../models/Itom_TaxMap_model")(req.sequelize);
    const taxmap = await TaxMap.findByPk(taxMap_id);

    if (!taxmap) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1276;

      logger.logWithMeta("error", "Tax map not found", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalId,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        ip: clientIp,
      });

      return res.status(404).json({ errorCode, message: "Tax map not found" });
    }

    await taxmap.update(updateData);

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Tax map updated successfully", {
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      ip: clientIp,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime },
      message: "Tax map updated successfully",
      data: taxmap, // Fix: Corrected variable reference
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1277;

    logger.logWithMeta("error", "Error updating tax map", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalId,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      ip: clientIp,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error updating tax map: " + error.message },
    });
  }
};
