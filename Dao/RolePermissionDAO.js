// CREATE
exports.createRolePermissionDAO = async (sequelize, data) => {
  const RolePermission = require("../models/rolePermissionModel")(sequelize);
  await RolePermission.sync({ force: false });
  return await RolePermission.create(data);
};


// GET ALL
exports.getAllRolePermissionsDAO = async (sequelize) => {
  const RolePermission = require("../models/rolePermissionModel")(sequelize);
  return await RolePermission.findAll();
};


// GET BY ID
exports.getRolePermissionByIdDAO = async (sequelize, id) => {
  const RolePermission = require("../models/rolePermissionModel")(sequelize);
  return await RolePermission.findByPk(id);
};


// UPDATE BY ID
exports.updateRolePermissionByIdDAO = async (sequelize, id, updateData) => {
  const RolePermission = require("../models/rolePermissionModel")(sequelize);
  await RolePermission.update(updateData, { where: { role_permission_id: id } });
  return await RolePermission.findByPk(id);
};


// DELETE BY ID
exports.deleteRolePermissionByIdDAO = async (sequelize, id) => {
  const RolePermission = require("../models/rolePermissionModel")(sequelize);
  const record = await RolePermission.findByPk(id);
  if (record) await record.destroy();
  return record;
};


// GET DATA BY QUERY PARAMS (pagination, filters)
exports.getRolePermissionDataAsPerQueryParamDAO = async (sequelize, options) => {
  const RolePermission = require("../models/rolePermissionModel")(sequelize);

  return await RolePermission.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    raw: true,
  });
};
