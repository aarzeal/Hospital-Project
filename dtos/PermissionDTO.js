// DTO for Permission Table

exports.permissionPOST = (dto) => ({
  permission_name: dto.permissionName,
  is_active: dto.isActive, // optional, default true/false
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});


exports.permissionGET = (dto) => ({
  permissionId: dto.permission_id,
  permissionName: dto.permission_name,
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});

exports.permissionMap = {
  permissionId: "permission_id",
  permissionName: "permission_name",
  isActive: "is_active",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
};
