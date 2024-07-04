// const jwt = require('jsonwebtoken');

// exports.verifyToken = () => {
//   return (req, res, next) => {
//     const sessionToken = req.headers['authorization'];
//     const accessToken = req.headers['accesstoken'];

//     let token, secretKey;

//     if (sessionToken) {
//       token = sessionToken.split(' ')[1]; // Extract session token without 'Bearer'
//       secretKey =process.env.JWT_SECRET; // Session token secret key
//     } else if (accessToken) {
//       token = accessToken.split(' ')[1]; // Extract access token without 'Bearer'
//       secretKey = process.env.ANOTHER_SECRET_KEY; // Access token secret key
//     }

//     // If neither token is provided
//     if (!token) {
//       console.warn('No token provided in headers');
//       return next(); // Proceed to the next middleware or route handler
//     }

//     // Verify the token using the appropriate secret key
//     jwt.verify(token, secretKey, (err, decoded) => {
//       if (err) {
//         console.error('Token verification error:', err); // Log the error for debugging
//         return res.status(500).json({
//           meta: {
//             status: 500,
//             errorCode: 919
//           },
//           data: {
//             message: 'Failed to authenticate token',
//             err: err.message // Only return the error message to the client
//           }
//         });
//       }

//       // Optional: Check and assign hospitalGroupId or hospitalId if present in decoded token
//       // if (sessionToken && decoded.hospitalGroupId) {
//       //   req.hospitalGroupId = decoded.hospitalGroupId;
//       // } else if (accessToken && decoded.hospitalId) {
//       //   req.hospitalId = decoded.hospitalId;
//       // }

//       // Assign user details from decoded token
//       req.HospitalID = decoded.HospitalID;
//       // req.userType = decoded.userType;
      
//       next();
//     });
//   };
// };










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
