// POST DTO → For creating user_permission
exports.userPermissionPOST = (dto) => ({
  userId: dto.userId,
  submodule_id: dto.submoduleId,
  permission_id: dto.permissionId,
  is_active: dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});


// GET DTO → For returning data to frontend
exports.userPermissionGET = (dto) => ({
  user_permission_id: dto.user_permission_id,
  userId: dto.userId,
  submoduleId: dto.submodule_id,
  permissionId: dto.permission_id,
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});


// MAP for internal mapping
exports.userPermissionMap = {
  userPermissionId: "user_permission_id",
  userId: "userId",
  submoduleId: "submodule_id",
  permissionId: "permission_id",
  isActive: "is_active",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
};
