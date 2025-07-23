// CREATE
exports.createLabTestSensitivityDAO = async (sequelize, data) => {
  const LabTestSensitivity = require("../models/labTestSensitivityModel")(sequelize);
  await LabTestSensitivity.sync({ force: false });
  return await LabTestSensitivity.create(data);
};

// GET ALL
exports.getAllLabTestSensitivityDAO = async (sequelize) => {
  const LabTestSensitivity = require("../models/labTestSensitivityModel")(sequelize);
  return await LabTestSensitivity.findAll();
};

// GET BY ID
exports.getLabTestSensitivityByIdDAO = async (sequelize, id) => {
  const LabTestSensitivity = require("../models/labTestSensitivityModel")(sequelize);
  return await LabTestSensitivity.findByPk(id);
};

// UPDATE BY ID
exports.updateLabTestSensitivityByIdDAO = async (sequelize, id, updateData) => {
  const LabTestSensitivity = require("../models/labTestSensitivityModel")(sequelize);
  await LabTestSensitivity.update(updateData, { where: { lab_test_sensitivity_id: id } });
  return await LabTestSensitivity.findByPk(id);
};

// DELETE BY ID
exports.deleteLabTestSensitivityByIdDAO = async (sequelize, id) => {
  const LabTestSensitivity = require("../models/labTestSensitivityModel")(sequelize);
  const record = await LabTestSensitivity.findByPk(id);
  if (record) await record.destroy();
  return record;
};

// PAGINATED GET with attributes
exports.getLabTestSensitivityDataAsPerQueryParamDAO = async (sequelize, options) => {
  const LabTestSensitivity = require("../models/labTestSensitivityModel")(sequelize);
  return await LabTestSensitivity.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};
