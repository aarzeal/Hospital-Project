const logger = require("../logger");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const { sequelize } = require("sequelize");
const Group = require("../models/HospitalGroup");
const { validationResult } = require("express-validator");
const getClientIp = require("../util/clientip");
const getLocationData = require("../util/locationHelper");

dotenv.config();

exports.create_Store = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;

  const {
    store_name,
    store_code,
    store_IDR,
    parent_Store_IDR,
    is_Main_store,
    is_Stock_Closing_Daily,
    isActive,
    hospitalIDR,
    hospitalGroupIDR,
    createdBy,
    updatedBy,
  } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const hospital = require("../models/HospitalModel.js");
    const Store = require("../models/Store_Model.js")(req.sequelize);

   // let store_IDR = null;
    if (store_IDR) {
      const storeIDR = await Store.findOne({
        where: { store_id: store_IDR },
      });
      if (!storeIDR) {const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9253;

    logger.logWithMeta("error", "Invalid Store ID, not found in MasterDB", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });
    return res.status(400).json({
      errorCode,
      message: "Invalid Store ID, not found in MasterDB",
    });
    
      }
    }

    const existingStoreName=await Store.findOne({where: {store_name}});
    if(existingStoreName){
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9250;
  
        logger.logWithMeta("error", "Store Name is already exists", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: req.username,
        });
        return res.status(400).json({
          errorCode,
          message: "Store Name is already exists",
        });
    }

    const existingStorecode=await Store.findOne({where: {store_code}});

    if(existingStorecode){
      const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9251;
  
        logger.logWithMeta("error", "Store Code is already exists", {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: req.username,
        });
        return res.status(400).json({errorCode, message: "Store Code is already exists",});
    }

    //let parent_Store_IDR = null;
    if (parent_Store_IDR) {
      const parentStoreIDR = await Store.findOne({
        where: { store_id: parent_Store_IDR },
      });
      if (!parentStoreIDR) { 
        const executionTime = `${Date.now() - start}ms`;
        const errorCode = 9252;

      logger.logWithMeta("error", "Invalid Store ID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username,
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid Store ID, not found in MasterDB",
      });
      }

    }
    const group = await Group.findOne({ where: { HospitalGroupID: hospitalGroupIDR } });

    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9243;

      logger.logWithMeta(
        "error",
        "Invalid HospitalGroupID, not found in MasterDB",
        {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }

    const hospitalid = await hospital.findOne({
      where: { HospitalID: hospitalIDR },
    });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9244;

      logger.logWithMeta("error", "Invalid HospitalID, not found in MasterDB", {
        errorCode,
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username,
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }

    await Store.sync({ force: false });
    const storeData = await Store.create({
      store_name,
      store_code,
      store_IDR,
      parent_Store_IDR,
      is_Main_store,
      is_Stock_Closing_Daily,
      isActive,
      hospitalIDR,
      hospitalGroupIDR,
      createdBy: req.username,
    });

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Store created successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
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
      data: { storeData },
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9003;

    logger.logWithMeta("error", "Error creating Store", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error creating Store: " + error.message },
    });
  }
};

exports.get_all_Stores = async (req, res) => {
  const start = Date.now();
  try {
    const Store = require("../models/Store_Model.js")(req.sequelize);
    const StoresRecords = await Store.findAll();

    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Fetched Stores records successfully", {
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
        totalRecords: StoresRecords.length,
      },
      data: StoresRecords,
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9246;

    logger.logWithMeta("error", "Error fetching Stores records", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error fetching Stores records: " + error.message },
    });
  }
};

exports.get_Store_ById = async (req, res) => {
  //const logId = uuidv4();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);

  try {
      const { store_id } = req.params;
      const Store = require("../models/Store_Model.js")(req.sequelize);
      const store = await Store.findByPk(store_id);
      
      if (!store) {
          logger.logWithMeta("warn", "Store not found", { 
              //logId, 
              errorCode: 9247, 
              apiName: req.originalUrl, 
              method: req.method, 
              clientIp, 
              locationData,
              createdBy: req.username,
              updatedBy:req.username
          });
          return res.status(404).json({ errorCode: 9247, message: "Store not found" });
      }

      logger.logWithMeta("info", "Store fetched successfully", { 
         // logId, 
          apiName: req.originalUrl, 
          method: req.method, 
          clientIp, 
          locationData,
          data: Store,
          createdBy: req.username,
          updatedBy:req.username
      });

      return res.status(200).json({ message: "Store fetched successfully", data: store });
  } catch (error) {
      logger.logWithMeta("error", "Error fetching Store", { 
          //logId, 
          errorCode: 9248, 
          apiName: req.originalUrl, 
          method: req.method, 
          clientIp, 
          errorMessage: error.message, 
          locationData ,
          createdBy: req.username,
          updatedBy:req.username
      });

      return res.status(500).json({ errorCode: 9248, message: "Error fetching Store", error: error.message });
  }
};

