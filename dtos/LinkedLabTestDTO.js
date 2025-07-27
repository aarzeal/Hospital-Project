module.exports = {
  linkedLabTestDTO: (labTest, categoryDetails) => ({
    labTestId: labTest.lab_test_id,
    labTestName: labTest.lab_test_name,
    labTestCode: labTest.lab_test_code,
    isCalculated: labTest.is_calculated,
    labTestCategoryDetailsId: categoryDetails.lab_test_category_details_id,
    srNo: categoryDetails.sr_no,
    isActive: categoryDetails.is_active,
    referenceRange: labTest.reference_range
  }),

  linkedLabTestFieldMap: {
    labTestId: "lab_test_id",
    labTestName: "lab_test_name",
    labTestCode: "lab_test_code",
    isCalculated: "is_calculated",
    referenceRange: "reference_range",
    labTestCategoryDetailsId: "lab_test_category_details_id",
    srNo: "sr_no",
    isActive: "is_active"
  }
};