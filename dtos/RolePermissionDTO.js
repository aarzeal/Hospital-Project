// POST DTO → For creating role_permission
exports.rolePermissionPOST = (dto) => ({
  role_id: dto.roleId,
  module_id: dto.moduleId,
  submodule_id: dto.submoduleId,
  permission_id: dto.permissionId,
  is_active: dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});


// GET DTO → For returning data to frontend
exports.rolePermissionGET = (dto) => ({
  rolePermissionId: dto.role_permission_id,
  roleId: dto.role_id,
  moduleId: dto.module_id,
  submoduleId: dto.submodule_id,
  permissionId: dto.permission_id,
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});


// MAP for internal mapping
exports.rolePermissionMap = {
  rolePermissionId: "role_permission_id",
  roleId: "role_id",
  moduleId: "module_id",
  submoduleId: "submodule_id",
  permissionId: "permission_id",
  isActive: "is_active",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
};
