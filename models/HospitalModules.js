// const { DataTypes } = require('sequelize');
// const createDynamicConnection = require('../database/dynamicConnection');

// const { sequelize, testConnection } = createDynamicConnection('umc9'); // Replace 'your_database_name' with the actual name of your database

// // Optionally, test the connection (uncomment the next line if you want to test the connection when this file is loaded)
// // testConnection();

// const Module = sequelize.define('Module', {
//   module_id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   module_name: {
//     type: DataTypes.STRING,
//     allowNull: false
//   }
// }, {
//   tableName: 'modules', // Set the table name explicitly
//   timestamps: false // Disable timestamps (createdAt, updatedAt)
// });

// // Synchronize the model with the database
// sequelize.sync()
//   .then(() => {
//     console.log('Modules table has been synchronized.');
//   })
//   .catch((error) => {
//     console.error('Error synchronizing the Modules table:', error);
//   });

// module.exports = Module;
const { Sequelize, DataTypes } = require('sequelize');
const Submodule = require('./hospitalsubmodule'); // Adjust the path as per your file structure

const createDynamicConnection = require('../database/dynamicConnection'); // Assuming createDynamicConnection is defined in a separate file

// Create a dynamic connection
const { sequelize, testConnection } = createDynamicConnection();

// Define the Module model using the createModuleModel function
const createModuleModel = (sequelize) => {
    class Module extends Sequelize.Model {}

    Module.init({
        module_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        module_name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Module',
        tableName: 'modules', // Set the table name explicitly
        timestamps: false // Disable timestamps (createdAt, updatedAt)
    });

    return Module;
};

// Create the Module model
const Module = createModuleModel(sequelize);
// Module.hasMany(Submodule, { foreignKey: 'module_id' });


// Export the Module model
module.exports = Module;


module.exports = createModuleModel;
