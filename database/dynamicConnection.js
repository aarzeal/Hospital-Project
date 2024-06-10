

const { Sequelize } = require('sequelize');
require('dotenv').config();


const createDynamicConnection = (HospitalDatabase) => {
//     if (!HospitalDatabase) {
//         throw new Error('Database name not provided...............');
//       }
    
    const sequelize = new Sequelize(
        "umc9",
        // HospitalDatabase,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: process.env.DB_DIALECT
        }
    );

    const testConnection = async () => {
        try {
            await sequelize.authenticate();
            console.log(databaseName);
            console.log('Connection to the database has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    };

    // return sequelize;
    return { sequelize, testConnection };
     
};

module.exports = createDynamicConnection;

