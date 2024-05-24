const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Hospital = sequelize.define('tblHospital', {
  HospitalID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  HospitalName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  HospitalCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ManagingCompany: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ManagingCompanyAdd1: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ManagingCompanyAdd2: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ManagingCompanyAdd3: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ManagingCompanyEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Must be a valid email address'
      }
    }
  },
  ManagingCompanyWebsite: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  City: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Province: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Region: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Country: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  HospitalOwner: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  OwnerName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  OwnerAdd1: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  OwnerAdd2: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  OwnerAdd3: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  OwnerCity: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  OwnerProvince: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  OwnerRegion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  OwnerCountry: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  OwnerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Must be a valid email address'
      }
    }
  },
  HospitalIDNo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  TaxNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ServiceNo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  RegistrationNo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  VATNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  GSTNo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  TINNo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  AccBooksBeginFrom: {
    type: DataTypes.DATE,
    allowNull: true
  },
  OtherRegNo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  HospitalLogo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  HospitalGroupIDR: {
    type: DataTypes.INTEGER,
    references: {
      model: 'tblHospitalGroup',
      key: 'HospitalGroupID'
    },
    allowNull: true
  },
  CreatedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  CreatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Reserve1: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Reserve2: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Reserve3: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Reserve4: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Reserve5: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Reserve6: {
    type: DataTypes.STRING,
    allowNull: true
  },
  HospitalDatabase: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'tblHospital',
  timestamps: false
});

module.exports = Hospital;
