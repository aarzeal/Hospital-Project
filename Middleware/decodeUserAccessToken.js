const jwt = require('jsonwebtoken');

exports.decodeToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const AccessToken = authHeader.split(' ')[1]; // Assuming the token is in the format "Bearer <token>"

  try {
    const decoded = jwt.verify(AccessToken, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debugging log
    req.user = decoded; // Attach the decoded token to the request object
    next();
  } catch (error) {
    console.error('Token verification failed:', error); // Debugging log
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
