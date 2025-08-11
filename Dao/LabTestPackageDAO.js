exports.createLabTestPackageDAO = async (sequelize, data) => {
  const LabTestPackage = require("../models/labTestPackageModel")(sequelize);
  await LabTestPackage.sync({ force: false });
  return await LabTestPackage.create(data);
};

exports.getAllLabTestPackagesDAO = async (sequelize) => {
  const LabTestPackage = require("../models/labTestPackageModel")(sequelize);
  return await LabTestPackage.findAll();
};

exports.getLabTestPackageByIdDAO = async (sequelize, id) => {
  const LabTestPackage = require("../models/labTestPackageModel")(sequelize);
  return await LabTestPackage.findByPk(id);
};

exports.updateLabTestPackageByIdDAO = async (sequelize, id, updateData) => {
  const LabTestPackage = require("../models/labTestPackageModel")(sequelize);
  await LabTestPackage.update(updateData, {
    where: { lab_test_package_id: id },
  });
  return await LabTestPackage.findByPk(id);
};

exports.deleteLabTestPackageByIdDAO = async (sequelize, id) => {
  const LabTestPackage = require("../models/labTestPackageModel")(sequelize);
  const packageData = await LabTestPackage.findByPk(id);
  if (packageData) await packageData.destroy();
  return packageData;
};

exports.getLabTestPackageDataAsPerQueryParamDAO = async (sequelize, options) => {
  const LabTestPackage = require("../models/labTestPackageModel")(sequelize);
  return await LabTestPackage.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};
