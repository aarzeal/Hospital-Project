// const { Op } = require("sequelize");

// /**
//  * CREATE SINGLE ROLE FIELD PERMISSION
//  */
// exports.createRoleFieldPermissionDAO = async (sequelize, data) => {
//   const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(sequelize);
//   await RoleFieldPermission.sync();

//   return await RoleFieldPermission.create(data);
// };

// /**
//  * BULK CREATE ROLE FIELD PERMISSIONS
//  * (UI / Excel import)
//  */
// exports.bulkCreateRoleFieldPermissionsDAO = async (sequelize, dataArray) => {
//   const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(sequelize);
//   await RoleFieldPermission.sync();

//   return await RoleFieldPermission.bulkCreate(dataArray, {
//     returning: true,
//   });
// };

// /**
//  * GET ROLE FIELD PERMISSIONS BY ROLE ID
//  */
// exports.getRoleFieldPermissionsByRoleIdDAO = async (
//   sequelize,
//   roleId,
//   hospitalIDR
// ) => {
//   const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(sequelize);

//   const whereClause = {
//     role_id: roleId,
//     is_active: true,
//   };

//   if (hospitalIDR !== undefined && hospitalIDR !== null) {
//     whereClause.hospital_IDR = hospitalIDR;
//   }

//   return await RoleFieldPermission.findAll({
//     where: whereClause,
//     order: [["role_field_permission_id", "ASC"]],
//   });
// };

// /**
//  * GET ROLE FIELD PERMISSION BY ROLE + FIELD
//  */
// exports.getRoleFieldPermissionByRoleAndFieldDAO = async (
//   sequelize,
//   roleId,
//   fieldId,
//   hospitalIDR
// ) => {
//   const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(sequelize);

//   const whereClause = {
//     role_id: roleId,
//     field_id: fieldId,
//     is_active: true,
//   };

//   if (hospitalIDR !== undefined && hospitalIDR !== null) {
//     whereClause.hospital_IDR = hospitalIDR;
//   }

//   return await RoleFieldPermission.findOne({ where: whereClause });
// };

// /**
//  * GET ALL ROLE FIELD PERMISSIONS
//  * (Admin / config screen)
//  */
// exports.getAllRoleFieldPermissionsDAO = async (sequelize, hospitalIDR) => {
//   const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(sequelize);

//   const whereClause = {};

//   if (hospitalIDR !== undefined && hospitalIDR !== null) {
//     whereClause.hospital_IDR = hospitalIDR;
//   }

//   return await RoleFieldPermission.findAll({
//     where: whereClause,
//     order: [["role_field_permission_id", "ASC"]],
//   });
// };

// /**
//  * UPDATE ROLE FIELD PERMISSION
//  * (permission / is_active etc.)
//  */
// exports.updateRoleFieldPermissionByIdDAO = async (
//   sequelize,
//   roleFieldPermissionId,
//   updateData
// ) => {
//   const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(sequelize);

//   await RoleFieldPermission.update(updateData, {
//     where: { role_field_permission_id: roleFieldPermissionId },
//   });

//   return await RoleFieldPermission.findByPk(roleFieldPermissionId);
// };

// /**
//  * BULK UPDATE ROLE FIELD PERMISSIONS BY ROLE ID
//  */
// exports.bulkUpdateRoleFieldPermissionsByRoleIdDAO = async (
//   sequelize,
//   roleId,
//   hospitalIDR,
//   updatePayload
// ) => {
//   const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(sequelize);

//   return await RoleFieldPermission.update(updatePayload, {
//     where: {
//       role_id: roleId,
//       hospital_IDR: hospitalIDR,
//     },
//   });
// };

// /**
//  * DELETE ROLE FIELD PERMISSION (HARD DELETE)
//  */
// exports.deleteRoleFieldPermissionDAO = async (
//   sequelize,
//   roleFieldPermissionId
// ) => {
//   const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(sequelize);

//   const record = await RoleFieldPermission.findByPk(roleFieldPermissionId);
//   if (!record) return null;

