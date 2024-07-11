// // Import Sequelize and database connection
// const Sequelize = require('sequelize');
// const sequelize = require('../database/connection'); // Adjust path as per your database connection setup

// // Define the Skill model
// const Skill = sequelize.define('tblSkill', {
//   SkillId: {
//     type: Sequelize.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   SkillName: {
//     type: Sequelize.STRING(40),
//     allowNull: false
//   },
//   IsClinicalSkill: {
//     type: Sequelize.BOOLEAN,
//     allowNull: false
//   },
//   IsActive: {
//     type: Sequelize.BOOLEAN,
//     allowNull: false,
//     defaultValue: true // Assuming default is active
//   },
//   CreatedBy: {
//     type: Sequelize.STRING, // Adjust data type as per your requirements
//     allowNull: false
//   },
//   CreatedAt: {
//     type: Sequelize.DATE,
//     allowNull: false,
//     defaultValue: Sequelize.NOW
//   },
//   EditedBy: {
//     type: Sequelize.STRING, // Adjust data type as per your requirements
//     allowNull: true
//   },
//   EditedAt: {
//     type: Sequelize.DATE,
//     allowNull: true
//   },
//   HospitalIDR: {
//     type: Sequelize.INTEGER,
//     references: {
//       model: 'tblhospital', // Name of the referenced table
//       key: 'HospitalID' // Primary key in the referenced table
//     },
//     allowNull: false
//   }
// }, {
//   // Add timestamps: true if you want Sequelize to manage createdAt and updatedAt fields
//   timestamps: false, // Set to true if you want Sequelize to manage createdAt and updatedAt fields automatically
//   tableName: 'tblSkill' // Optional: Specify the table name if it differs from the model name
// });

// // Export the Skill model for use in your application
// module.exports = Skill;



// Import Sequelize and database connection
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('tblSkill', {
    SkillId: {
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
          references: {
            model: 'tblhospital', // Name of the referenced table
            key: 'HospitalID' // Primary key in the referenced table
          },
          allowNull: false
        }
      }, {
    tableName: 'tblSkill',
    timestamps: false
  });

  return User;
};
