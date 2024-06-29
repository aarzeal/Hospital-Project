const { PatientMaster, Hospital } = require('../models'); // Adjust the path as per your project structure

const getPatientsByHospitalGroupID = async (hospitalGroupIDR) => {
  try {
    const patients = await PatientMaster.findAll({
      include: [{
        model: Hospital,
        where: { HospitalGroupIDR: hospitalGroupIDR }
      }]
    });
    return patients;
  } catch (error) {
    throw new Error(`Error fetching patients: ${error.message}`);
  }
};

module.exports = {
  getPatientsByHospitalGroupID
};
