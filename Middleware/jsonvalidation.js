const validateJSONContentType = (req, res, next) => {
    const contentType = req.headers['content-type'];
    if (!contentType || contentType !== 'application/json') {
      return res.status(400).json({
        meta: {
          statusCode: 400,
          errorCode: 4001
        },
        error: {
          message: 'Bad request'
        }
      });
    }
    next();
  };
  
  module.exports = validateJSONContentType;