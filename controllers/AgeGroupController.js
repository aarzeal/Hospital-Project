const logger = require("../logger");
const AgeGroupDao = require("../Dao/AgeGroupDao");
const dto = require("../dtos/AgeGroupDTO");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const Hospital = require("../models/HospitalModel");
const HospitalGroup = require("../models/HospitalGroup");
const {agegroupschema}=require("../validators/joi-validator");

exports.createAgeGroup = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;
  try {
     const { error } = agegroupschema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

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
        createdBy: username,
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }
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
          createdBy: username,
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }  
    const RequestBody = {
      ...req.body,
      createdBy: username,
    };
    const ageGroupData = dto.toAgeGroupPOST(RequestBody);

    const result = await AgeGroupDao.createAgeGroupDao(
      req.sequelize,
      ageGroupData
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Age Group created successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: username,
    });

    res.status(201).json({
      message: "Age Group created successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: dto.toAgeGroupEntity(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 2;

    logger.logWithMeta("error", "Error creating Age Group", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      apiName: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: username,
    });
    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime,hospitalDatabase },
      error: { message: "Error creating Age Group  : " + error.message },
    });
  }
};

exports.getAllAgeGroups = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
    if (!req.sequelize) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9088; 

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
        updatedBy: req.username,
      });

      return res.status(500).json({
        message: "Database connection not found",
        statusCode: 500,
        errorCode,
      });
    }
    const result = await AgeGroupDao.getAllAgeGroupDAO(req.sequelize);
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Age Groups successfully", {
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
      updatedBy: req.username,
    });

    res.status(200).json({
      message: "All Age Groups Feached successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(dto.toAgeGroupEntity),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching Age Groups", {
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
    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching Age Groups: " + error.message },
    });
  }
};

exports.getAgeGroupById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);
  try {
    const { id } = req.params;
    const result = await AgeGroupDao.getAgeGroupByIdDAO(
      req.sequelize,
      id
    );

    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "Age Group not found", {
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

      return res
        .status(404)
        .json({ errorCode: 1263, message: "Age Group not found in Database",hospitalDatabase });
    }
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Age Group successfully", {
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
      updatedBy: req.username,
    });
    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime: `${Date.now() - start}ms`,
        hospitalDatabase,
      },
      data: dto.toAgeGroupEntity(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1262;

    logger.logWithMeta("error", "Error fetching Age Group", {
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
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 1264,
        executionTime: `${Date.now() - start}ms`,
        hospitalDatabase,
      },
      error: { message: "Error fetching Age Group: " + error.message },
    });
  }
};

exports.updateAgeGroupById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username =req.username;
  try {
         const { error } = agegroupschema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
        
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
        updatedBy: username,
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalID, not found in MasterDB",
      });
    }
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
          updatedBy: username
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }
    const { age_group_id } = req.params;
          const RequestBody={
            ...req.body,
            updatedBy:username,
        };
        const ageGroupData = dto.toAgeGroupPOST(RequestBody);
        const updated = await AgeGroupDao.updateAgeGroupByIdDAO(req.sequelize, age_group_id, ageGroupData);

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Age Group updated successfully", {
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    if (!updated) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid Age Group id, not found in DB", {
        errorCode,
        executionTime,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: username
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid Age Group id, not found in DB",
      });
    }

    res.status(200).json({
      message:"AgeGroup Updated Successfully",
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: dto.toAgeGroupEntity(updated),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error updating Age Group", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating Age Group: " + error.message },
    });
  }
};

exports.deleteAgeGroupById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { age_group_id } = req.params;
  try {
    const deleted = await AgeGroupDao.deleteAgeGroupByIdDAO(
      req.sequelize,
      age_group_id
    );
    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta("error", "Invalid Age Group id, not found in Database", {
        errorCode,
        executionTime,
        ID: req.params.age_group_id,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy:req.username
      });
      return res.status(400).json({
        errorCode,
        message: "Invalid lab test id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Age Group Deleted successfully", {
      executionTime,
      ID: req.params.age_group_id,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Age Group deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Deleting Age Group", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Deleting Age Group: " + error.message },
    });
  }
};

// exports.getCustomDataAsPerQueryParam = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const hospitalDatabase = req.hospitalDatabase;
//   const locationData = await getLocationData(clientIp);

//   try {
//     if (!req.sequelize) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 9088;

//       logger.logWithMeta("error", "Database connection not found", {
//         errorCode,
//         executionTime,
//         hospitalName: req.hospitalName || "Unknown",
//         ip: clientIp,
//         city: locationData?.city,
//         country: locationData?.country,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//         createdBy: req.username,
//         updatedBy: req.username,
//       });

//       return res.status(500).json({
//         message: "Database connection not found",
//         statusCode: 500,
//         errorCode,
//       });
//     }

//     const { page, limit, ...queryFields } = req.query;
//     const fieldMap = dto.ageGroupFieldMap;

//     const ID_DTO_FIELD = "ageGroupId";

