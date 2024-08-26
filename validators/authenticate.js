// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const authenticate = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({
//       meta: {
//         statusCode: 401,
//         errorCode: 929
//       },
//       error: {
//         message: 'No token provided'
//       }
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.hospitalName = decoded.hospitalName;
//     req.hospitalId = decoded.hospitalId;
//     req.hospitalGroupIDR = decoded.hospitalGroupIDR;
//     req.hospitalDatabase = decoded.hospitalDatabase; // Add database details to the request object
//     // req.hospitalGroupIDR = decoded.HospitalGroupIDR;// Corrected typo
//     // req.hospitalName = decoded.hospitalName;
//     console.log("Decoded Token in Middleware:", decoded);
//     console.log("req.hospitalName:", req.hospitalName);
//     // console.log(req.hospitalName);
//     // console.log(req.hospitalDatabase);
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       meta: {
//         statusCode: 401,
//         errorCode: 930
//       },
//       error: {
//         message: 'Unauthorized'
//       }
//     });
//   }
// };

// module.exports = authenticate;
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.query.token || req.headers.authorization?.split(' ')[1];
  
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
    req.hospitalName = decoded.hospitalName;
    req.hospitalId = decoded.hospitalId;
    req.hospitalDatabase = decoded.hospitalDatabase;
    next();
  } catch (error) {
    return res.status(401).json({
      meta: {
        statusCode: 401,
        errorCode: 930
      },
      error: {
        message: 'Unauthorized: ' + error.message
      }
    });
  }
};

module.exports = authenticate;

