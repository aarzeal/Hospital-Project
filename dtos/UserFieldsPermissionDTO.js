// POST DTO → For creating user_field_permission
exports.userFieldPermissionPOST = (dto) => ({
  userId: dto.userId,
  submodule_id: dto.submoduleId,
  field_name: dto.fieldName,
  field_type: dto.fieldType,
  permission: dto.permission, // ENUM
  is_active: dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});


// GET DTO → For returning data to frontend
exports.userFieldPermissionGET = (dto) => ({
  userFieldPermissionId: dto.user_field_permission_id,
  userId: dto.userId,
  submoduleId: dto.submodule_id,
  fieldName: dto.field_name,
  fieldType: dto.field_type,
  permission: dto.permission,
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});

// MAP for internal mapping
exports.userFieldPermissionMap = {
  userFieldPermissionId: "user_field_permission_id",
  userId: "userId",
  submoduleId: "submodule_id",
  fieldName: "field_name",
  fieldType: "field_type",
  permission: "permission",
  isActive: "is_active",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
};
