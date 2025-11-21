// DAO for Permission Table

exports.createPermissionDAO = async (sequelize, data) => {
  const Permission = require("../models/PermissionModel")(sequelize);
  await Permission.sync({ force: false });
  return await Permission.create(data);
};

exports.getAllPermissionsDAO = async (sequelize) => {
  const Permission = require("../models/PermissionModel")(sequelize);
  return await Permission.findAll();
};

exports.getPermissionByIdDAO = async (sequelize, id) => {
  const Permission = require("../models/PermissionModel")(sequelize);
  return await Permission.findByPk(id);
};

exports.updatePermissionByIdDAO = async (sequelize, id, updateData) => {
  const Permission = require("../models/PermissionModel")(sequelize);
  await Permission.update(updateData, { where: { permission_id: id } });
  return await Permission.findByPk(id);
};

exports.deletePermissionByIdDAO = async (sequelize, id) => {
  const Permission = require("../models/PermissionModel")(sequelize);
  const permission = await Permission.findByPk(id);
  if (permission) await permission.destroy();
  return permission;
};

exports.getPermissionDataAsPerQueryParamDAO = async (sequelize, options) => {
  const Permission = require("../models/PermissionModel")(sequelize);
  return await Permission.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};
