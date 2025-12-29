const jwt = require("jsonwebtoken");

exports.decodeAccessToken = (req) => {
  try {
    const authHeader = req.headers.accesstoken;

    if (!authHeader) {
      return null;
    }

    // Remove "Bearer " from token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // Verify & decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded; // user details
  } catch (error) {
    console.error("JWT Decode Error:", error.message);
    return null;
  }
};