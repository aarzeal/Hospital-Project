// POST DTO → For creating role_permission
exports.submoduleFieldsPOST = (dto) => ({
  field_name:dto.fieldName,
  submodule_id: dto.submoduleId,
  is_active: dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});


// GET DTO → For returning data to frontend
exports.submoduleFieldsGET = (dto) => ({
  fieldId: dto.field_id,
  fieldName:dto.field_name,
  submoduleId: dto.submodule_id,
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});


// MAP for internal mapping
exports.submoduleFieldsMap = {
  fieldId: "field_id",
  fieldName:"field_name",
  submoduleId: "submodule_id",
  isActive: "is_active",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
};
