/**
 * OmniTrade Global Marketplace - Centralized Error Handler Middleware
 */

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(`[OmniTrade API Error ${statusCode}] ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred.',
    ...(isProduction ? {} : { stack: err.stack })
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `API route ${req.method} ${req.originalUrl} not found.`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
