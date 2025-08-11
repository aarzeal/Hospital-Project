// POST DTO
exports.labTestPackagePOST = (dto) => ({
  lab_test_package_name: dto.labTestPackageName,
  lab_test_package_code: dto.labTestPackageCode,
  remarks: dto.remarks,
  is_active: dto.isActive,
  is_default: dto.isDefault,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

// GET DTO
exports.labTestPackageGET = (dto) => ({
  labTestPackageId: dto.lab_test_package_id,
  labTestPackageName: dto.lab_test_package_name,
  labTestPackageCode: dto.lab_test_package_code,
  remarks: dto.remarks,
  isActive: dto.is_active,
  isDefault: dto.is_default,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
  createdAt: dto.CreatedAt,    
  updatedAt: dto.UpdatedAt,     
});

// Field Map
exports.labTestPackageFieldMap = {
  labTestPackageId: "lab_test_package_id",
  labTestPackageName: "lab_test_package_name",
  labTestPackageCode: "lab_test_package_code",
  remarks: "remarks",
  isActive: "is_active",
  isDefault: "is_default",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
};
