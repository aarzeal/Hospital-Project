// POST DTO → For creating role_field_permission
exports.roleFieldPermissionPOST = (dto) => ({
  role_id: dto.roleId,
  submodule_id: dto.submoduleId,
  field_name: dto.fieldName,      // ✅ CHANGED
  field_type: dto.fieldType,   
  permission: dto.permission, // ENUM value: 'read','update',...
  is_active: dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

// GET DTO → For returning data to frontend
exports.roleFieldPermissionGET = (dto) => ({
  roleFieldPermissionId: dto.role_field_permission_id,
  roleId: dto.role_id,
  submoduleId: dto.submodule_id,
  fieldName: dto.field_name,      // ✅ CHANGED
  fieldType: dto.field_type,      // ✅ CHANGED
  permission: dto.permission, // ENUM value
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});

// MAP for internal mapping
exports.roleFieldPermissionMap = {
  roleFieldPermissionId: "role_field_permission_id",
  roleId: "role_id",
  submoduleId:"submodule_id",
  fieldName: "field_name",        // ✅ CHANGED
  fieldType: "field_type",        // ✅ CHANGED
  permission: "permission",
  isActive: "is_active",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
};