//     let requestedDtoFields = Object.keys(queryFields).filter(field => field in fieldMap);

//     if (!requestedDtoFields.includes(ID_DTO_FIELD)) {
//       requestedDtoFields.unshift(ID_DTO_FIELD);
//     }

//     const attributes = [...new Set(requestedDtoFields.map(dtoField => fieldMap[dtoField]))];

//     if (Object.keys(queryFields).length && attributes.length === 0) {
//       return res.status(400).json({
//         message: "Invalid or unknown fields in query parameters",
//         statusCode: 400,
//       });
//     }

//     let pagination = {};
//     let pageNum, limitNum;
//     if (page && limit) {
//       pageNum = parseInt(page);
//       limitNum = parseInt(limit);
//       if (!isNaN(pageNum) && !isNaN(limitNum)) {
//         pagination.offset = (pageNum - 1) * limitNum;
//         pagination.limit = limitNum;
//       }
//     }

//     const { count: totalRecords, rows } = await AgeGroupDao.getCustomDataAsPerQueryParamDAO(
//       req.sequelize,
//       {
//         attributes,
//         ...pagination,
//       }
//     );

//     const executionTime = `${Date.now() - start}ms`;

//     logger.logWithMeta("info", "Fetched Age Group successfully", {
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       ip: clientIp,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: req.username,
//       updatedBy: req.username,
//     });

//     const responseData = rows.map(record => {
//       const fullDto = dto.toAgeGroupEntity(record);
//       const filteredDto = {};
//       for (const key of requestedDtoFields) {
//         if (key in fullDto) {
//           filteredDto[key] = fullDto[key];
//         }
//       }
//       return filteredDto;
//     });

//     const responseMeta = {
//       statusCode: 200,
//       executionTime,
//       hospitalDatabase,
//     };

//     if (pageNum && limitNum) {
//       responseMeta.pagination = {
//         page: pageNum,
//         limit: limitNum,
//         totalRecords,
//         totalPages: Math.ceil(totalRecords / limitNum),
//       };
//     }

//     res.status(200).json({
//       meta: responseMeta,
//       data: responseData,
//     });

//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1263;

//     logger.logWithMeta("error", "Error fetching Age Group ", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: req.username,
//       updatedBy: req.username,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//       error: { message: "Error fetching Age Group: " + error.message },
//     });
//   }
// };

exports.getDataAsPerQueryParam = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    if (!req.sequelize) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9088;

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
        updatedBy: req.username,
      });

      return res.status(500).json({
        message: "Database connection not found",
        statusCode: 500,
        errorCode,
      });
    }

    const { page, limit, ...queryFields } = req.query;
    const fieldMap = dto.ageGroupFieldMap;

    const ID_DTO_FIELD = "ageGroupId"; // Ensure this matches your DTO
    const ID_DB_FIELD = fieldMap[ID_DTO_FIELD];

    // Extract valid DTO fields from query params
    let requestedDtoFields = Object.keys(queryFields).filter(field => field in fieldMap);
     if (requestedDtoFields.length === 0) {
  requestedDtoFields = Object.keys(fieldMap);
}

    // Always include the ID field
    if (!requestedDtoFields.includes(ID_DTO_FIELD)) {
      requestedDtoFields.unshift(ID_DTO_FIELD);
    }

    // Map DTO fields to DB fields, remove duplicates
    const attributes = [...new Set(requestedDtoFields.map(field => fieldMap[field]))];

    if (Object.keys(queryFields).length && attributes.length === 0) {
      return res.status(400).json({
        message: "Invalid or unknown fields in query parameters",
        statusCode: 400,
      });
    }

    // Pagination setup
    let pagination = {};
    let pageNum, limitNum;
    if (page && limit) {
      pageNum = parseInt(page);
      limitNum = parseInt(limit);
      if (!isNaN(pageNum) && !isNaN(limitNum)) {
        pagination.offset = (pageNum - 1) * limitNum;
        pagination.limit = limitNum;
      }
    }

    // Fetch data from DAO
    const { count: totalRecords, rows } = await AgeGroupDao.getDataAsPerQueryParamDAO(
      req.sequelize,
      {
        attributes,
        ...pagination,
      }
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Age Group successfully", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    // Filter DTO output based on requested fields
    const responseData = rows.map(record => {
      const fullDto = dto.toAgeGroupEntity(record);
      const filteredDto = {};
      for (const key of requestedDtoFields) {
        if (key in fullDto) {
          filteredDto[key] = fullDto[key];
        }
      }
      return filteredDto;
    });

    // Build meta response
    const responseMeta = {
      statusCode: 200,
      executionTime,
      hospitalDatabase,
    };

    if (pageNum && limitNum) {
      responseMeta.pagination = {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
      };
    }

    res.status(200).json({
      meta: responseMeta,
      data: responseData,
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 1263;

    logger.logWithMeta("error", "Error fetching Age Group", {
      errorCode,
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
      updatedBy: req.username,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error fetching Age Group: " + error.message },
    });
  }
};
