exports.createAgeGroupDao = async (sequelize, ageGroupData) => {
  const AgeGroup = require("../models/AgeGroupModel")(sequelize);
  await AgeGroup.sync({ force: false });
  return await AgeGroup.create(ageGroupData);
};

exports.getAllAgeGroupDAO = async (sequelize) => {
  const AgeGroup = require("../models/AgeGroupModel")(sequelize);
  return await AgeGroup.findAll();
};

exports.getAgeGroupByIdDAO = async (sequelize, id) => {
  const AgeGroup = require("../models/AgeGroupModel")(sequelize);
  return await AgeGroup.findByPk(id);
};

exports.updateAgeGroupByIdDAO = async (sequelize, age_group_id, updateData) => {
  const AgeGroup = require("../models/AgeGroupModel")(sequelize);
  await AgeGroup.update(updateData, { where: { age_group_id } });
  return await AgeGroup.findByPk(age_group_id);
};

exports.deleteAgeGroupByIdDAO = async (sequelize, age_group_id) => {
  const AgeGroup = require("../models/AgeGroupModel")(sequelize);
  const product = await AgeGroup.findByPk(age_group_id);
  if (product) await product.destroy();
  return product;
};