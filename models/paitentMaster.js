const { DataTypes } = require('sequelize');

const createPatientMasterModel = async (sequelize) => {
  const PatientMaster = sequelize.define('Patient_master', {
    PatientID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    PatientName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    EMRNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Ensure EMRNumber is unique
    }
  }, {
    tableName: 'Patient_master', // Specify the table name if different from the model name
    timestamps: true // Enable timestamps (createdAt, updatedAt)
  });

  await PatientMaster.sync(); // Ensure the table is created

  return PatientMaster;
};

module.exports = createPatientMasterModel;
