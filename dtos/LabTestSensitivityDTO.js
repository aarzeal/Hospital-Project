// POST DTO: From client to DB format
exports.labTestSensitivityPOST = (dto) => ({
  sensitivity_pattern: dto.sensitivityPattern,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

// GET DTO: From DB to client format
exports.labTestSensitivityGET = (dto) => ({
  labTestSensitivityID: dto.lab_test_sensitivity_id,
  sensitivityPattern: dto.sensitivity_pattern,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
  createdAt: dto.CreatedAt,
  updatedAt: dto.UpdatedAt,
});

// Field mapping: camelCase → snake_case
exports.labTestSensitivityFieldMap = {
  labTestSensitivityID: "lab_test_sensitivity_id",
  sensitivityPattern: "sensitivity_pattern",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
  createdBy: "created_by",
  updatedBy: "updated_by",
  createdAt: "CreatedAt",
  updatedAt: "UpdatedAt",
};
