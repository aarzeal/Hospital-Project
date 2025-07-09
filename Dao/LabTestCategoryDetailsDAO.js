exports.createLabTestCategoryDAO = async (sequelize, data) => {
  const LabTestCategoryDetails = require("../models/labTestCategoryDetailsModel")(sequelize);
  await LabTestCategoryDetails.sync({ force: false });
  return await LabTestCategoryDetails.create(data);
};

exports.getAllLabTestCategoryDetailsDAO = async (sequelize) => {
  const LabTestCategoryDetails = require("../models/labTestCategoryDetailsModel")(sequelize);
  return await LabTestCategoryDetails.findAll();
};

exports.getLabTestCategoryDetailsByIdDAO = async (sequelize, id) => {
  const LabTestCategoryDetails = require("../models/labTestCategoryDetailsModel")(sequelize);
  return await LabTestCategoryDetails.findByPk(id);
};

exports.updatLabTestCategoryDetailsByIdDAO = async (sequelize, id, updateData) => {
  const LabTestCategoryDetails = require("../models/labTestCategoryDetailsModel")(sequelize);
  await LabTestCategoryDetails.update(updateData, {
    where: { lab_test_category_details_id: id },
  });
  return await LabTestCategoryDetails.findByPk(id);
};

exports.deleteLabTestCategoryDetailsByIdDAO = async (sequelize, id) => {
  const LabTestCategoryDetails = require("../models/labTestCategoryDetailsModel")(sequelize);
  const product = await LabTestCategoryDetails.findByPk(id);
  if (product) await product.destroy();
  return product;
};

exports.getLabTestCategoryDetailsDataAsPerQueryParamDAO = async (
  sequelize,
  options
) => {
  const LabTestCategoryDetails = require("../models/labTestCategoryDetailsModel")(sequelize);
  return await LabTestCategoryDetails.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};
