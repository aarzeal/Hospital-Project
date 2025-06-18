exports.createLabSampleTypeDAO = async (sequelize, data) => {
  const LabSampleType = require("../models/labSampleTypeModel")(sequelize);
  await LabSampleType.sync({ force: false });
  return await LabSampleType.create(data);
};

exports.getAllLabSampleTypesDAO = async (sequelize) => {
  const LabSampleType = require("../models/labSampleTypeModel")(sequelize);
  return await LabSampleType.findAll();
};

exports.getLabSampleTypeByIdDAO = async (sequelize, id) => {
  const LabSampleType = require("../models/labSampleTypeModel")(sequelize);
  return await LabSampleType.findByPk(id);
};

exports.updatLabSampleTypeByIdDAO = async (sequelize, id, updateData) => {
  const LabSampleType = require("../models/labSampleTypeModel")(sequelize);
  await LabSampleType.update(updateData, { where: { id } });
  return await LabSampleType.findByPk(id);
};

exports.deleteLabSampleTypeByIdDAO = async (sequelize, id) => {
  const LabSampleType = require("../models/labSampleTypeModel")(sequelize);
  const product = await LabSampleType.findByPk(id);
  if (product) await product.destroy();
  return product;
};

exports.getLabSampleTypeDataAsPerQueryParamDAO = async (sequelize, options) => {
  const LabSampleType = require("../models/labSampleTypeModel")(sequelize);
  return await LabSampleType.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};
