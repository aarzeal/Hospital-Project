
const jwt = require('jsonwebtoken');
const logger = require('../logger');

const verifyAccessToken = (req, res, next) => {
  const start = Date.now();
  console.log('Request Headers:', req.headers); 

  const token = req.headers['accesstoken'] || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    const end = Date.now();
    logger.error('No AccessToken provided', { executionTime: `${end - start}ms` });

    return res.status(401).json({
      meta: {
        statusCode: 401,
        errorCode: 1051,
        executionTime: `${end - start}ms`
      },
      error: {
        message: 'Access token not provided'
      }
    });
  }

  // Remove "Bearer " from the token string if present
  const AccessToken = token.startsWith('Bearer ') ? token.slice(7) : token;

  jwt.verify(AccessToken, process.env.JWT_SECRET, (err, decoded) => {
    const end = Date.now();

    if (err) {
      logger.error('Invalid or expired token', { executionTime: `${end - start}ms`, error: err.message });

      return res.status(403).json({
        meta: {
          statusCode: 403,
          errorCode: 1052,
          executionTime: `${end - start}ms`
        },
        error: {
          message: 'Invalid or expired token'
        }
      });
    }

    // Attach the decoded token to the request object
    req.user = decoded;
    req.userId= decoded
    console.log("decoded",  req.userId)


    logger.info('Token verified successfully', { executionTime: `${end - start}ms` });
    
    next(); // Proceed to the next middleware/route handler
  });
};

module.exports = verifyAccessToken;
