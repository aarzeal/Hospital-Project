const logger = require("../logger");
const HospitalGroup = require("../models/HospitalGroup");
const Hospital = require("../models/HospitalModel");
const getLocationData = require("../util/locationHelper");
const getClientIp = require("../util/clientip");
const { rolepermission, rolepermissionBulk } = require("../validators/joi-validator");
const { rolePermissionPOST, rolePermissionGET, rolePermissionMap } = require("../dtos/RolePermissionDTO");
const { createRolePermissionDAO, getAllRolePermissionsDAO, getRolePermissionByIdDAO, updateRolePermissionByIdDAO, deleteRolePermissionByIdDAO, getRolePermissionDataAsPerQueryParamDAO, bulkCreateRolePermissionsDAO, deleteRolePermissionByRoleModuleDAO, getAllAccessByRoleIdDAO, getExistingRolePermissionsDAO, updateRolePermissionBySubmoduleDAO } = require("../Dao/RolePermissionDAO");

// exports.createRolePermission = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);
//   const hospitalDatabase = req.hospitalDatabase;
//   const username = req.username;

//   try {
//     const { error } = rolepermission.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const hospitalid = await Hospital.findOne({
//       where: { HospitalID: req.body.hospitalIDR },
//     });
//     if (!hospitalid) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 1260;

//       logger.logWithMeta("error", "Invalid HospitaID, not found in MasterDB", {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalName,
//         apiName: req.originalUrl,
//         city: locationData?.city,
//         country: locationData?.country,
//         apiName: req.originalUrl,
//         method: req.method,
//         userAgent: req.headers["user-agent"],
//         createdBy: username,
//       });
//       return res.status(400).json({
//         errorCode,
//         message: "Invalid HospitalID, not found in MasterDB",
//       });
//     }
//     const group = await HospitalGroup.findOne({
//       where: { HospitalGroupID: req.body.hospitalGroupIDR },
//     });
//     if (!group) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 1260;

//       logger.logWithMeta(
//         "error",
//         "Invalid Hospital Group ID, not found in MasterDB",
//         {
//           errorCode,
//           executionTime,
//           hospitalId: req.hospitalName,
//           apiName: req.originalUrl,
//           city: locationData?.city,
//           country: locationData?.country,
//           method: req.method,
//           userAgent: req.headers["user-agent"],
//           createdBy: username,
//         }
//       );
//       return res.status(400).json({
//         errorCode,
//         message: "Invalid HospitalGroupID, not found in MasterDB",
//       });
//     }

//     const RequestBody = {
//       ...req.body,
//       createdBy: username,
//     };

//     const rolepermissionData = rolePermissionPOST(RequestBody);
//     const result = await createRolePermissionDAO(
//       req.sequelize,
//       rolepermissionData
//     );

//     const executionTime = `${Date.now() - start}ms`;

//     logger.logWithMeta("info", "Role Permission created successfully", {
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       ip: clientIp,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: username,
//     });

//     res.status(201).json({
//       message: "Role Permission created successfully",
//       meta: {
//         statusCode: 200,
//         executionTime,
//         hospitalDatabase,
//       },
//       data: rolePermissionGET(result),
//     });
//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 9249;

//     logger.logWithMeta("error", "Error Creating Role Permission", {
//       errorCode,
//       executionTime,
//       hospitalDatabase,
//       apiName: req.originalUrl,
//       error: error.message,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//       error: { message: "Error Creating Role Permission: " + error.message },
//     });
//   }
// };

// BULK CREATE Role Permissions
// exports.createRolePermissionsBulk = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);
//   const hospitalDatabase = req.hospitalDatabase;
//   const username = req.username;

//   try {
//     const { error } = rolepermissionBulk.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const allRolePermissions = [];
//     const validationErrors = [];

//     // Process each role-module combination
//     for (const item of req.body) {
//       const { roleId, moduleId, submodules } = item;

