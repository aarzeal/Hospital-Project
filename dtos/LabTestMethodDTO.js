exports.toLabTestMethodPOST = (dto) => ({
  lab_test_method_name: dto.labTestMethodName,
  lab_test_method_code: dto.labTestMethodCode,
  remark: dto.Remark,
  is_active:dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

exports.toLabTestMethodEntity = (dto) => ({
  labTestMethodId: dto.lab_test_method_id,
  labTestMethodName: dto.lab_test_method_name,
  labTestMethodCode: dto.lab_test_method_code,
  Remark: dto.remark,
  isActive:dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  // createdBy: dto.created_by,
  // createdAt: dto.created_at,
  // updatedBy: dto.updated_by,
  // updatedAt: dto.updated_at,
});