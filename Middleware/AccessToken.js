const jwt = require('jsonwebtoken');
require('dotenv').config();

const extractUserId = (req, res, next) => {
  const token = req.header('AccessToken');
  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace 'your_jwt_secret' with your actual secret
    req.userId = decoded.userId; // Assuming `userId` is stored in the token payload
    console.log("req.userId",req.userId)
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = extractUserId;