//       // Validate hospital ID from first submodule
//       const firstHospitalIDR = submodules[0]?.hospitalIDR;
//       if (!firstHospitalIDR) {
//         validationErrors.push({
//           roleId,
//           moduleId,
//           error: "HospitalIDR is required"
//         });
//         continue;
//       }

//       const hospitalid = await Hospital.findOne({
//         where: { HospitalID: firstHospitalIDR },
//       });
      
//       if (!hospitalid) {
//         validationErrors.push({
//           roleId,
//           moduleId,
//           error: "Invalid HospitalID, not found in MasterDB"
//         });
//         continue;
//       }

//       // Validate hospital group ID if provided
//       const firstHospitalGroupIDR = submodules[0]?.hospitalGroupIDR;
//       if (firstHospitalGroupIDR) {
//         const group = await HospitalGroup.findOne({
//           where: { HospitalGroupID: firstHospitalGroupIDR },
//         });
        
//         if (!group) {
//           validationErrors.push({
//             roleId,
//             moduleId,
//             error: "Invalid HospitalGroupID, not found in MasterDB"
//           });
//           continue;
//         }
//       }

//       // Create permission entries for each submodule
//       for (const submodule of submodules) {
//         const permissionData = rolePermissionPOST({
//           roleId: roleId,
//           moduleId: moduleId,
//           submoduleId: submodule.submoduleId,
//           permissionId: submodule.permissionId,
//           isActive: submodule.isActive !== undefined ? submodule.isActive : true,
//           hospitalIDR: submodule.hospitalIDR,
//           hospitalGroupIDR: submodule.hospitalGroupIDR,
//           createdBy: username,
//           updatedBy: username
//         });

//         allRolePermissions.push(permissionData);
//       }
//     }

//     // If there were validation errors
//     if (validationErrors.length > 0) {
//       const executionTime = `${Date.now() - start}ms`;
//       const errorCode = 1260;

//       logger.logWithMeta("error", "Validation errors in bulk create", {
//         errorCode,
//         executionTime,
//         hospitalId: req.hospitalName,
//         apiName: req.originalUrl,
//         validationErrors,
//         createdBy: username,
//       });

//       return res.status(400).json({
//         errorCode,
//         message: "Some entries have validation errors",
//         errors: validationErrors
//       });
//     }

//     // Bulk create all permissions
//     const results = await bulkCreateRolePermissionsDAO(
//       req.sequelize,
//       allRolePermissions
//     );

//     const executionTime = `${Date.now() - start}ms`;

//     logger.logWithMeta("info", "Role Permissions created successfully in bulk", {
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       ip: clientIp,
//       count: results.length,
//       createdBy: username,
//     });

//     // Convert results to GET DTO format
//     const responseData = results.map(result => rolePermissionGET(result));

//     res.status(201).json({
//       message: "Role Permissions created successfully",
//       meta: {
//         statusCode: 200,
//         executionTime,
//         hospitalDatabase,
//         count: results.length
//       },
//       data: responseData
//     });

//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 9250;

//     logger.logWithMeta("error", "Error Creating Role Permissions in bulk", {
//       errorCode,
//       executionTime,
//       hospitalDatabase,
//       apiName: req.originalUrl,
//       error: error.message,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//       error: { message: "Error Creating Role Permissions: " + error.message },
//     });
//   }
// };

// exports.createRolePermissionsBulk = async (req, res) => {
//   const start = Date.now();
//   const clientIp = await getClientIp(req);
//   const locationData = await getLocationData(clientIp);
//   const hospitalDatabase = req.hospitalDatabase;
//   const username = req.username;

//   try {
//     const { error } = rolepermissionBulk.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const allRolePermissions = [];
//     const validationErrors = [];
//     const duplicateErrors = [];

//     // Get all requested combinations for checking
//     let allRequestedSubmodules = [];

//     for (const item of req.body) {
//       const { roleId, moduleId, submodules } = item;

//       const firstHospitalIDR = submodules[0]?.hospitalIDR;
//       if (!firstHospitalIDR) {
//         validationErrors.push({
//           roleId,
//           moduleId,
//           error: "HospitalIDR is required"
//         });
//         continue;
//       }

