const validateJSONContentType = (req, res, next) => {
  const start = Date.now();
    const contentType = req.headers['content-type'];
    if (!contentType || contentType !== 'application/json') {

      const end = Date.now();
      const executionTime = `${end - start}ms`;
      const errorCode = 1203;
      
      // Log the warning
      logger.logWithMeta("warn", `Bad request  data only json formated'`, {
        errorCode,
        // errorMessage: error.message,
        executionTime,
        hospitalId: req.hospitalId,
        // ip: clientIp,
        // apiName: req.originalUrl, // API name
        // method: req.method,
        userAgent: req.headers['user-agent'],     // HTTP method
      });

      return res.status(400).json({

        meta: {
          statusCode: 400,
          errorCode: 1203
        },
        error: {
          message: 'Bad request'
        }
      });
    }
    next();
  };
  
  module.exports = validateJSONContentType;