//   await record.destroy();
//   return record;
// };

// /**
//  * GET DATA BY QUERY PARAMS (pagination, filters)
//  */
// exports.getRoleFieldPermissionDataAsPerQueryParamDAO = async (
//   sequelize,
//   options
// ) => {
//   const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(sequelize);

//   return await RoleFieldPermission.findAndCountAll({
//     attributes: options.attributes,
//     offset: options.offset,
//     limit: options.limit,
//     raw: true,
//   });
// };

const { Op } = require("sequelize");

/**
 * CREATE SINGLE ROLE FIELD PERMISSION
 */
exports.createRoleFieldPermissionDAO = async (sequelize, data) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );
  await RoleFieldPermission.sync();

  return await RoleFieldPermission.create(data);
};

/**
 * BULK CREATE ROLE FIELD PERMISSIONS
 * (UI / Excel import)
 */
exports.bulkCreateRoleFieldPermissionsDAO = async (sequelize, dataArray) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );
  await RoleFieldPermission.sync();

  return await RoleFieldPermission.bulkCreate(dataArray, {
    returning: true,
  });
};

/**
 * GET ROLE FIELD PERMISSIONS BY ROLE ID
 */
exports.getRoleFieldPermissionsByRoleIdDAO = async (
  sequelize,
  roleId,
  hospitalIDR
) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );

  const whereClause = {
    role_id: roleId,
    is_active: true,
  };

  if (hospitalIDR !== undefined && hospitalIDR !== null) {
    whereClause.hospital_IDR = hospitalIDR;
  }

  return await RoleFieldPermission.findAll({
    where: whereClause,
    order: [["role_field_permission_id", "ASC"]],
  });
};

exports.getRoleFieldPermissionsBySubmoduleIdDAO = async (
  sequelize,
  submoduleId,
  hospitalIDR
) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );

  const whereClause = {
    submodule_id: submoduleId,
    is_active: true,
  };

  if (hospitalIDR !== undefined && hospitalIDR !== null) {
    whereClause.hospital_IDR = hospitalIDR;
  }

  return await RoleFieldPermission.findAll({
    where: whereClause,
    order: [["role_field_permission_id", "ASC"]],
  });
};

exports.getIdByRoleFieldPermissionDAO = async (
  sequelize,
  roleFieldPermissionId
) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );

  return await RoleFieldPermission.findOne({
    where: {
      role_field_permission_id: roleFieldPermissionId,
      is_active: true,
    },
  });
};
/**
 * GET ROLE FIELD PERMISSION BY ROLE + FIELD
 */
exports.getRoleFieldPermissionByRoleAndFieldDAO = async (
  sequelize,
  roleId,
  hospitalIDR
) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );
  await RoleFieldPermission.sync();

  const whereClause = {
    role_id: roleId,
    is_active: true,
  };

  if (hospitalIDR !== undefined && hospitalIDR !== null) {
    whereClause.hospital_IDR = hospitalIDR;
  }

  return await RoleFieldPermission.findOne({ where: whereClause });
};

/**
 * GET ALL ROLE FIELD PERMISSIONS
 * (Admin / config screen)
 */
exports.getAllRoleFieldPermissionsDAO = async (sequelize, hospitalIDR) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );

  const whereClause = {};

  if (hospitalIDR !== undefined && hospitalIDR !== null) {
    whereClause.hospital_IDR = hospitalIDR;
  }

  return await RoleFieldPermission.findAll({
    where: whereClause,
    order: [["role_field_permission_id", "ASC"]],
  });
};

/**
 * UPDATE ROLE FIELD PERMISSION
 * (permission / is_active etc.)
 */
exports.updateRoleFieldPermissionByIdDAO = async (
  sequelize,
  roleFieldPermissionId,
  updateData
) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );

  await RoleFieldPermission.update(updateData, {
    where: { role_field_permission_id: roleFieldPermissionId },
  });

  return await RoleFieldPermission.findByPk(roleFieldPermissionId);
};

