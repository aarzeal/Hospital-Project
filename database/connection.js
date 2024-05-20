

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('hospital_master', 'userdb', 'root1234', {
  host: '192.168.1.21',
  dialect: 'mysql'
});

module.exports = sequelize;
