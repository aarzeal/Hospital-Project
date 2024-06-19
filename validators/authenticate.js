const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      meta: {
        statusCode: 401,
        errorCode: 929
      },
      error: {
        message: 'No token provided'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.hospitalId = decoded.hospitalId;
    req.hospitalDatabase = decoded.hospitalDatabase; // Add database details to the request object
    next();
  } catch (error) {
    return res.status(401).json({
      meta: {
        statusCode: 401,
        errorCode: 930
      },
      error: {
        message: 'Unauthorized'
      }
    });
  }
};

module.exports = authenticate;