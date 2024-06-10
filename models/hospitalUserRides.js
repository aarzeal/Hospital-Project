// const { DataTypes, Model } = require('sequelize');
// const createDynamicConnection = require('../database/dynamicConnection');

// class UserRides extends Model {}

// const createUserRidesModel = (sequelize) => {
//   UserRides.init({
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     submodule_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'Submodule', // This should be the name of the Model, not the table
//         key: 'id'
//       }
//     },
//     module_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: 'Module', // This should be the name of the Model, not the table
//         key: 'id'
//       }
//     },
//     // Other attributes specific to the UserRides table
//   }, {
//     sequelize,
//     modelName: 'UserRides',
//     tableName: 'userrides',
//     timestamps: false
//   });

//   return UserRides;
// };

// module.exports = createUserRidesModel;
// userRidesModel.js

// const { DataTypes, Model } = require('sequelize');
// const createDynamicConnection = require('../database/dynamicConnection');

// class UserRides extends Model {}

// const { sequelize } = createDynamicConnection();

// const createUserRidesModel = (sequelize) => {
//   UserRides.init({
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     submodule_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     },
//     module_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     },
//     // Other attributes specific to the UserRides table
//   }, {
//     sequelize,
//     modelName: 'UserRides',
//     tableName: 'userrides',
//     timestamps: false
//   });

//   // Define associations
//   UserRides.belongsTo(sequelize.models.Module, { foreignKey: 'module_id' });
//   UserRides.belongsTo(sequelize.models.Submodule, { foreignKey: 'submodule_id' });

//   return UserRides;
// };

// module.exports = createUserRidesModel;



const { DataTypes, Model } = require('sequelize');
const createDynamicConnection = require('../database/dynamicConnection');
const Module = require('./HospitalModules'); // Import the Module model

const { sequelize } = createDynamicConnection();

class UserRides extends Model {}

UserRides.init({


  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },



  submodule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // references: {
    //   model: 'Submodule', // Table name of the Module model
    //   key: 'submodule_id'
    // }
    
    
  },

  module_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Modules', // Table name of the Module model
      key: 'module_id'
    }
  },
  // link: {
  //   type: DataTypes.STRING,
  //   allowNull: false
  // }
}, {
  sequelize,
  modelName: 'UserRides',
  tableName: 'userrides', // Set the table name explicitly
  timestamps: false // Disable timestamps (createdAt, updatedAt)
});

// Automatically create the table if it doesn't exist
UserRides.sync({ alter: true });



module.exports = UserRides;

