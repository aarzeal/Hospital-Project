// =====================================
// CREATE
// =====================================
exports.createUserPermissionDAO = async (sequelize, data) => {
  const UserPermission = require("../models/UserPermissionModel")(sequelize);
  await UserPermission.sync({  alter: true });
  return await UserPermission.create(data);
};


// =====================================
// BULK CREATE USER PERMISSIONS DAO
// =====================================
exports.bulkCreateUserPermissionsDAO = async (sequelize, dataArray) => {
  const UserPermission = require("../models/UserPermissionModel")(sequelize);

  // ✅ Sync model (alter = true ensures table matches model)
  await UserPermission.sync({alter:false});

  // ✅ Bulk create
  return await UserPermission.bulkCreate(dataArray, {
    returning: true, // Created records ko return kare
  });
};


// =====================================
// GET ALL
// =====================================
exports.getAllUserPermissionsDAO = async (sequelize) => {
  const UserPermission = require("../models/UserPermissionModel")(sequelize);
  return await UserPermission.findAll();
};


// =====================================
// GET BY ID
// =====================================
exports.getUserPermissionByIdDAO = async (sequelize, id) => {
  const UserPermission = require("../models/UserPermissionModel")(sequelize);
  return await UserPermission.findByPk(id);
};


// =====================================
// UPDATE BY ID
// =====================================
exports.updateUserPermissionByIdDAO = async (sequelize, id, updateData) => {
  const UserPermission = require("../models/UserPermissionModel")(sequelize);

  await UserPermission.update(updateData, { where: { user_permission_id: id } });

  return await UserPermission.findByPk(id);
};


// =====================================
// DELETE BY ID
// =====================================
exports.deleteUserPermissionByIdDAO = async (sequelize, id) => {
  const UserPermission = require("../models/UserPermissionModel")(sequelize);

  const record = await UserPermission.findByPk(id);
  if (record) await record.destroy();

  return record;
};


// =====================================
// PAGINATION + FILTERING
// =====================================
exports.getUserPermissionDataAsPerQueryParamDAO = async (sequelize, options) => {
  const UserPermission = require("../models/UserPermissionModel")(sequelize);

  return await UserPermission.findAndCountAll({
    attributes: options.attributes,
    offset: options.offset,
    limit: options.limit,
    // include: ["user", "submodule", "permission"],
    raw: true,
  });
};


// =====================================
// EXTRA: FETCH BY USER ID
// =====================================
exports.getPermissionsByUserIdDAO = async (sequelize, userId) => {
  const UserPermission = require("../models/UserPermissionModel")(sequelize);

  return await UserPermission.findAll({
    where: { userId },
    // include: ["submodule", "permission"],
  });
};


// =====================================
// EXTRA: FETCH BY USER + SUBMODULE (to avoid duplicate)
// =====================================
exports.getPermissionsByUserAndSubmoduleDAO = async (sequelize, userId, submoduleId) => {
  const UserPermission = require("../models/UserPermissionModel")(sequelize);
  await UserPermission.sync({ alter: false });

  return await UserPermission.findAll({
    where: {
      userId,
      submodule_id: submoduleId,
    },
    // include: ["permission"],
  });
};


// =====================================
// EXTRA: TOGGLE ACTIVE STATUS
// =====================================
exports.toggleUserPermissionStatusDAO = async (sequelize, id, newStatus) => {
  const UserPermission = require("../models/UserPermissionModel")(sequelize);

  await UserPermission.update(
    { is_active: newStatus },
    { where: { user_permission_id: id } }
  );

  return await UserPermission.findByPk(id);
};


// =====================================
// EXTRA: CHECK DUPLICATE (user + submodule + permission)
// =====================================
exports.checkDuplicateUserPermissionDAO = async (sequelize, userId, submoduleId, permissionId) => {
  const UserPermission = require("../models/UserPermissionModel")(sequelize);

  return await UserPermission.findOne({
    where: {
      userId,
      submodule_id: submoduleId,
      permission_id: permissionId,
    },
  });
};
