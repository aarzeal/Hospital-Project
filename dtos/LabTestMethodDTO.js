exports.toLabTestMethodPOST = (dto) => ({
  lab_test_method_name: dto.labTestMethodName,
  lab_test_method_code: dto.labTestMethodCode,
  remark: dto.Remark,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR:dto.hospitalGroupIDR
});

exports.toLabTestMethodEntity = (dto) => ({
  labTestMethodId: dto.lab_test_method_id,
  labTestMethodName: dto.lab_test_method_name,
  labTestMethodCode: dto.lab_test_method_code,
  Remark: dto.remark,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR:dto.hospital_group_IDR
});