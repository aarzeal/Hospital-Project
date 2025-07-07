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
  labTestCategoryId:"lab_test_category_id",
  labTestCategoryName:"lab_test_category_name",
  labTestCategoryCode:"lab_test_category_code",
  fitToHundred:"fit_to_hundred",
  remarks:"remarks",
  isActive:"is_active",
  hospitalIDR:"hospital_IDR",
  hospitalGroupIDR:"hospital_group_IDR",
};
