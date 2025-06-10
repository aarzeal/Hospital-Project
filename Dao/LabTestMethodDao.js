exports.createLabTestMethodDao = async (sequelize, labtestmethodData) => {
  const LabTestMethod = require("../models/LabTestMethodModel")(sequelize);
  await LabTestMethod.sync({ force: false });
  return await LabTestMethod.create(labtestmethodData);
};

exports.getAllLabTestMethodDAO = async (sequelize) => {
  const LabTestMethod = require("../models/LabTestMethodModel")(sequelize);
  return await LabTestMethod.findAll();
};

exports.getLabTestMethodByIdDAO = async (sequelize, id) => {
  const LabTestMethod = require("../models/LabTestMethodModel")(sequelize);
  return await LabTestMethod.findByPk(id);
};

exports.updateLabTestMethodByIdDAO = async (sequelize, lab_test_method_id, updateData) => {
  const LabTestMethod = require("../models/LabTestMethodModel")(sequelize);
  await LabTestMethod.update(updateData, { where: { lab_test_method_id } });
  return await LabTestMethod.findByPk(lab_test_method_id);
};


exports.deleteLabTestMethodByIdDAO = async (sequelize, lab_test_method_id) => {
  const LabTestMethod = require("../models/LabTestMethodModel")(sequelize);
  const product = await LabTestMethod.findByPk(lab_test_method_id);
  if (product) await product.destroy();
  return product;
};




















































// const hospital = require("../models/HospitalModel")(sequelize);
// const Group = require("../models/HospitalGroup")(sequelize);

// const group = await Group.findOne({ where: { HospitalGroupID: hospitalGroupIDR } });
//   if (!group) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1260;

//     logger.logWithMeta("error", "Invalid HospitalGroupID, not found in MasterDB", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: req.username,
//       // updatedBy:req.username
//     });
//     return res.status(400).json({ errorCode, message: "Invalid HospitalGroupID, not found in MasterDB" });
//   }

//   const hospitalid = await hospital.findOne({ where: { HospitalID: hospitalIDR } });
//   if (!hospitalid) {
//     const executionTime = `${Date.now() - start}ms`;
//     const errorCode = 1260;

//     logger.logWithMeta("error", "Invalid HospitaID, not found in MasterDB", {
//       errorCode,
//       executionTime,
//       hospitalId: req.hospitalName,
//       apiName: req.originalUrl,
//       city: locationData?.city,
//       country: locationData?.country,
//       apiName: req.originalUrl,
//       method: req.method,
//       userAgent: req.headers["user-agent"],
//       createdBy: req.username,
//       updatedBy: req.username
//     });
//     return res.status(400).json({ errorCode, message: "Invalid HospitalID, not found in MasterDB" });
//   }
