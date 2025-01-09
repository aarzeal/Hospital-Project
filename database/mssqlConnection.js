// const sql = require('mssql');

// const config = {
//     user: 'cs',
//     password: 'cs@123',
//     server: 'DESKTOP-IBK7FHB\\SQL2K8',
//     database: 'umclive',
//     options: {
//         encrypt: false, // Use this if you're using Azure SQL Database
//         enableArithAbort: true
//     }
// };

// // Create a pool connection to the database
// const poolPromise = new sql.ConnectionPool(config)
//     .connect()
//     .then(pool => {
//         console.log('Connected to the database');
//         return pool;
//     })
//     .catch(err => {
//         console.error('Database connection failed:', err);
//         process.exit(1); // Exit the application on database connection failure
//     });

// module.exports = poolPromise;






const { Sequelize } = require('sequelize');

// Database connection configuration
const sequelize = new Sequelize('umclive', 'cs', 'cs@123', {
    host: 'DESKTOP-IBK7FHB\\SQL2K8',
    // host: '192.168.1.2\\SQL2K8',
    port:"49841",
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: false, // Disables encryption
            enableArithAbort: true,
        },
    },
});

module.exports = sequelize;
