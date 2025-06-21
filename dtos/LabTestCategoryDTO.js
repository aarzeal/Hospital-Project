exports.labTestCategoryPOST = (dto) => ({
  lab_test_category_name: dto.labTestCategoryName,
  lab_test_category_code: dto.labTestCategoryCode,
  fit_to_hundred: dto.fitToHundred,
  remarks: dto.remarks,
  is_active: dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

exports.labTestCategoryGET = (dto) => ({
  labTestCategoryId: dto.lab_test_category_id,
  labTestCategoryName: dto.lab_test_category_name,
  labTestCategoryCode: dto.lab_test_category_code,
  fitToHundred: dto.fit_to_hundred,
  remarks: dto.remarks,
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});

exports.labTestCategoryFieldMap = {
  lab_test_category_id: "labTestCategoryId",
  lab_test_category_name: "labTestCategoryName",
  lab_test_category_code: "labTestCategoryCode",
  fit_to_hundred: "fitToHundred",
  remarks: "remarks",
  is_active: "isActive",
  hospital_IDR: "hospitalIDR",
  hospital_group_IDR: "hospitalGroupIDR",
};