//       const hospitalid = await Hospital.findOne({ where: { HospitalID: firstHospitalIDR } });

//       if (!hospitalid) {
//         validationErrors.push({
//           roleId,
//           moduleId,
//           error: "Invalid HospitalID, not found in MasterDB"
//         });
//         continue;
//       }

//       const firstHospitalGroupIDR = submodules[0]?.hospitalGroupIDR;
//       if (firstHospitalGroupIDR) {
//         const group = await HospitalGroup.findOne({
//           where: { HospitalGroupID: firstHospitalGroupIDR },
//         });

//         if (!group) {
//           validationErrors.push({
//             roleId,
//             moduleId,
//             error: "Invalid HospitalGroupID, not found in MasterDB"
//           });
//           continue;
//         }
//       }

//       submodules.forEach((sub) => {
//         allRequestedSubmodules.push({
//           roleId,
//           moduleId,
//           submoduleId: sub.submoduleId,
//           permissionId: sub.permissionId,
//           isActive: sub.isActive !== undefined ? sub.isActive : true,
//           hospitalIDR: sub.hospitalIDR,
//           hospitalGroupIDR: sub.hospitalGroupIDR,
//         });
//       });
//     }
// console.log("Current DB:", req.sequelize.getDatabaseName());

//     // If input had validation errors
//     if (validationErrors.length > 0) {
//       return res.status(400).json({
//         message: "Validation errors found",
//         errors: validationErrors
//       });
//     }

//     // ✅ Get all unique combinations to check in DB
//     const uniqueConditions = allRequestedSubmodules.map(item => ({
//       role_id: item.roleId,
//       module_id: item.moduleId,
//       submodule_id: item.submoduleId,
//     }));

//     // const existingPermissions = await RolePermission.findAll({
//     //   where: {
//     //     [Op.or]: uniqueConditions
//     //   },
//     //   attributes: ["role_id", "module_id", "submodule_id"]
//     // });

//     const existingPermissions = await getExistingRolePermissionsDAO(
//   req.sequelize,
//   uniqueConditions
// );


//     const existingSet = new Set(
//       existingPermissions.map(
//         r => `${r.role_id}_${r.module_id}_${r.submodule_id}`
//       )
//     );

//     // ✅ Separate NEW & DUPLICATE records
//     for (const sub of allRequestedSubmodules) {
//       const key = `${sub.roleId}_${sub.moduleId}_${sub.submoduleId}`;

//       if (existingSet.has(key)) {
//         duplicateErrors.push({
//           roleId: sub.roleId,
//           moduleId: sub.moduleId,
//           submoduleId: sub.submoduleId,
//           error: "Module and submodules already exist"
//         });
//       } else {
//         allRolePermissions.push(
//           rolePermissionPOST({
//             roleId: sub.roleId,
//             moduleId: sub.moduleId,
//             submoduleId: sub.submoduleId,
//             permissionId: sub.permissionId,
//             isActive: sub.isActive,
//             hospitalIDR: sub.hospitalIDR,
//             hospitalGroupIDR: sub.hospitalGroupIDR,
//             createdBy: username,
//             updatedBy: username
//           })
//         );
//       }
//     }

//     // If ALL were duplicates
//     if (allRolePermissions.length === 0) {
//       return res.status(409).json({
//         message: "All selected module & submodules already exist",
//         duplicates: duplicateErrors
//       });
//     }

//     // ✅ Create ONLY new data
//     const results = await bulkCreateRolePermissionsDAO(
//       req.sequelize,
//       allRolePermissions
//     );

//     const executionTime = `${Date.now() - start}ms`;

//     const responseData = results.map(result =>
//       rolePermissionGET(result)
//     );

//     res.status(201).json({
//       message: "Role Permissions processed successfully",
//       meta: {
//         statusCode: 201,
//         executionTime,
//         hospitalDatabase,
//         totalReceived: allRequestedSubmodules.length,
//         totalInserted: results.length,
//         totalDuplicates: duplicateErrors.length
//       },
//       data: responseData,
//       duplicates: duplicateErrors
//     });

