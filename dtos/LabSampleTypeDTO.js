exports.labSampleTypePOST = (dto) => ({
  lab_sample_type: dto.labSampleType,
  is_active: dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

exports.labFacultyGET = (dto) => ({
  labSampleTypeId: dto.lab_sample_type_id,
  labSampleType: dto.lab_sample_type,
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});

exports.labFacultyFieldMap = {
  labSampleTypeId: "lab_sample_type_id",
  labSampleType: "lab_sample_type",
  isActive: "is_active",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
};
