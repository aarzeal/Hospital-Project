// POST DTO: From client to DB format
exports.labTestSensitivityPOST = (dto) => ({
  sensivity_pattern: dto.sensivityPattern,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

// GET DTO: From DB to client format
exports.labTestSensitivityGET = (dto) => ({
  labTestSensitivityID: dto.LabTestSensitivityID,
  sensivityPattern: dto.sensivity_pattern,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
  createdAt: dto.CreatedAt,
  updatedAt: dto.UpdatedAt,
});

// Field mapping: camelCase → snake_case
exports.labTestSensitivityFieldMap = {
  labTestSensitivityID: "LabTestSensitivityID",
  sensivityPattern: "sensivity_pattern",
  hospitalIDR: "hospital_IDR",
  hospitalGroupIDR: "hospital_group_IDR",
  createdBy: "created_by",
  updatedBy: "updated_by",
  createdAt: "CreatedAt",
  updatedAt: "UpdatedAt",
};
