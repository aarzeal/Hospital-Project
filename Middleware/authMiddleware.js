const jwt = require('jsonwebtoken');
const logger = require('../logger'); // Adjust the path to your logger module
const requestIp = require('request-ip');


exports.verifyToken = (requiredRoles = []) => {
  const start = Date.now();
  
  return (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1201;
      
      // Log the warning
      logger.logWithMeta("warn", `No token provided'`, {
        errorCode,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        // ip: clientIp,
        // apiName: req.originalUrl, // API name
        // method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
      // logger.logWithMeta('error', 'No token provided', { errorCode});
     
      return res.status(403).json({
        meta: {
          status: 403,
          errorCode: errorCode,
        },
        data: {
          message: 'No token provided',
        },
      });
    }

    const tokenWithoutBearer = token.split(' ')[1]; // Remove 'Bearer' part if it exists

    jwt.verify(tokenWithoutBearer, process.env.SUPERCLIENTSECRET, (err, decoded) => {
      if (err) {
        const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1202;
      
      // Log the warning
      logger.logWithMeta("warn", `Token verification error'`, {
        errorCode,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        ip: clientIp,
        // apiName: req.originalUrl, // API name
        // method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });
        logger.logWithMeta('error', `Token verification error: ${err.message}`, { errorCode});
        return res.status(500).json({
          meta: {
            status: 500,
            errorCode: errorCode,
          },
          data: {
            message: 'Failed to authenticate token',
            err: err.message, // Only return the error message to the client
          },
        });
      }

      req.userId = decoded.userId;
      req.userType = decoded.userType;

      // Uncomment this section if you want to enforce role-based access control
      // if (requiredRoles.length && !requiredRoles.includes(req.userType)) {
      //   const errorCode = 920;
      //   logger.error(`Error Code: ${errorCode}, Insufficient role: ${req.userType}`);
      //   return res.status(403).json({
      //     meta: {
      //       status: 403,
      //       errorCode: errorCode,
      //     },
      //     data: {
      //       message: 'You do not have the required role to perform this action',
      //     },
      //   });
      // }

      next();
    });
  };
};

// const jwt = require('jsonwebtoken');

// exports.verifyToken = (requiredRoles = []) => {
//   return (req, res, next) => {
//     const token = req.headers['authorization'];
//     if (!token) {
//       return res.status(403).json({
//         meta: {
//           status: 403,
//           errorCode: 918
//         },
//         data: {
//           message: 'No token provided'
//         }
//       });
//     }

//     const tokenWithoutBearer = token.split(' ')[1]; // Remove 'Bearer' part if it exists

//     jwt.verify(tokenWithoutBearer, process.env.SUPERCLIENTSECRET, (err, decoded) => {
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

//       req.userId = decoded.userId;
//       req.userType = decoded.userType;

//     //   if (requiredRoles.length && !requiredRoles.includes(req.userType)) {
//     //     return res.status(403).json({
//     //       meta: {
//     //         status: 403,
//     //         errorCode: 920
//     //       },
//     //       data: {
//     //         message: 'You do not have the required role to perform this action'
//     //       }
//     //     });
//     //   }
//       next();
//     });
//   };
// };



