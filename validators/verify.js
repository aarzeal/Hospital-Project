// middleware/verifyToken.js

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      meta: {
        statusCode: 401,
        errorCode: 928,
      },
      error: {
        message: 'Unauthorized: No token provided',
      },
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.hospitalId = decoded.hospitalId; // Ensure this field is available in the token
    req.hospitalDatabase = decoded.hospitalDatabase;
    next();
  } catch (error) {
    return res.status(401).json({
      meta: {
        statusCode: 401,
        errorCode: 929,
      },
      error: {
        message: 'Unauthorized: Invalid token',
      },
    });
  }
};

module.exports = verifyToken;
