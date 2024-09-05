// models/userMaster.js

// const { DataTypes } = require('sequelize');
// const HospitalGroup = require('./HospitalGroup'); // Import the HospitalGroup model
// const Hospital = require('./HospitalModel'); // Import the Hospital model

// const createUserMasterModel = (sequelize) => {
//   const UserMaster = sequelize.define('tblusers', {
//     UserID: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     UserName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     Password: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     HospitalGroupIDR: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//   }, {
//     tableName: 'tblusers',
//     timestamps: true,
//   });

//   UserMaster.belongsTo(HospitalGroup, { foreignKey: 'HospitalGroupIDR' });
//   UserMaster.belongsTo(Hospital, { foreignKey: 'HospitalID' });

//   return UserMaster;
// };

// module.exports = createUserMasterModel;
// models/user.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../database/connection'); // Import the sequelize instance

// const TestUser = sequelize.define('testuser', {
//   uniqnumber: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true,
//     unique: true,
//   },
//   username: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// module.exports = TestUser;
