// // CREATE
// exports.createRolePermissionDAO = async (sequelize, data) => {
//   const RolePermission = require("../models/rolePermissionModel")(sequelize);
//   await RolePermission.sync({ force: false });
//   return await RolePermission.create(data);
// };


// // GET ALL
// exports.getAllRolePermissionsDAO = async (sequelize) => {
//   const RolePermission = require("../models/rolePermissionModel")(sequelize);
//   return await RolePermission.findAll();
// };


// // GET BY ID
// exports.getRolePermissionByIdDAO = async (sequelize, id) => {
//   const RolePermission = require("../models/rolePermissionModel")(sequelize);
//   return await RolePermission.findByPk(id);
// };


// // UPDATE BY ID
// exports.updateRolePermissionByIdDAO = async (sequelize, id, updateData) => {
//   const RolePermission = require("../models/rolePermissionModel")(sequelize);
//   await RolePermission.update(updateData, { where: { role_permission_id: id } });
//   return await RolePermission.findByPk(id);
// };


// // DELETE BY ID
// exports.deleteRolePermissionByIdDAO = async (sequelize, id) => {
//   const RolePermission = require("../models/rolePermissionModel")(sequelize);
//   const record = await RolePermission.findByPk(id);
//   if (record) await record.destroy();
//   return record;
// };


// // GET DATA BY QUERY PARAMS (pagination, filters)
// exports.getRolePermissionDataAsPerQueryParamDAO = async (sequelize, options) => {
//   const RolePermission = require("../models/rolePermissionModel")(sequelize);

//   return await RolePermission.findAndCountAll({
//     attributes: options.attributes,
//     offset: options.offset,
//     limit: options.limit,
//     raw: true,
//   });
// };


// CREATE SINGLE
exports.createRolePermissionDAO = async (sequelize, data) => {
  const RolePermission = require("../models/rolePermissionModel")(sequelize);
  await RolePermission.sync({ force: false });
  return await RolePermission.create(data);
};

// BULK CREATE
exports.bulkCreateRolePermissionsDAO = async (sequelize, dataArray) => {
  const RolePermission = require("../models/rolePermissionModel")(sequelize);
  await RolePermission.sync({ force: false });
  return await RolePermission.bulkCreate(dataArray, {
    returning: true
  });
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

// GET ALL ACCESS BY ROLE ID
exports.getAllAccessByRoleIdDAO = async (sequelize, roleId) => {
  const RolePermission = require("../models/rolePermissionModel")(sequelize);

  const data = await RolePermission.findAll({
    where: {
      role_id: roleId
    },
    raw: true
  });

  // ✅ Grouping data as: role -> module -> submodules
  const grouped = [];

  data.forEach((item) => {
    // Check if module already exists
    let module = grouped.find(m => m.module_id === item.module_id);

    // If module not exist -> create
    if (!module) {
      module = {
        role_id: item.role_id,
        module_id: item.module_id,
        submodules: []
      };
      grouped.push(module);
    }

    // ✅ Push submodule inside module
    module.submodules.push({
      submodule_id: item.submodule_id,
      isActive: item.is_active,
      permission_id: item.permission_id,
      hospital_IDR: item.hospital_IDR,
      hospital_group_IDR: item.hospital_group_IDR,
      created_by: item.created_by,
      updated_by: item.updated_by
    });
  });

  return grouped;
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

// DELETE BY ROLE, MODULE AND HOSPITAL
exports.deleteRolePermissionByRoleModuleDAO = async (sequelize, roleId, moduleId, hospitalIDR) => {
  const RolePermission = require("../models/rolePermissionModel")(sequelize);
  return await RolePermission.destroy({
    where: {
      role_id: roleId,
      module_id: moduleId,
      hospital_IDR: hospitalIDR
    }
  });
};

// GET BY ROLE, MODULE AND HOSPITAL
exports.getRolePermissionsByRoleModuleHospitalDAO = async (sequelize, roleId, moduleId, hospitalIDR) => {
  const RolePermission = require("../models/rolePermissionModel")(sequelize);
  return await RolePermission.findAll({
    where: {
      role_id: roleId,
      module_id: moduleId,
      hospital_IDR: hospitalIDR
    }
  });
};