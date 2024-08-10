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

// Create a Redis client
const redisClient = redis.createClient();

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error('Redis error', { message: err.message, stack: err.stack });
});

// Promisify the Redis client methods
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

const setWithMeta = async (key, value, expiry) => {
  try {
    await setAsync(key, value, 'EX', expiry);
    logger.info('Redis set operation successful', { key, value, expiry });
    return { statusCode: 200, data: { message: 'Set operation successful' } };
  } catch (error) {
    logger.error('Error in Redis set operation', { message: error.message, stack: error.stack });
    throw { statusCode: 500, errorCode: 1074, data: { message: 'Failed to set value in Redis' } };
  }
};

const getWithMeta = async (key) => {
  try {
    const value = await getAsync(key);
    if (value) {
      logger.info('Redis get operation successful', { key, value });
      return { statusCode: 200, data: { key, value } };
    } else {
      logger.warn('Redis get operation returned null', { key });
      return { statusCode: 404, errorCode: 1075, data: { message: 'Key not found in Redis' } };
    }
  } catch (error) {
    logger.error('Error in Redis get operation', { message: error.message, stack: error.stack });
    throw { statusCode: 500, errorCode: 1076, data: { message: 'Failed to get value from Redis' } };
  }
};

module.exports = { redisClient, getAsync, setAsync, setWithMeta, getWithMeta };
