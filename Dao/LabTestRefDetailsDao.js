exports.createLabTestRefDetailsDao = async (sequelize, labtestrefdetailsData) => {
  const LabTestRefDetails = require("../models/LabTestRefDetailsModel")(sequelize);
  await LabTestRefDetails.sync({ force: false });
  return await LabTestRefDetails.create(labtestrefdetailsData);
};

exports.getAllLabTestRefDetailsDAO = async (sequelize) => {
  const LabTestRefDetails = require("../models/LabTestRefDetailsModel")(sequelize);
  return await LabTestRefDetails.findAll();
};
exports.getAllLabTestRefDetailsByLabTestIdDAO = async (sequelize, id) => {
  const LabTestRefDetails = require("../models/LabTestRefDetailsModel")(sequelize);
  return await LabTestRefDetails.findAll({ where: { lab_test_IDR: id } });
};

exports.getLabTestRefDetailsByIdDAO = async (sequelize, id) => {
  const LabTestRefDetails = require("../models/LabTestRefDetailsModel")(sequelize);
  return await LabTestRefDetails.findByPk(id);
};

exports.getLabTestRefDetailsAsPerQueryParamDAO = async (sequelize, options) => {
  const LabTestRefDetails = require("../models/LabTestRefDetailsModel")(sequelize);
  return await LabTestRefDetails.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true
  });
};

exports.getLabTestRefDetailsByLabTestIdAsPerQueryParamDAO = async (sequelize, options) => {
  const LabTestRefDetails = require("../models/LabTestRefDetailsModel")(sequelize);

  const query = {
    attributes: options.attributes || undefined,
    offset: options.offset || 0,
    limit: options.limit || 10,
    where: options.where || {},
    raw: true,
  };

  return await LabTestRefDetails.findAndCountAll(query);
};


exports.updateLabTestRefDetailByIdDAO = async (sequelize, lab_test_ref_id, updateData) => {
  const LabTestRefDetails = require("../models/LabTestRefDetailsModel")(sequelize);
  await LabTestRefDetails.update(updateData, { where: { lab_test_ref_id } });
  return await LabTestRefDetails.findByPk(lab_test_ref_id);
};

exports.deleteLabTestRefDetailByIdDAO = async (sequelize, lab_test_ref_id) => {
  const LabTestRefDetails = require("../models/LabTestRefDetailsModel")(sequelize);
  const LabTestRef = await LabTestRefDetails.findByPk(lab_test_ref_id);
  if (LabTestRef) await LabTestRef.destroy();
  return LabTestRef;
};