//   } catch (error) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 9250;

//     logger.logWithMeta("error", "Error Creating Role Permissions in bulk", {
//       errorCode,
//       executionTime,
//       hospitalDatabase,
//       apiName: req.originalUrl,
//       error: error.message,
//     });

//     res.status(500).json({
//       meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
//       error: { message: "Error Creating Role Permissions: " + error.message },
//     });
//   }
// };

exports.createRolePermissionsBulk = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;

  try {
    const { error } = rolepermissionBulk.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const allRolePermissions = [];
    const validationErrors = [];
    const duplicateErrors = [];

    let allRequestedSubmodules = [];

    // --------- STEP 1 : Validate Input + Hospital / Group ---------
    for (const item of req.body) {
      const { roleId, moduleId, submodules } = item;

      const firstHospitalIDR = submodules[0]?.hospitalIDR;
      if (!firstHospitalIDR) {
        validationErrors.push({
          roleId,
          moduleId,
          error: "HospitalIDR is required"
        });
        continue;
      }

      const hospitalid = await Hospital.findOne({
        where: { HospitalID: firstHospitalIDR }
      });

      if (!hospitalid) {
        validationErrors.push({
          roleId,
          moduleId,
          error: "Invalid HospitalID, not found in MasterDB"
        });
        continue;
      }

      const firstHospitalGroupIDR = submodules[0]?.hospitalGroupIDR;
      if (firstHospitalGroupIDR) {
        const group = await HospitalGroup.findOne({
          where: { HospitalGroupID: firstHospitalGroupIDR },
        });

        if (!group) {
          validationErrors.push({
            roleId,
            moduleId,
            error: "Invalid HospitalGroupID, not found in MasterDB"
          });
          continue;
        }
      }

      // Store all submodules for duplicate checking
      submodules.forEach((sub) => {
        allRequestedSubmodules.push({
          roleId,
          moduleId,
          submoduleId: sub.submoduleId,
          permissionId: sub.permissionId,
          isActive: sub.isActive !== undefined ? sub.isActive : true,
          hospitalIDR: sub.hospitalIDR,
          hospitalGroupIDR: sub.hospitalGroupIDR,
        });
      });
    }

    console.log("Current DB:", req.sequelize.getDatabaseName());

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation errors found",
        errors: validationErrors
      });
    }

    // ---------- STEP 2 : Check duplicates in DB ----------
    const uniqueConditions = allRequestedSubmodules.map(item => ({
      role_id: item.roleId,
      module_id: item.moduleId,
      submodule_id: item.submoduleId,
    }));

    const existingPermissions = await getExistingRolePermissionsDAO(
      req.sequelize,
      uniqueConditions
    );

    const existingSet = new Set(
      existingPermissions.map(
        r => `${r.role_id}_${r.module_id}_${r.submodule_id}`
      )
    );

    // ---------- STEP 3 : Filter new & duplicate records ----------
    for (const sub of allRequestedSubmodules) {
      const key = `${sub.roleId}_${sub.moduleId}_${sub.submoduleId}`;

      if (existingSet.has(key)) {
        duplicateErrors.push({
          roleId: sub.roleId,
          moduleId: sub.moduleId,
          submoduleId: sub.submoduleId,
          error: "Module and submodule already exist"
        });
      } else {
        allRolePermissions.push(
          rolePermissionPOST({
            roleId: sub.roleId,
            moduleId: sub.moduleId,
            submoduleId: sub.submoduleId,
            permissionId: sub.permissionId,
            isActive: sub.isActive,
            hospitalIDR: sub.hospitalIDR,
            hospitalGroupIDR: sub.hospitalGroupIDR,
            createdBy: username,
            updatedBy: username
          })
        );
      }
    }

    // ---------- STEP 4 : If ALL are duplicate ----------
    if (allRolePermissions.length === 0) {
      return res.status(409).json({
        message: "All selected module & submodules already exist",
        duplicates: duplicateErrors
      });
    }

    // ---------- STEP 5 : Insert only NEW records ----------
    const results = await bulkCreateRolePermissionsDAO(
      req.sequelize,
      allRolePermissions
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Role Permissions created successfully in bulk", {
      executionTime,
      hospitalId: req.hospitalName,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      ip: clientIp,
      count: results.length,
      createdBy: username,
    });

    const responseData = results.map(result =>
      rolePermissionGET(result)
    );

    res.status(201).json({
      message: "Role Permissions processed successfully",
      meta: {
        statusCode: 201,
        executionTime,
        hospitalDatabase,
        totalReceived: allRequestedSubmodules.length,
        totalInserted: results.length,
        totalDuplicates: duplicateErrors.length
      },
      data: responseData,
      duplicates: duplicateErrors
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9250;

    logger.logWithMeta("error", "Error Creating Role Permissions in bulk", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Creating Role Permissions: " + error.message },
    });
  }
};



