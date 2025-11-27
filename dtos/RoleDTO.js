exports.rolePOST = (dto) => ({
  role_name: dto.roleName,
  is_active: dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,  
  updated_by: dto.updatedBy,
});

exports.roleGET = (dto) => ({
  roleId: dto.role_id,
  roleName: dto.role_name,
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});

exports.roleMap = {
  roleId: "role_id",
  roleName: "role_name",
  isActive: "is_active",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
};