exports.bulkUpdateRoleFieldPermissionDAO = async (
  sequelize,
  payload,
  updatedBy
) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );

  const transaction = await sequelize.transaction();

  try {
    const updatedRecords = [];

    const { submoduleId, roleId, fields } = payload;

    for (const field of fields) {
      const updateData = {
        permission: field.permission,
        is_active: field.isActive,
        field_type: field.fieldType,
        hospital_idr: field.hospitalIDR,
        hospital_group_idr: field.hospitalGroupIDR,
        updated_by: updatedBy,
      };

      await RoleFieldPermission.update(updateData, {
        where: {
          submodule_id: submoduleId,
          role_id: roleId,
          field_name: field.fieldName,
        },
        transaction,
      });

      const updated = await RoleFieldPermission.findOne({
        where: {
          submodule_id: submoduleId,
          role_id: roleId,
          field_name: field.fieldName,
        },
        transaction,
      });

      if (updated) updatedRecords.push(updated);
    }

    await transaction.commit();
    return updatedRecords;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * DELETE ROLE FIELD PERMISSION (HARD DELETE)
 */
exports.deleteRoleFieldPermissionDAO = async (
  sequelize,
  roleFieldPermissionId
) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );

  const record = await RoleFieldPermission.findByPk(roleFieldPermissionId);
  if (!record) return null;

  await record.destroy();
  return record;
};

/**
 * GET DATA BY QUERY PARAMS (pagination, filters)
 */
exports.getRoleFieldPermissionDataAsPerQueryParamDAO = async (
  sequelize,
  options
) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );

  return await RoleFieldPermission.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};

/**
 * CHECK IF USER HAS ACCESS TO A FIELD (Blacklist Approach)
 * Returns true if user has access, false if no access
 */
// exports.checkFieldAccessForRoleDAO = async (
//   sequelize,
//   roleId,
//   fieldId,
//   hospitalIDR
// ) => {
//   const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(sequelize);

//   const whereClause = {
//     role_id: roleId,
//     field_id: fieldId,
//     is_active: true,
//   };

//   if (hospitalIDR !== undefined && hospitalIDR !== null) {
//     whereClause.hospital_IDR = hospitalIDR;
//   }

//   const permissionRecord = await RoleFieldPermission.findOne({
//     where: whereClause
//   });

//   // Blacklist logic:
//   // If no record exists → Default full access
//   if (!permissionRecord) {
//     return true;
//   }

//   // If record exists and permission is "no_access" → No access
//   // If record exists and permission is any other value (read, write, etc.) → Has access
//   return permissionRecord.permission !== "no_access";
// };

exports.checkFieldAccessForRoleDAO = async (
  sequelize,
  roleId,
  fieldId,
  hospitalIDR
) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );

  const whereClause = {
    role_id: roleId,
    field_id: fieldId,
    is_active: true,
  };

  if (hospitalIDR !== undefined && hospitalIDR !== null) {
    whereClause.hospital_IDR = hospitalIDR;
  }

  const permissionRecord = await RoleFieldPermission.findOne({
    where: whereClause,
  });

  // ✅ Whitelist logic
  if (!permissionRecord) {
    return false;
  }

  return permissionRecord.permission !== "no_access";
};

/**
 * GET RESTRICTED FIELDS FOR A ROLE (Fields with "no_access" permission)
 */
exports.getRestrictedFieldsForRoleDAO = async (
  sequelize,
  roleId,
  hospitalIDR
) => {
  const RoleFieldPermission = require("../models/RoleFieldPermissionModel")(
    sequelize
  );

  const whereClause = {
    role_id: roleId,
    permission: "no_access",
    is_active: true,
  };

  if (hospitalIDR !== undefined && hospitalIDR !== null) {
    whereClause.hospital_IDR = hospitalIDR;
  }

  return await RoleFieldPermission.findAll({
    where: whereClause,
    order: [["role_field_permission_id", "ASC"]],
  });
};
