

// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('hospital_master', 'userdb', 'root1234', {
//   host: '192.168.1.21',
//   dialect: 'mysql'
// });

// module.exports = sequelize;

// Load environment variables from .env file

require('dotenv').config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
  }
);

module.exports = sequelize;
