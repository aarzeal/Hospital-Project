const { Op } = require("sequelize");

/**
 * CREATE SINGLE FIELD
 */
exports.createSubmoduleFieldDAO = async (sequelize, data) => {
  const SubmoduleFields = require("../models/submoduleFieldsModel")(sequelize);
  await SubmoduleFields.sync();
  return await SubmoduleFields.create(data);
};

/**
 * BULK CREATE FIELDS
 * (UI / Excel import)
 */
exports.bulkCreateSubmoduleFieldsDAO = async (sequelize, dataArray) => {
  const SubmoduleFields = require("../models/submoduleFieldsModel")(sequelize);
  await SubmoduleFields.sync();

  return await SubmoduleFields.bulkCreate(dataArray, {
    returning: true,
  });
};



exports.getSubmoduleFieldsBySubmoduleIdDAO = async (
  sequelize,
  submoduleId,
  hospitalIDR
) => {
  const SubmoduleFields = require("../models/submoduleFieldsModel")(sequelize);

  const whereClause = {
    submodule_id: submoduleId,
    is_active: true,
  };

  // ✅ ONLY add hospital_IDR when defined
  if (hospitalIDR !== undefined && hospitalIDR !== null) {
    whereClause.hospital_IDR = hospitalIDR;
  }

  return await SubmoduleFields.findAll({
    where: whereClause,
    order: [["field_id", "ASC"]],
  });
};


exports.getByFieldId = async (sequelize,fieldId) => {
  const SubmoduleFields = require("../models/submoduleFieldsModel")(sequelize);

  return await SubmoduleFields.findOne({
    where: {
      field_id: fieldId,
      is_active: true
    }
  });
};

/**
 * GET ALL FIELDS
 * (Admin / config screen)
 */
exports.getAllSubmoduleFieldsDAO = async (sequelize, hospitalIDR) => {
  const SubmoduleFields = require("../models/submoduleFieldsModel")(sequelize);

  return await SubmoduleFields.findAll();
};

/**
 * UPDATE FIELD
 * (field_name / is_active etc.)
 */
exports.updateSubmoduleFieldByIdDAO = async (
  sequelize,
  fieldId,
  updateData
) => {
  const SubmoduleFields = require("../models/submoduleFieldsModel")(sequelize);

  await SubmoduleFields.update(updateData, {
    where: { field_id: fieldId },
  });

  return await SubmoduleFields.findByPk(fieldId);
};

exports.bulkUpdateSubmoduleFieldsBySubmoduleIdDAO = async (
  sequelize,
  fieldId,
  hospitalIDR,
  updatePayload
) => {
  const SubmoduleFields = require("../models/submoduleFieldsModel")(sequelize);

  return await SubmoduleFields.update(updatePayload, {
    where: {
      field_id: fieldId,
      hospital_IDR: hospitalIDR,
    },
  });
};


/**
 * DELETE FIELD (HARD DELETE – as requested)
 */
exports.deleteSubmoduleFieldDAO = async (sequelize, fieldId) => {
  const SubmoduleFields = require("../models/submoduleFieldsModel")(sequelize);

  const record = await SubmoduleFields.findByPk(fieldId);
  if (!record) return null;

  await record.destroy();
  return record;
};

// GET DATA BY QUERY PARAMS (pagination, filters)
exports.getSubmoduleFieldDataAsPerQueryParamDAO = async (sequelize, options) => {
  const SubmoduleField = require("../models/submoduleFieldsModel")(sequelize);

  return await SubmoduleField.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};