// const redis = require('redis');
// const { promisify } = require('util');

// // Create a Redis client
// const redisClient = redis.createClient();

// redisClient.on('connect', () => {
//   console.log('Connected to Redis');
// });

// redisClient.on('error', (err) => {
//   console.error('Redis error', err);
// });

// // Promisify the Redis client methods
// const getAsync = promisify(redisClient.get).bind(redisClient);
// const setAsync = promisify(redisClient.set).bind(redisClient);

// module.exports = { redisClient, getAsync, setAsync };


const redis = require('redis');
const { promisify } = require('util');
const logger = require('../logger'); // Adjust the path to your logger
const requestIp = require('request-ip');

async function getClientIp(req) {
  let clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || requestIp.getClientIp(req);

  // If IP is localhost or private, try fetching the public IP
  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      clientIp = ipResponse.data.ip;
    } catch (error) {

      logger.logWithMeta('Error fetching public IP', { error: error.message, erroerCode: 1085 });

      clientIp = '127.0.0.1'; // Fallback to localhost if IP fetch fails
    }
  }

  return clientIp;
}

// Create a Redis client
const redisClient = redis.createClient();

redisClient.on('connect', () => {

  // logger.info('Connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error('Redis error', { message: err.message, stack: err.stack });
});

// Promisify the Redis client methods
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

const setWithMeta = async (key, value, expiry) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
  try {
    
    await setAsync(key, value, 'EX', expiry);
    // logger.info('Redis set operation successful', { key, value, expiry });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
  
    // Log the warning
    logger.logWithMeta("warn", `Redis set operation successful`, {
      executionTime,
      hospitalId: req.hospitalId,
      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method   ,  
      userAgent: req.headers['user-agent'],    // HTTP method
    });
    return { statusCode: 200, data: { message: 'Set operation successful' } };
  } catch (error) {
    // logger.error('Error in Redis set operation', { message: error.message, stack: error.stack });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1086;

    // Log the warning
    logger.logWithMeta("warn", `Error in Redis set operation ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    throw { statusCode: 500, errorCode: 1086, data: { message: 'Failed to set value in Redis' } };
  }
};

const getWithMeta = async (key) => {
  const clientIp = await getClientIp(req);// Get the HospitalIDR from the decoded token
    const start = Date.now();
  try {
    const value = await getAsync(key);
    if (value) {
      logger.info('Redis get operation successful', { key, value });
      return { statusCode: 200, data: { key, value } };
    } else {
      // logger.warn('Redis get operation returned null', { key });
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1087;
  
      // Log the warning
      logger.logWithMeta("warn", `Redis get operation returned null ${error.message}`, {
        errorCode,
        errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
  
        ip: clientIp,
        apiName: req.originalUrl, // API name
        method: req.method    ,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      return { statusCode: 404, errorCode: 1087, data: { message: 'Key not found in Redis' } };
    }
  } catch (error) {
    // logger.error('Error in Redis get operation', { message: error.message, stack: error.stack });
    const end = Date.now();
    const executionTime = `${end - start}ms`;
    const errorCode = 1088;

    // Log the warning
    logger.logWithMeta("warn", `Error in Redis get operation ${error.message}`, {
      errorCode,
      errorMessage: error.message,
      executionTime,
      hospitalId: req.hospitalId,

      ip: clientIp,
      apiName: req.originalUrl, // API name
      method: req.method    ,
      userAgent: req.headers['user-agent'],     // HTTP method
    });
    throw { statusCode: 500, errorCode: 1088, data: { message: 'Failed to get value from Redis' } };
  }
};

module.exports = { redisClient, getAsync, setAsync, setWithMeta, getWithMeta };
