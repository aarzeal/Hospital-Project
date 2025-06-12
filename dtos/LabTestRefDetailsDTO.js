exports.toLabTestRefDetailsPOST = (dto) => ({
  lab_test_IDR: dto.labTestIDR,
  ref_title: dto.refTitle,
  ref_detail: dto.refDetail,
  is_active:dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

exports.toLabTestRefDetailsEntity = (dto) => ({
  labTestRefId: dto.lab_test_ref_id,
  labTestIDR: dto.lab_test_IDR,
  refTitle: dto.ref_title,
  refDetail: dto.ref_detail,
  isActive:dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
});

exports.labTestRefDetailsFieldMap={
  labTestRefId: 'lab_test_ref_id',
  labTestIDR: 'lab_test_IDR',
  refTitle: 'ref_title',
  refDetail: 'ref_detail',
  isActive: 'is_active',
  hospitalIDR: 'hospital_IDR',
  hospitalGroupIDR: 'hospital_group_IDR',  
}