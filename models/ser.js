
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define("Service", {
      service_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      service_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      service_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      service_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      service_category_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      service_charge_applicable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      service_tax_applicable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      non_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ledger_IDR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      HospitalGroupIDR: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: true,
     
      },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: true,
     
      },
    }, {
      tableName: "tbl_services",
      timestamps: true,
    });
  };