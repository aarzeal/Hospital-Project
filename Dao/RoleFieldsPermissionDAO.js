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

exports.getRoleFieldPermissionByUniqueKeyDAO = async (
  sequelize,
  roleId,
  submoduleId,
  fieldName,
  hospitalIDR
) => {
  const RoleFieldPermission =
    require("../models/RoleFieldPermissionModel")(sequelize);

  return await RoleFieldPermission.findOne({
    where: {
      role_id: roleId,
      submodule_id: submoduleId,
      field_name: fieldName,
      hospital_IDR: hospitalIDR,
      is_active: true,
    },
  });
};



exports.getAllAccessByRoleIdAndSubmoduleIdDAO = async (
  sequelize,
  roleId,
  submoduleId
) => {
  const RoleFieldPermission =
    require("../models/RoleFieldPermissionModel")(sequelize);

  const data = await RoleFieldPermission.findAll({
    where: {
      role_id: roleId,
      submodule_id: submoduleId,
    },
    raw: true,
  });

  // ✅ Grouping data field-wise (clean & frontend-ready)
  const grouped = {
    role_id: roleId,
    submodule_id: submoduleId,
    fields: [],
  };

  data.forEach((item) => {
    grouped.fields.push({
      roleFieldPermissionId: item.role_field_permission_id,
      fieldName: item.field_name,
      fieldType: item.field_type,
      permission: item.permission,
      isActive: item.is_active,
      hospitalIDR: item.hospital_IDR,
      hospitalGroupIDR: item.hospital_group_IDR,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
    });
  });

  return grouped;
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


