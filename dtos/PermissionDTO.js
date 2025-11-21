// DTO for Permission Table

exports.permissionPOST = (dto) => ({
  permission_name: dto.permissionName,
  is_active: dto.isActive, // optional, default true/false
});

exports.permissionGET = (dto) => ({
  permissionId: dto.permission_id,
  permissionName: dto.permission_name,
  isActive: dto.is_active,
});

exports.permissionMap = {
  permissionId: "permission_id",
  permissionName: "permission_name",
  isActive: "is_active",
};
