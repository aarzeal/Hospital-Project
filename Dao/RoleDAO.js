exports.createRoleDAO = async (sequelize, data) => {
  const Role = require("../models/roleModel")(sequelize);
  await Role.sync({ force: false });
  return await Role.create(data);
};

exports.getAllRolesDAO = async (sequelize) => {
  const Role = require("../models/roleModel")(sequelize);
  return await Role.findAll();
};

exports.getRoleByIdDAO = async (sequelize, id) => {
  const Role = require("../models/roleModel")(sequelize);
  return await Role.findByPk(id);
};

exports.updateRoleByIdDAO = async (sequelize, id, updateData) => {
  const Role = require("../models/roleModel")(sequelize);
  await Role.update(updateData, { where: { role_id: id } });
  return await Role.findByPk(id);
};

exports.deleteRoleByIdDAO = async (sequelize, id) => {
  const Role = require("../models/roleModel")(sequelize);
  const record = await Role.findByPk(id);
  if (record) await record.destroy();
  return record;
};

exports.getRoleDataAsPerQueryParamDAO = async (sequelize, options) => {
  const Role = require("../models/roleModel")(sequelize);
  return await Role.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};