// REPLACE Role Permissions (Delete old and create new)
exports.replaceRolePermissions = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;

  try {
    const { error } = rolepermissionBulk.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const transaction = await req.sequelize.transaction();
    
    try {
      const allRolePermissions = [];
      const deletedCounts = [];

      // Process each role-module combination
      for (const item of req.body) {
        const { roleId, moduleId, submodules } = item;
        const hospitalIDR = submodules[0]?.hospitalIDR;

        if (!hospitalIDR) {
          await transaction.rollback();
          return res.status(400).json({
            errorCode: 1260,
            message: `HospitalIDR is required for role ${roleId}, module ${moduleId}`
          });
        }

        // Validate hospital ID
        const hospitalid = await Hospital.findOne({
          where: { HospitalID: hospitalIDR },
        });
        
        if (!hospitalid) {
          await transaction.rollback();
          return res.status(400).json({
            errorCode: 1260,
            message: `Invalid HospitalID ${hospitalIDR}, not found in MasterDB`
          });
        }

        // Delete existing permissions for this role-module-hospital combination
        const deleted = await deleteRolePermissionByRoleModuleDAO(
          req.sequelize,
          roleId,
          moduleId,
          hospitalIDR
        );

        deletedCounts.push({
          roleId,
          moduleId,
          hospitalIDR,
          deletedCount: deleted
        });

        // Create new permission entries for each submodule
        for (const submodule of submodules) {
          const permissionData = rolePermissionPOST({
            roleId: roleId,
            moduleId: moduleId,
            submoduleId: submodule.submoduleId,
            permissionId: submodule.permissionId,
            isActive: submodule.isActive !== undefined ? submodule.isActive : true,
            hospitalIDR: submodule.hospitalIDR,
            hospitalGroupIDR: submodule.hospitalGroupIDR,
            createdBy: username,
            updatedBy: username
          });

          allRolePermissions.push(permissionData);
        }
      }

      // Bulk create all new permissions
      const results = await bulkCreateRolePermissionsDAO(
        req.sequelize,
        allRolePermissions
      );

      await transaction.commit();

      const executionTime = `${Date.now() - start}ms`;

      logger.logWithMeta("info", "Role Permissions replaced successfully", {
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        ip: clientIp,
        deleted: deletedCounts,
        createdCount: results.length,
        createdBy: username,
      });

      // Convert results to GET DTO format
      const responseData = results.map(result => rolePermissionGET(result));

      res.status(200).json({
        message: "Role Permissions replaced successfully",
        meta: {
          statusCode: 200,
          executionTime,
          hospitalDatabase,
          deletedCounts,
          createdCount: results.length
        },
        data: responseData
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9251;

    logger.logWithMeta("error", "Error replacing Role Permissions", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error replacing Role Permissions: " + error.message },
    });
  }
};

// Original single create function (unchanged)
exports.createRolePermission = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;

  try {
    const { error } = rolepermission.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const hospitalid = await Hospital.findOne({
      where: { HospitalID: req.body.hospitalIDR },
    });
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

    const rolepermissionData = rolePermissionPOST(RequestBody);
    const result = await createRolePermissionDAO(
      req.sequelize,
      rolepermissionData
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Role Permission created successfully", {
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
      message: "Role Permission created successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: rolePermissionGET(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Creating Role Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Creating Role Permission: " + error.message },
    });
  }
};