exports.update_Store_ById = async (req, res) => {
  const errors = validationResult(req);
  const start = Date.now();
  const clientIp = await getClientIp(req);
  console.log("Client IP:", clientIp);
  const logId = uuidv4();
  const { store_id } = req.params;  

 

  if (!errors.isEmpty()) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9006; // Define a specific error code for validation errors

      logger.logWithMeta("error", "Validation error in update", {
          errorCode,
          executionTime,
          hospitalName: req.hospitalName || "Unknown",
          ip: clientIp,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          validationErrors: errors.array(),
          createdBy: req.username,  // Assign username from token
          updatedBy: req.username
      });

      return res.status(400).json({ 
          message: "Validation failed", 
          errors: errors.array() 
      });
  }
  const locationData = await getLocationData(clientIp);

  const { 
    store_name,
    store_code,
    store_IDR,
    parent_Store_IDR,
    is_Main_store,
    is_Stock_Closing_Daily,
    isActive,
    hospitalIDR,
    hospitalGroupIDR,
    createdBy,
    updatedBy,
  } = req.body;

  const hospitalDatabase = req.hospitalDatabase;

  try {
      const Store = require("../models/Store_Model.js")(req.sequelize);
      //const Group = require("../models/HospitalGroup");
      const HospitalModel = require("../models/HospitalModel");

      // Check if the group exists
      const existingStore = await Store.findOne({ where: { store_id } });
      if (!existingStore) {
          const executionTime = `${Date.now() - start}ms`;
          const errorCode = 9007;

          logger.logWithMeta("error", "Store not found", {
              errorCode,
              executionTime,
              hospitalName: req.hospitalName,
              ip: clientIp,
              ...locationData,
              apiName: req.originalUrl,
              method: req.method,
              userAgent: req.headers["user-agent"],
              createdBy: req.username,  // Assign username from token
              updatedBy: req.username
          });
          return res.status(404).json({ message: "Store not found" });
      }

      // Validate HospitalGroupIDR
      const group = await Group.findOne({ where: { HospitalGroupID: hospitalGroupIDR } });
      if (!group) {
          const executionTime = `${Date.now() - start}ms`;
          const errorCode = 9008;

          logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
              errorCode,
              executionTime,
              hospitalName: req.hospitalName,
              ip: clientIp,
              ...locationData,
              apiName: req.originalUrl,
              method: req.method,
              userAgent: req.headers["user-agent"],
          });
          return res.status(400).json({ message: "Invalid HospitalGroupID, not found in MasterDB" });
      }

      if (store_IDR) {
        const storeIDR = await Store.findOne({
          where: { store_id: store_IDR },
        });
        if (!storeIDR) {
          // store_IDR = storeIDR.store_id;
          res.status(404).json({ message: "Invalid Store ID, not found in MasterDB" });
        }
      }
      if (parent_Store_IDR) {
        const parentStoreIDR = await Store.findOne({
          where: { store_id: parent_Store_IDR },
        });
        if (!parentStoreIDR) {
          // parent_Store_IDR = parentStoreIDR.store_id;
          res.status(404).json({ message: "Invalid Store ID, not found in MasterDB" });

        }
      }

      // Validate HospitalIDR
      const hospitalRecord = await HospitalModel.findOne({ where: { hospitalID: hospitalIDR } });
      if (!hospitalRecord) {
          const executionTime = `${Date.now() - start}ms`;
          const errorCode = 9009;

          logger.logWithMeta("error", "Invalid hospitalID, not found in MasterDB", {
              errorCode,
              executionTime,
              hospitalName: req.hospitalName,
              ip: clientIp,
              ...locationData,
              apiName: req.originalUrl,
              method: req.method,
              userAgent: req.headers["user-agent"],
              createdBy: req.username,  // Assign username from token
              updatedBy: req.username
          });
          return res.status(400).json({ message: "Invalid hospitalID, not found in MasterDB" });
      }

      // Update the group
      await existingStore.update({
        store_name,
        store_code,
        store_IDR,
        parent_Store_IDR,
        is_Main_store,
        is_Stock_Closing_Daily,
        isActive,
        hospitalIDR,
        hospitalGroupIDR,
        updatedBy:req.username,
        updatedAt: new Date(),
      });

      const executionTime = `${Date.now() - start}ms`;

      logger.logWithMeta("info", "Store updated successfully", {
          executionTime,
          logId,
          hospitalName: req.hospitalName,
          ip: clientIp,
          ...locationData,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,  // Assign username from token
          updatedBy: req.username
      });

      res.status(200).json({
          meta: {
              statusCode: 200,
              executionTime,
              hospitalDatabase,
          },
          data: { updatedStore: existingStore },
      });
  } catch (error) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9010;

      logger.logWithMeta("error", "Error updating Store", {
          errorCode,
          executionTime,
          hospitalName: req.hospitalName,
          ip: clientIp,
          ...locationData,
          apiName: req.originalUrl,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,  // Assign username from token
          updatedBy: req.username
      });

      res.status(500).json({
          meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
          error: { message: "Error updating Store: " + error.message },
      });
  }
};

exports.delete_Strore_By_Id = async (req, res) => {
  const start = Date.now();
  const hospitalDatabase = req.hospitalDatabase;
  const { store_id } = req.params;
  try {
    const Store = require("../models/Store_Model.js")(req.sequelize);
    const logger = require("../logger");

    const store = await Store.findOne({ where: { store_id } });
    if (!store) {
      logger.logWithMeta("error", "Store not found", { store_id, hospitalDatabase, apiName: req.originalUrl });
      return res.status(404).json({ errorCode: 9247, message: "Store not found" });
    }

    await store.destroy();
    const executionTime = `${Date.now() - start}ms`;
    logger.logWithMeta("info", "Store deleted successfully", { store_id, hospitalDatabase, executionTime, apiName: req.originalUrl });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Store deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9250;
    logger.logWithMeta("error", "Error deleting Store", { errorCode, executionTime, hospitalDatabase, apiName: req.originalUrl, error: error.message });
    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error deleting Store: " + error.message },
    });
  }
};