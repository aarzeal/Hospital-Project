

// Import Sequelize and database connection
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Skill = sequelize.define('tblspecialty', {
    SpecialtyId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        SkillName: {
          type: DataTypes.STRING(40),
          allowNull: false
        },
        IsClinicalSkill: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        IsActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true // Assuming default is active
        },
        CreatedBy: {
          type: DataTypes.STRING, // Adjust data type as per your requirements
          allowNull: false
        },
        CreatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        EditedBy: {
          type: DataTypes.STRING, // Adjust data type as per your requirements
          allowNull: true
        },
        EditedAt: {
          type: DataTypes.DATE,
          allowNull: true
        },
        HospitalIDR: {
          type: DataTypes.INTEGER,
          // references: {
          //   model: 'tblhospital', // Name of the referenced table
          //   key: 'HospitalID' // Primary key in the referenced table
          // },
          allowNull: false
        }
        ,
    Reserve1 : {
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
    tableName: 'tblspecialty',
    timestamps: false
  });

  return Skill;
};





// const { DataTypes } = require('sequelize');
// const sequelize = require('../database/dynamicConnection'); // Adjust path as per your project structure

// const Skill = sequelize.define('Skill', {
//   SkillId: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   SkillName: {
//     type: DataTypes.STRING(40),
//     allowNull: false
//   },
//   IsClinicalSkill: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false
//   },
//   IsActive: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: true // Assuming default is active
//   },
//   CreatedBy: {
//     type: DataTypes.STRING, // Adjust data type as per your requirements
//     allowNull: false
//   },
//   CreatedAt: {
//     type: DataTypes.DATE,
//     allowNull: false,
//     defaultValue: DataTypes.NOW
//   },
//   EditedBy: {
//     type: DataTypes.STRING, // Adjust data type as per your requirements
//     allowNull: true
//   },
//   EditedAt: {
//     type: DataTypes.DATE,
//     allowNull: true
//   }
// }, {
//   sequelize,
//   modelName: 'Skill',
//   tableName: 'tblskill', // Ensure this matches your actual table name
//   timestamps: false // Adjust as needed (true for createdAt and updatedAt columns)
// });

// module.exports = Skill;