exports.getAllRolePermissions = async (req, res) => {
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
    const result = await getAllRolePermissionsDAO(req.sequelize);
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Roles Permissions successfully", {
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
      message: "All Roles Permissions Fetched successfully",
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      data: result.map(rolePermissionGET),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Fetching Role Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Fetching Role Permission: " + error.message },
    });
  }
};

exports.getRolePermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { id } = req.params;
    const result = await getRolePermissionByIdDAO(req.sequelize, id);

    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1262;

      logger.logWithMeta("error", "Role Permission not found", {
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

      return res.status(404).json({
        errorCode: 1263,
        message: "Role Permission not found in Database",
        hospitalDatabase,
      });
    }
    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Role Permission successfully", {
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
      data: rolePermissionGET(result),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Fetching Role", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Fetching Role: " + error.message },
    });
  }
};

// CONTROLLER: GET ALL ACCESS BY ROLE ID
exports.getAllAccessByRoleId = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { roleId } = req.params;
    const result = await getAllAccessByRoleIdDAO(req.sequelize, roleId);

    console.log("Role Access Result:", result);

    if (!result || result.length === 0) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 1264;

      logger.logWithMeta("error", "No Access found for Role", {
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

      return res.status(404).json({
        errorCode: 1265,
        message: "No access found for this Role in Database",
        hospitalDatabase,
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Role Access successfully", {
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

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
      },
      // ✅ AB DIRECT grouped data jaayega (no map)
      data: result
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9250;

    logger.logWithMeta("error", "Error Fetching Role Access", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Fetching Role Access: " + error.message },
    });
  }
};



exports.updateRolePermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const username = req.username;
  try {
    const { error } = rolepermission.validate(req.body);
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
          updatedBy: username,
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid HospitalGroupID, not found in MasterDB",
      });
    }
    const { id } = req.params;

    const RequestBody = {
      ...req.body,
      updatedBy: username,
    };
    const rolepermissionData = rolePermissionPOST(RequestBody);

    const updated = await updateRolePermissionByIdDAO(
      req.sequelize,
      id,
      rolepermissionData
    );

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Role Permission updated successfully", {
      hospitalDatabase,
      executionTime,
      apiName: req.originalUrl,
    });

    if (!updated) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid Role Permission id, not found in DB",
        {
          errorCode,
          executionTime,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: username,
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid Role Permission id, not found in DB",
      });
    }

    res.status(200).json({
      message: "Role Updated Permission Successfully",
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      data: rolePermissionGET(updated),
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Updating Role Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Updating Role Permission: " + error.message },
    });
  }
};

// ✅ NEW API: Update Role Permission Status by Submodule
exports.updateRolePermissionBySubmodule = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const hospitalDatabase = req.hospitalDatabase;
  const locationData = await getLocationData(clientIp);

  try {
    const { roleId } = req.params;
    const { moduleId, submoduleId, permissionId, isActive } = req.body;

    // Validation
    if (!moduleId || !submoduleId || !permissionId || isActive === undefined) {
      return res.status(400).json({
        meta: { statusCode: 400, hospitalDatabase },
        error: { message: "Missing required fields: moduleId, submoduleId, permissionId, isActive" }
      });
    }

    // Update in database
    const result = await updateRolePermissionBySubmoduleDAO(
      req.sequelize, 
      roleId, 
      moduleId, 
      submoduleId, 
      permissionId, 
      isActive
    );

    if (!result) {
      const executionTime = `${Date.now() - start}ms`;
      
      logger.logWithMeta("error", "Role permission not found for update", {
        executionTime,
        hospitalId: req.hospitalName,
        apiName: req.originalUrl,
        city: locationData?.city,
        country: locationData?.country,
        method: req.method,
        userAgent: req.headers["user-agent"],
        createdBy: req.username,
        updatedBy: req.username,
        data: { roleId, moduleId, submoduleId, permissionId }
      });

      return res.status(404).json({
        meta: { statusCode: 404, executionTime, hospitalDatabase },
        error: { message: "Role permission record not found" }
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Role permission status updated successfully", {
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
      data: { roleId, moduleId, submoduleId, permissionId, isActive }
    });

    res.status(200).json({
      meta: {
        statusCode: 200,
        executionTime,
        hospitalDatabase,
        message: "Role permission status updated successfully"
      },
      data: result
    });

  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9251;

    logger.logWithMeta("error", "Error updating role permission status", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
      data: req.body
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error updating role permission status: " + error.message }
    });
  }
};

