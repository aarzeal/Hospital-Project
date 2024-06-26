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

//     jwt.verify(token, process.env.SUPERCLIENTSECRET, (err, decoded) => {
//       if (err) {
//         return res.status(500).json({
//           meta: {
//             status: 500,
//             errorCode: 919
//           },
//           data: {
//             message: 'Failed to authenticate token',err
            
//           }
//         });
//       }

//       req.userId = decoded.userId;
//       req.userType = decoded.userType;

//       if (requiredRoles.length && !requiredRoles.includes(req.userType)) {
//         return res.status(403).json({
//           meta: {
//             status: 403,
//             errorCode: 920
//           },
//           data: {
            
//             message: 'You do not have the required role to perform this action'
//           }
//         });
//       }
//       next();
//     });
//   };
// };

const jwt = require('jsonwebtoken');

exports.verifyToken = (requiredRoles = []) => {
  return (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(403).json({
        meta: {
          status: 403,
          errorCode: 918
        },
        data: {
          message: 'No token provided'
        }
      });
    }

    const tokenWithoutBearer = token.split(' ')[1]; // Remove 'Bearer' part if it exists

    jwt.verify(tokenWithoutBearer, process.env.SUPERCLIENTSECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err); // Log the error for debugging
        return res.status(500).json({
          meta: {
            status: 500,
            errorCode: 919
          },
          data: {
            message: 'Failed to authenticate token',
            err: err.message // Only return the error message to the client
          }
        });
      }

      req.userId = decoded.userId;
      req.userType = decoded.userType;

    //   if (requiredRoles.length && !requiredRoles.includes(req.userType)) {
    //     return res.status(403).json({
    //       meta: {
    //         status: 403,
    //         errorCode: 920
    //       },
    //       data: {
    //         message: 'You do not have the required role to perform this action'
    //       }
    //     });
    //   }
      next();
    });
  };
};



