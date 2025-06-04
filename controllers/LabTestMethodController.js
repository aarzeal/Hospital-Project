const { toProductEntity } = require("../dtos/LabTestMethodDTO");
const logger = require("../logger");
const LabTestMethodDao = require("../Dao/LabTestMethodDao");
const dto = require("../dtos/LabTestMethodDTO");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const Hospital = require("../models/HospitalModel");
const HospitalGroup = require("../models/HospitalGroup");

exports.createLabTestMethod = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  try {
    const hospitalid = await Hospital.findOne({
      where: { HospitalID: req.body.hospitalIDR },
    });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitaID, not found in MasterDB", {
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
    console.log("req.username:::", req.body)
    const group = await HospitalGroup.findOne({
      where: { HospitalGroupID: req.body.hospitalGroupIDR },
    });
    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta(
        "error",
        "Invalid Hospital Group ID, not found in MasterDB",
        {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          // updatedBy:req.username
        }
      );
      return res
        .status(400)
        .json({
          errorCode,
          message: "Invalid HospitalGroupID, not found in MasterDB",
        });
    }

    const labtestmethodData = dto.toLabTestMethodPOST(req.body);

    const result = await LabTestMethodDao.createLabTestMethod(
      req.sequelize,
      labtestmethodData
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab test method created successfully", {
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

    res.status(201).json({
      message: "Lab test method created successfully",
      meta: {
        statusCode: 200,
        executionTime,
      },
      data: dto.toLabTestMethodEntity(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 2;

    logger.logWithMeta("error", "Error creating LabTestMethod", {
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
      meta: { statusCode: 500, errorCode, executionTime },
      error: { message: "Error creating LabTestMethod: " + error.message },
    });
  }
};

exports.getAllLabTestMethod = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
    if (!req.sequelize) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9088; // Database connection error

      logger.logWithMeta("error", "Database connection not found", {
        errorCode,
        executionTime,
        hospitalName: req.hospitalName || "Unknown",
        ip: clientIp,
        city: locationData?.city,
        country: locationData?.country,
        apiName: req.originalUrl,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username
      });

      return res.status(500).json({
        message: "Database connection not found",
        statusCode: 500,
        errorCode
      });
    }

    const result = await LabTestMethodDao.getAllLabTestMethodDAO(req.sequelize);

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched wards successfully", {
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
      updatedBy: req.username
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(dto.toLabTestMethodEntity)
    });
  } catch (err) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching service categories", {
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
      updatedBy: req.username
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching ward: " + error.message },
    });
  }
}

exports.getLabTestMethodById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
    const { id } = req.params;
    const result = await LabTestMethodDao.getLabTestMethodByIdDAO(req.sequelize, id);

    if (!result) {

      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "Lab test method not found", {
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
        updatedBy: req.username
      });

      return res.status(404).json({ errorCode: 1263, message: "Ward not found" });
    }
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched lab test method successfully", {
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
      updatedBy: req.username
    });
    res.status(200).json({

      meta: {
        statusCode: 200,
        executionTime: `${Date.now() - start}ms`,
        hospitalDatabase,
      },
      data: dto.toLabTestMethodEntity(result),
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1262;

    logger.logWithMeta("error", "Error fetching lab test method", {
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
      updatedBy: req.username
    });
    res.status(500).json({
      meta: { statusCode: 500, errorCode: 1264, executionTime: `${Date.now() - start}ms`, hospitalDatabase },
      error: { message: "Error fetching lab test method: " + error.message },
    });
  }

}

exports.updateLabTestMethodById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  try {
    const hospitalid = await Hospital.findOne({
      where: { HospitalID: req.body.hospitalIDR },
    });
    if (!hospitalid) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta("error", "Invalid HospitaID, not found in MasterDB", {
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
    console.log("req.username:::", req.body)
    const group = await HospitalGroup.findOne({
      where: { HospitalGroupID: req.body.hospitalGroupIDR },
    });
    if (!group) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1260;

      logger.logWithMeta(
        "error",
        "Invalid Hospital Group ID, not found in MasterDB",
        {
          errorCode,
          executionTime,
          hospitalId: req.hospitalName,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          // updatedBy:req.username
        }
      );
      return res
        .status(400)
        .json({
          errorCode,
          message: "Invalid HospitalGroupID, not found in MasterDB",
        });
    }

    const updated = await LabTestMethodDao.updateLabTestMethodByIdDAO(req.sequelize, req.params.lab_test_method_id, dto.toLabTestMethodPOST(req.body));
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab tet name updated successfully", {
      ID: req.params.lab_test_method_id,
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    if (!updated) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid lab test id, not found in DB",
        {
          errorCode,
          executionTime,
          ID: req.params.lab_test_method_id,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          // updatedBy:req.username
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid lab test id, not found in DB",
      });
    }

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: dto.toLabTestMethodEntity(updated),
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error updating lab test method", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating lab test method: " + error.message },
    });
  }
}

exports.deleteLabTestMethodById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { lab_test_method_id } = req.params;
  try {
    const deleted = await LabTestMethodDao.deleteLabTestMethodByIdDAO(req.sequelize, lab_test_method_id);
    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid lab test id, not found in DB",
        {
          errorCode,
          executionTime,
          ID: req.params.lab_test_method_id,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          // updatedBy:req.username
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid lab test id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Lab test method DELETED successfully", {
      executionTime,
      ID: req.params.lab_test_method_id,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Lab test method deleted successfully",
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error updating lab test method", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating lab test method: " + error.message },
    });
  }
}
