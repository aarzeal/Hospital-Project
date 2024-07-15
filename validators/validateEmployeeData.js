const employeeConfig = require('../config/employeeConfig.json'); // Adjust the path accordingly

// Validation function
function validateEmployeeData(employeeData) {
  const errors = [];
  const { Gender, BloodGroupIDR, NationalityIDR, ReligionIDR, CastIDF, QualificationIDR, MaritalStatus } = employeeData;

  if (!employeeConfig.Gender[Gender]) errors.push("Invalid gender value");
  if (!employeeConfig.BloodGroup[BloodGroupIDR]) errors.push("Invalid blood group value");
  if (!employeeConfig.Nationality[NationalityIDR]) errors.push("Invalid nationality value");
  if (!employeeConfig.Religion[ReligionIDR]) errors.push("Invalid religion value");
  if (!employeeConfig.Cast[CastIDF]) errors.push("Invalid cast value");
  if (!employeeConfig.Qualification[QualificationIDR]) errors.push("Invalid qualification value");
  if (!employeeConfig.MaritalStatus[MaritalStatus]) errors.push("Invalid marital status value");

  return errors.length ? errors : null;
}

// Sample employee data
const employeeData = {
  FName: "John",
  MName: "Doe",
  LName: "Smith",
  SkillSetIDF: 1,
  Gender: 1,  // "Male"
  EmployeeGroup: 2,
  BloodGroupIDR: 1,  // "A+"
  DepartmentIDR: 3,
  DesignationIDR: 2,
  NationalityIDR: 4,  // "Indian"
  ReligionIDR: 2,  // "Islam"
  CastIDF: 1,  // "General"
  QualificationIDR: 2,  // "Bachelor's"
  EmployeeCategoryIDR: 1,
  EmployeeCode: "EMP123",
  EmployeeNo: 1001,
  UniqueTAXNo: "TAX12345",
  EmployeePhoto: "path/to/photo.jpg",
  WagesIDF: 50000,
  DateOfBirth: "1990-05-15",
  DateOfJoining: "2020-01-01",
  DateOfLeaving: null,
  MaritalStatus: 2,  // "Married"
  DrRegistrationNumber: "DR12345",
  CandidateCode: "CAND567",
  ProbApplicable: true,
  ProbPeriodDate: "2025-01-01",
  ProbComplete: false,
  SalaryPlanIDF: 1,
  RulePlanIDF: 1,
  BankLedgerIDF: 1,
  HoursPerDay: 8,
  BankAcNo: "1234567890",
  SSFApplicable: true,
  SSFNo: "SSF12345",
  NoOfChildren: 2,
  NoOfDependant: 1,
  IsEmployeeRetire: false,
  IsSalaryOnHold: false,
  HealthCardNo: "HC12345",
  PassPortNo: "PP456789",
  PassPortExpDate: "2030-12-31",
  EmployeeType: 1,
  DutyScheduleType: 1,
  HospitalIDR: 1,
  RelationWithMName: 2,
  ReasonOfLeaving: 3,
  EmpBankIDR: 1,
  GovernmentPlan: null,
  PracticeNumber: "PRAC9876"
};

// Validate and create the employee
const validationErrors = validateEmployeeData(employeeData);
if (validationErrors) {
  console.error("Validation error creating employee:", validationErrors.join(", "));
} else {
  // Proceed with creating the employee record
  console.log("Employee data is valid. Proceeding with employee creation...");
  // Add your employee creation logic here (e.g., save to database)
}
