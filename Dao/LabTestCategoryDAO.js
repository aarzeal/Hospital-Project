exports.createLabTestCategoryDAO = async (sequelize, data) => {
  const LabTestCategory = require("../models/labTestCategoryModel")(sequelize);
  await LabTestCategory.sync({ force: false });
  return await LabTestCategory.create(data);
};

exports.getAllLabTestCategorysDAO = async (sequelize) => {
  const LabTestCategory = require("../models/labTestCategoryModel")(sequelize);
  return await LabTestCategory.findAll();
};

exports.getLabTestCategoryByIdDAO = async (sequelize, id) => {
  const LabTestCategory = require("../models/labTestCategoryModel")(sequelize);
  return await LabTestCategory.findByPk(id);
};

exports.updatLabTestCategoryByIdDAO = async (sequelize, id, updateData) => {
  const LabTestCategory = require("../models/labTestCategoryModel")(sequelize);
  await LabTestCategory.update(updateData, {
    where: { lab_test_category_id: id },
  });
  return await LabTestCategory.findByPk(id);
};

exports.deleteLabTestCategoryByIdDAO = async (sequelize, id) => {
  const LabTestCategory = require("../models/labTestCategoryModel")(sequelize);
  const product = await LabTestCategory.findByPk(id);
  if (product) await product.destroy();
  return product;
};

exports.getLabTestCategoryDataAsPerQueryParamDAO = async (
  sequelize,
  options
) => {
  const LabTestCategory = require("../models/labTestCategoryModel")(sequelize);
  return await LabTestCategory.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};
