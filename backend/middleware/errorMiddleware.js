/**
 * MarketSphere - Centralized Error Handling Middleware
 * Intercepts unhandled exceptions, validation errors, database conflicts,
 * and formats clean, predictable JSON error payloads.
 */

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const isDev = process.env.NODE_ENV === 'development';

  let message = err.message || 'An unexpected internal server error occurred.';

  // Specific common database/validation mapping
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with this identifier already exists.'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      message: err.message
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack })
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
