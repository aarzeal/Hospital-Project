exports.createLabTestDao = async (sequelize, labtestData) => {
  const LabTest = require("../models/LabTestModel")(sequelize);
  await LabTest.sync({ force: false });
  return await LabTest.create(labtestData);
};

exports.getAllLabTestDAO = async (sequelize) => {
  const LabTest = require("../models/LabTestModel")(sequelize);
  return await LabTest.findAll();
};

exports.getLabTestByIdDAO = async (sequelize, id) => {
  const LabTest = require("../models/LabTestModel")(sequelize);
  return await LabTest.findByPk(id);
};

exports.updateLabTestByIdDAO = async (sequelize, lab_test_id, updateData) => {
  const LabTest = require("../models/LabTestModel")(sequelize);
  await LabTest.update(updateData, { where: { lab_test_id } });
  return await LabTest.findByPk(lab_test_id);
};

exports.deleteLabTestByIdDAO = async (sequelize, lab_test_id) => {
  const LabTest = require("../models/LabTestModel")(sequelize);
  const product = await LabTest.findByPk(lab_test_id);
  if (product) await product.destroy();
  return product;
};