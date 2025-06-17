exports.labFacultyPOST = (dto) => ({
  lab_faculty_name: dto.labFacultyName,
  lab_faculty_code: dto.labFacultyCode,
  remarks: dto.remarks,
  is_active: dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

exports.labFacultyGET = (dto) => ({
  labFacultyId: dto.lab_faculty_id,
  labFacultyName: dto.lab_faculty_name,
  labFacultyCode: dto.lab_faculty_code,
  remarks: dto.remarks,
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});
