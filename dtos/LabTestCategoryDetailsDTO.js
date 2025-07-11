exports.labTestCategoryDetailsPOST = (dto) => ({
  lab_test_category_IDR: dto.labTestCategoryIDR,
  lab_test_IDR: dto.labTestIDR,
  sr_no:dto.dto.srNo,
  is_active: dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

exports.labTestCategoryDetailsGET = (dto) => ({
  labTestCategoryDetailsId: dto.lab_test_category_details_id,
  labTestCategoryIDR: dto.lab_test_category_IDR,
  labTestIDR: dto.lab_test_IDR,
  srNo:dto.sr_no,
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});



exports.labTestCategoryDetailsFieldMap = {
 labTestCategoryDetailsId: "lab_test_category_details_id",
  labTestCategoryIDR: "lab_test_category_IDR",
  labTestIDR: "lab_test_IDR",
  srNo:"sr_no",
  isActive: "is_active",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
};


