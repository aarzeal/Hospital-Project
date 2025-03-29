// const Module = require("../models/masterModule");
// const logger = require('../logger');
// const bcrypt = require('bcryptjs');

// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// const requestIp = require('request-ip');
// const { Sequelize } = require("sequelize");
// const Group = require("../models/HospitalGroup"); 
// const { validationResult } = require('express-validator');
// const getClientIp = require('../util/clientip');
// const getLocationData = require("../util/locationHelper"); 
// dotenv.config();

// exports.createWwca = async (req, res) => {
//   const errors = validationResult(req);
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);
//   const hospitalDatabase = req.hospitalDatabase;

//   const {
//     wardIDR,
//     typeEnum,
//     typeIDR,
//     costAddRate,
//     fromdate,
//     todate,
//     isActive,
//     isCurrectRate,
//     hospital_IDR,
//     hospitalGroup_IDR,
//     createdBy,
//     updatedBy,
//   } = req.body;

//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const Wwca = require("../models/wardwiseCAModel")(req.sequelize);
//     const HospitalGroup = require("../models/HospitalGroup")(req.sequelize);
//     const Hospital = require("../models/HospitalModel")(req.sequelize);

//     const group = await HospitalGroup.findOne({ where: { hospitalGroup_IDR } });
//     if (!group) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 9227;

//       logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalName,
//         apiName: req.originalUrl,
//         city: locationData?.city,
//         country: locationData?.country,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//         createdBy: req.username,
//       });
//       return res.status(400).json({ errorCode, message: "Invalid HospitalGroupID, not found in MasterDB" });
//     }

//     const hospital = await Hospital.findOne({ where: { hospital_IDR } });
//     if (!hospital) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 1260;

//       logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalName,
//         apiName: req.originalUrl,
//         city: locationData?.city,
//         country: locationData?.country,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//         createdBy: req.username,
//       });
//       return res.status(400).json({ errorCode, message: "Invalid HospitalID, not found in MasterDB" });
//     }

//     await Wwca.sync({ force: false });

//     const wwca = await Wwca.create({
//       wardIDR,
//       typeEnum,
//       typeIDR,
//       costAddRate,
//       fromdate,
//       todate,
//       isActive,
//       isCurrectRate,
//       hospital_IDR,
//       hospitalGroup_IDR,
//       createdBy: req.username,
//       updatedBy: req.username,
//     });

//     const executionTime = `${Date.now() - start}ms`;
//     logger.logWithMeta("info", "Wwca record created successfully", {
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       ip: clientIp,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: req.username,
//     });

//     res.status(200).json({
//       meta: {
//         statusCode: 200,
//         executionTime,
//         hospitalDatabase,
//       },
//       data: { wwca },
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1262;

//     logger.logWithMeta("error", "Error creating Wwca record", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: req.username,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//       error: { message: "Error creating Wwca record: " + error.message },
//     });
//   }
// };

// exports.getWwca = async (req, res) => {
//     const start = Date.now();
//     try {
//       const Wwca = require("../models/wardwiseCAModel")(req.sequelize);
//       const wwcaRecords = await Wwca.findAll();

//       const executionTime = `${Date.now() - start}ms`;
//       logger.logWithMeta("info", "Fetched Wwca records successfully", {
//         executionTime,
//         hospitalId: req.hospitalName,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });

//       res.status(200).json({
//         meta: {
//           statusCode: 200,
//           executionTime,
//           totalRecords: wwcaRecords.length,
//         },
//         data: wwcaRecords,
//       });
//     } catch (error) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 1263;

//       logger.logWithMeta("error", "Error fetching Wwca records", {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalName,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });

//       res.status(500).json({
//         meta: { statusCode: 500, errorCode, executionTime },
//         error: { message: "Error fetching Wwca records: " + error.message },
//       });
//     }
//   };


//   exports.getWwcaById = async (req, res) => {
//     const start = Date.now();
//     const { id } = req.params;
//     try {
//       const Wwca = require("../models/wardwiseCAModel")(req.sequelize);
//       const wwcaRecord = await Wwca.findByPk(id);

//       if (!wwcaRecord) {
//         return res.status(404).json({ message: "Wwca record not found" });
//       }

//       const executionTime = `${Date.now() - start}ms`;
//       logger.logWithMeta("info", "Fetched Wwca record by ID successfully", {
//         executionTime,
//         hospitalId: req.hospitalName,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//       });

//       res.status(200).json({
//         meta: {
//           statusCode: 200,
//           executionTime,
//         },
//         data: wwcaRecord,
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Error fetching Wwca record: " + error.message });
//     }
//   };

