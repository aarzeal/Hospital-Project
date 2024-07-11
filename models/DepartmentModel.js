const { DataTypes } = require('sequelize');
// const sequelize = require('../database/connection');

module.exports = (sequelize) => {
  const Department = sequelize.define('Department', {
    DepartmentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    DepartmentName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    DeptCode: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    IsClinical: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    CreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    EditedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    EditedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    HospitalIDR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: {
      //   model: 'tblHospital',
      //   key: 'HospitalID'
      // }
    }
  }, {
    tableName: 'tblDepartment',
    timestamps: false
  });
  // Department.associate = function(models) {
  //   Department.belongsTo(models.Hospital, { foreignKey: 'HospitalIDR' });
  // };
  return Department;
};
