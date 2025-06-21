exports.labTestNotesPOST = (dto) => ({
  lab_test_IDR: dto.labTestIDR,
  is_lab_test_report: dto.isLabTestReport,
  lab_test_report_IDR: dto.labTestReportIDR,
  lab_test_note: dto.labTestNote,
  is_default: dto.isDefault,
  remarks: dto.remarks,
  is_active: dto.isActive,
  hospital_IDR: dto.hospitalIDR,
  hospital_group_IDR: dto.hospitalGroupIDR,
  created_by: dto.createdBy,
  updated_by: dto.updatedBy,
});

exports.labTestNotesGET = (dto) => ({
  labTestNotesId: dto.lab_test_notes_id,
  labTestIDR: dto.lab_test_IDR,
  isLabTestReport: dto.is_lab_test_report,
  labTestReportIDR: dto.lab_test_report_IDR,
  labTestNote: dto.lab_test_note,
  isDefault: dto.is_default,
  remarks: dto.remarks,
  isActive: dto.is_active,
  hospitalIDR: dto.hospital_IDR,
  hospitalGroupIDR: dto.hospital_group_IDR,
  createdBy: dto.created_by,
  updatedBy: dto.updated_by,
});

exports.labTestNotesFieldMap = {
  lab_test_notes_id: "labTestNotesId",
  lab_test_IDR: "labTestIDR",
  is_lab_test_report: "isLabTestReport",
  lab_test_report_IDR: "labTestReportIDR",
  lab_test_note: "labTestNote",
  is_default: "isDefault",
  remarks: "remarks",
  is_active: "isActive",
  hospital_IDR: "hospitalIDR",
  hospital_group_IDR: "hospitalGroupIDR",
};