const Module = require("../models/masterModule");
const logger = require('../logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const requestIp = require('request-ip');
const { Sequelize } = require("sequelize");
// const HospitalGroup = require("../models/HospitalGroup");
// const Hospital = require("../models/HospitalModel.js");
const { validationResult } = require('express-validator');
const getClientIp = require('../util/clientip');
const getLocationData = require("../util/locationHelper");
dotenv.config();


exports.createWwca = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const {
    wardIDR,
    typeEnum,
    serviceIDR,
    costAddRate,
    fromdate,
    todate,
    isActive,
    isCurrectRate,
    hospital_IDR,
    hospitalGroup_IDR,
    createdBy,
    updatedBy,
  } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const Wwca = require("../models/wardwiseCAModel.js")(req.sequelize);
  const Hospital = require("../models/HospitalModel.js");
  const HospitalGroup = require("../models/HospitalGroup.js");

  try {

    const group = await HospitalGroup.findOne({ where: { HospitalGroupID: hospitalGroup_IDR } });
    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
      });
      return res.status(400).json({ errorCode, message: "Invalid HospitalGroupID, not found in MasterDB" });
    }

    const hospitalid = await Hospital.findOne({ where: { HospitalID: hospital_IDR } });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username
      });
      return res.status(400).json({ errorCode, message: "Invalid HospitalID, not found in MasterDB" });
    }

    await Wwca.sync({ force: false });

    const wwcaData = await Wwca.create({
      wardIDR,
      typeEnum,
      serviceIDR,
      costAddRate,
      fromdate,
      todate,
      isActive,
      isCurrectRate,
      hospital_IDR,
      hospitalGroup_IDR,
      createdBy: req.username,
      // updatedBy,
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Ward created successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: { wwcaData },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1262;

    logger.logWithMeta("error", "Error creating ward wise cost addition record", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error creating ward wise cost addition record: " + error.message },
    });
  }
};

exports.getWwca = async (req, res) => {
  const start = Date.now();
  try {
    const Wwca = require("../models/wardwiseCAModel")(req.sequelize);
    const wwcaRecords = await Wwca.findAll();

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Fetched ward wise cost addition records successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        totalRecords: wwcaRecords.length,
      },
      data: wwcaRecords,
    });

  } catch (error) {

    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching ward wise cost addition records", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error fetching ward wise cost addition records: " + error.message },
    });
  }

}
exports.getWwcaById = async (req, res) => {
  const start = Date.now();
  const { Wwca_ID } = req.params;

  try {
    const Wwca = require("../models/wardwiseCAModel")(req.sequelize);
    const wwcaRecord = await Wwca.findByPk(Wwca_ID);

    if (!wwcaRecord) {
      return res.status(404).json({ message: "Wwca record not found" });
    }

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Fetched Wwca record by ID successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: wwcaRecord,
    });

  } catch (error) {

    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching ward wise cost addition records", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error fetching ward wise cost addition records: " + error.message },
    });
  }
}

exports.updateWwcaById = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const {
    wardIDR,
    typeEnum,
    typeIDR,
    costAddRate,
    fromdate,
    todate,
    isActive,
    isCurrectRate,
    hospital_IDR,
    hospitalGroup_IDR,
    createdBy,
    updatedBy,
  } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { Wwca_ID } = req.params;

    const Wwca = require("../models/wardwiseCAModel.js")(req.sequelize);
    const Hospital = require("../models/HospitalModel.js");
    const HospitalGroup = require("../models/HospitalGroup.js");

    const group = await HospitalGroup.findOne({ where: { HospitalGroupID: hospitalGroup_IDR } });
    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
      });
      return res.status(400).json({ errorCode, message: "Invalid HospitalGroupID, not found in MasterDB" });
    }

    const hospitalid = await Hospital.findOne({ where: { HospitalID: hospital_IDR } });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username
      });
      return res.status(400).json({ errorCode, message: "Invalid HospitalID, not found in MasterDB" });
    }

    const wardWiseData = await Wwca.findOne({ where: { Wwca_ID } });
    if (!wardWiseData) {
      logger.logWithMeta("error", "Ward wise cost addition not found", { Wwca_ID, hospitalDatabase, apiName: req.originalUrl });
      return res.status(404).json({ errorCode: 1261, message: "Ward wise cost addition not found" });
    }

    await wardWiseData.update({
      wardIDR,
      typeEnum,
      typeIDR,
      costAddRate,
      fromdate,
      todate,
      isActive,
      isCurrectRate,
      hospital_IDR,
      hospitalGroup_IDR,
      updatedBy: req.username,
      UpdatedAt: new Date(),
    });


    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Ward wise cost addition updated successfully", {
      Wwca_ID, hospitalDatabase, executionTime, city: locationData?.city,
      country: locationData?.country, apiName: req.originalUrl
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: { wardWiseData },
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1262;

    logger.logWithMeta("error", "Error updating ward wise cost addition", { errorCode, executionTime, hospitalDatabase, apiName: req.originalUrl, error: error.message });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating ward wise cost addition: " + error.message },
    });
  }
}

exports.deleteWwcaById = async (req, res) => {
  const start = Date.now();
  const hospitalDatabase = req.hospitalDatabase;
  const { Wwca_ID } = req.params;

  try {
    const Wwca = require("../models/wardwiseCAModel.js")(req.sequelize);

    const wardWiseData = await Wwca.findOne({ where: { Wwca_ID } });

    if (!wardWiseData) {
      logger.logWithMeta("error", "Ward wise cost addition not found", { Wwca_ID, hospitalDatabase, apiName: req.originalUrl });
      return res.status(404).json({ errorCode: 1261, message: "Ward wise cost addition not found" });
    }

    await wardWiseData.destroy();
    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Ward wise cost addition deleted successfully", { Wwca_ID, hospitalDatabase, executionTime, apiName: req.originalUrl });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Ward wise cost addition deleted successfully",
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;
    logger.logWithMeta("error", "Error deleting ward wise cost addition", { errorCode, executionTime, hospitalDatabase, apiName: req.originalUrl, error: error.message });
    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error deleting ward wise cost addition: " + error.message },
    });
  }
}