exports.deleteRolePermissionById = async (req, res) => {
  const start = Date.now();
  const clientIp = await getClientIp(req);
  const locationData = await getLocationData(clientIp);
  const hospitalDatabase = req.hospitalDatabase;
  const { id } = req.params;
  try {
    const deleted = await deleteRolePermissionByIdDAO(req.sequelize, id);
    if (!deleted) {
      const executionTime = `${Date.now() - start}ms`;
      const errorCode = 9245;

      logger.logWithMeta(
        "error",
        "Invalid Role Permission id, not found in Database",
        {
          errorCode,
          executionTime,
          ID: req.params.id,
          apiName: req.originalUrl,
          city: locationData?.city,
          country: locationData?.country,
          method: req.method,
          userAgent: req.headers["user-agent"],
          createdBy: req.username,
          updatedBy: req.username,
        }
      );
      return res.status(400).json({
        errorCode,
        message: "Invalid Role Permission id, not found in DB",
      });
    }

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Role Permission Deleted successfully", {
      executionTime,
      ID: req.params.id,
      apiName: req.originalUrl,
      city: locationData?.city,
      country: locationData?.country,
      method: req.method,
      userAgent: req.headers["user-agent"],
      createdBy: req.username,
    });

    res.status(200).json({
      meta: { statusCode: 200, executionTime, hospitalDatabase },
      message: "Role Permission deleted successfully",
    });
  } catch (error) {
    const executionTime = `${Date.now() - start}ms`;
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Deleting Role Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Deleting Role Permission: " + error.message },
    });
  }
};

exports.getRolePermissionByQueryParams = async (req, res) => {
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
    const fieldMap = rolePermissionMap;

    const ID_DTO_FIELD = "rolePermissionId"; // Ensure this matches your DTO
    const ID_DB_FIELD = fieldMap[ID_DTO_FIELD];

    // Extract valid DTO fields from query params
    let requestedDtoFields = Object.keys(queryFields).filter(
      (field) => field in fieldMap
    );
    if (requestedDtoFields.length === 0) {
      requestedDtoFields = Object.keys(fieldMap);
    }

    // Always include the ID field
    if (!requestedDtoFields.includes(ID_DTO_FIELD)) {
      requestedDtoFields.unshift(ID_DTO_FIELD);
    }

    // Map DTO fields to DB fields, remove duplicates
    const attributes = [
      ...new Set(requestedDtoFields.map((field) => fieldMap[field])),
    ];

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
    const { count: totalRecords, rows } =
      await getRolePermissionDataAsPerQueryParamDAO(req.sequelize, {
        attributes,
        ...pagination,
      });

    const executionTime = `${Date.now() - start}ms`;

    logger.logWithMeta("info", "Fetched Role Permission successfully", {
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
    const responseData = rows.map((record) => {
      const fullDto = rolePermissionGET(record);
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
    const errorCode = 9249;

    logger.logWithMeta("error", "Error Fetching Role Permission", {
      errorCode,
      executionTime,
      hospitalDatabase,
      apiName: req.originalUrl,
      error: error.message,
    });

    res.status(500).json({
      meta: { statusCode: 500, errorCode, executionTime, hospitalDatabase },
      error: { message: "Error Fetching Role Permission: " + error.message },
    });
  }
};
