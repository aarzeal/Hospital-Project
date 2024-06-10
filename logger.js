// logger.js// logger.js

const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }), // Log errors to error.log file
    new winston.transports.File({ filename: 'combined.log' }) // Log all messages to combined.log file
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

module.exports = logger;


