const { Op } = require("sequelize");

/**
 * CREATE SINGLE USER FIELD PERMISSION
 */
exports.createUserFieldPermissionDAO = async (sequelize, data) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  await UserFieldPermission.sync();
  return await UserFieldPermission.create(data);
};

/**
 * BULK CREATE USER FIELD PERMISSIONS
 * (UI / Excel import)
 */
exports.bulkCreateUserFieldPermissionsDAO = async (sequelize, dataArray) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  await UserFieldPermission.sync();
  return await UserFieldPermission.bulkCreate(dataArray, {
    returning: true,
  });
};

/**
 * GET USER FIELD PERMISSIONS BY USER ID
 */
exports.getUserFieldPermissionsByUserIdDAO = async (
  sequelize,
  userId,
  hospitalIDR
) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  const whereClause = {
    userId,
    is_active: true,
  };

  if (hospitalIDR !== undefined && hospitalIDR !== null) {
    whereClause.hospital_IDR = hospitalIDR;
  }

  return await UserFieldPermission.findAll({
    where: whereClause,
    order: [["user_field_permission_id", "ASC"]],
  });
};

/**
 * GET USER FIELD PERMISSIONS BY SUBMODULE ID
 */
exports.getUserFieldPermissionsBySubmoduleIdDAO = async (
  sequelize,
  submoduleId,
  hospitalIDR
) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  const whereClause = {
    submodule_id: submoduleId,
    is_active: true,
  };

  if (hospitalIDR !== undefined && hospitalIDR !== null) {
    whereClause.hospital_IDR = hospitalIDR;
  }

  return await UserFieldPermission.findAll({
    where: whereClause,
    order: [["user_field_permission_id", "ASC"]],
  });
};

/**
 * GET USER FIELD PERMISSION BY ID
 */
exports.getIdByUserFieldPermissionDAO = async (
  sequelize,
  userFieldPermissionId
) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  return await UserFieldPermission.findOne({
    where: {
      user_field_permission_id: userFieldPermissionId,
      is_active: true,
    },
  });
};

/**
 * GET USER FIELD PERMISSION BY UNIQUE KEY
 */
exports.getUserFieldPermissionByUniqueKeyDAO = async (
  sequelize,
  userId,
  submoduleId,
  fieldName,
  hospitalIDR
) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  return await UserFieldPermission.findOne({
    where: {
      userId,
      submodule_id: submoduleId,
      field_name: fieldName,
      hospital_IDR: hospitalIDR,
      is_active: true,
    },
  });
};

/**
 * GET ALL ACCESS (FIELD-WISE) BY USER & SUBMODULE
 */
exports.getAllAccessByUserIdAndSubmoduleIdDAO = async (
  sequelize,
  userId,
  submoduleId
) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  const data = await UserFieldPermission.findAll({
    where: {
      userId,
      submodule_id: submoduleId,
    },
    raw: true,
  });

  const grouped = {
    userId,
    submodule_id: submoduleId,
    fields: [],
  };

  data.forEach((item) => {
    grouped.fields.push({
      userFieldPermissionId: item.user_field_permission_id,
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
 * GET ALL USER FIELD PERMISSIONS
 * (Admin / config screen)
 */
exports.getAllUserFieldPermissionsDAO = async (sequelize, hospitalIDR) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  const whereClause = {};

  if (hospitalIDR !== undefined && hospitalIDR !== null) {
    whereClause.hospital_IDR = hospitalIDR;
  }

  return await UserFieldPermission.findAll({
    where: whereClause,
    order: [["user_field_permission_id", "ASC"]],
  });
};

/**
 * UPDATE USER FIELD PERMISSION BY ID
 */
exports.updateUserFieldPermissionByIdDAO = async (
  sequelize,
  userFieldPermissionId,
  updateData
) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  await UserFieldPermission.update(updateData, {
    where: { user_field_permission_id: userFieldPermissionId },
  });

  return await UserFieldPermission.findByPk(userFieldPermissionId);
};

/**
 * BULK UPDATE USER FIELD PERMISSIONS
 */
exports.bulkUpdateUserFieldPermissionDAO = async (
  sequelize,
  payload,
  updatedBy
) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  const transaction = await sequelize.transaction();

  try {
    const updatedRecords = [];
    const { submoduleId, userId, fields } = payload;

    for (const field of fields) {
      const updateData = {
        permission: field.permission,
        is_active: field.isActive,
        field_type: field.fieldType,
        hospital_IDR: field.hospitalIDR,
        hospital_group_IDR: field.hospitalGroupIDR,
        updated_by: updatedBy,
      };

      await UserFieldPermission.update(updateData, {
        where: {
          submodule_id: submoduleId,
          userId,
          field_name: field.fieldName,
        },
        transaction,
      });

      const updated = await UserFieldPermission.findOne({
        where: {
          submodule_id: submoduleId,
          userId,
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
 * DELETE USER FIELD PERMISSION (HARD DELETE)
 */
exports.deleteUserFieldPermissionDAO = async (
  sequelize,
  userFieldPermissionId
) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  const record = await UserFieldPermission.findByPk(userFieldPermissionId);
  if (!record) return null;

  await record.destroy();
  return record;
};

/**
 * GET DATA BY QUERY PARAMS (pagination, filters)
 */
exports.getUserFieldPermissionDataAsPerQueryParamDAO = async (
  sequelize,
  options
) => {
  const UserFieldPermission =
    require("../models/UserFieldPermissionModel")(sequelize);

  return await UserFieldPermission.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};
