// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   const StaffMaster = sequelize.define('StaffMaster', {
//     Id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     FirstName: {
//       type: DataTypes.STRING(40),
//       allowNull: false
//     },
//     MiddleName: {
//       type: DataTypes.STRING(40),
//       allowNull: true
//     },
//     LastName: {
//       type: DataTypes.STRING(40),
//       allowNull: false
//     },
//     Email: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
      
//       validate: {
//         isEmail: true
//       }
//       // unique: {
//       //   name: 'email',
//       //   msg: 'The email address is already registered.'
//       // },
//     },
//     Address: {
//       type: DataTypes.TEXT,
//       allowNull: true
//     },
//     Age: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     DOB: {
//       type: DataTypes.DATEONLY,
//       allowNull: true
//     },
//     BloodGroup: {
//       type: DataTypes.STRING(5),
//       allowNull: true
//     },
//     Gender: {
//       type: DataTypes.STRING(10),
//       allowNull: false
//     },
//     EmergencyContactName: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     EmergencyContactPhone: {
//       type: DataTypes.STRING(15),
//       allowNull: true
//     },
//     MaritalStatus: {
//       type: DataTypes.STRING(20),
//       allowNull: true
//     },
//     Nationality: {
//       type: DataTypes.STRING(50),
//       allowNull: true
//     },
//     Language: {
//       type: DataTypes.STRING(50),
//       allowNull: true
//     },
//     MobileNumber: {
//       type: DataTypes.STRING(15),
//       allowNull: true
//     },
//     Qualification: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     Experience: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     // Specialization: {
//     //   type: DataTypes.STRING(100),
//     //   allowNull: true

//     // },
//     Specialization: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: 'tblspecialty', // Name of the referenced table
//         key: 'SpecialtyId'     // Primary key in the referenced table
//       },
//       allowNull: true
//     },

//     WhatsAppNumber: {
//       type: DataTypes.STRING(15),
//       allowNull: true
//     },
//     HospitalIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       // references: {
//       //   model: 'tblhospital',
//       //   key: 'HospitalID'
//       // }
//     },
//     HospitalGroupIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     IsActive: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: true
//     },
//     CreatedBy: {
//       type: DataTypes.STRING(100),
     
//     },
//     CreatedAt: {
//       type: DataTypes.DATE,
      
      
//     },
//     EditedBy: {
//       type: DataTypes.STRING(100),
//       allowNull: true
//     },
//     EditedAt: {
//       type: DataTypes.DATE,
//       allowNull: true
//     },
//     Reserve1 : {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     Reserve2: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     Reserve3: {
//       type: DataTypes.STRING(250),
//       allowNull: true
//     },
//     Reserve4: {
//       type: DataTypes.STRING(250),
//       allowNull: true
//     }
//   }, {
//     tableName: 'tblStaffMaster',
//     timestamps: false
//   });

//   return StaffMaster;
// };



const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StaffMaster = sequelize.define('StaffMaster', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    FirstName: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    MiddleName: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    LastName: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    Address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DOB: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    BloodGroup: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    Gender: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    EmergencyContactName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    EmergencyContactPhone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    MaritalStatus: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    Nationality: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Language: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    MobileNumber: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    Qualification: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Experience: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Specialization: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tblspecialty', // Ensure this table exists
        key: 'SpecialtyId'
      },
      allowNull: true
    },
    WhatsAppNumber: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    HospitalIDR: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    HospitalGroupIDR: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    CreatedBy: {
      type: DataTypes.STRING(100),
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    EditedBy: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    EditedAt: {
      type: DataTypes.DATE,
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
      type: DataTypes.STRING(250),
      allowNull: true
    },
    Reserve4: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    tableName: 'tblStaffMaster', // Make sure this matches your actual table name in the database
    timestamps: false
  });

  StaffMaster.associate = (models) => {
    StaffMaster.belongsTo(models.Specialty, {
      foreignKey: 'Specialization', // Foreign key in the StaffMaster table
      as: 'Specialty'                // Alias for the association
    });
  };

  return StaffMaster;
  
};
