const errorMiddleware = (err, req, res, next) => {

  console.error(err.stack);

  // Auth0 token errors
  if (err.status === 401) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized — invalid or missing token',
    });
  }

  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden — insufficient permissions',
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

module.exports = errorMiddleware;