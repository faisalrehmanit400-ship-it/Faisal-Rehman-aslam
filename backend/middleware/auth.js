/**
 * OmniTrade Global Marketplace - Authentication & Role Authorization Middleware
 */

const { verifyToken } = require('../config/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'AuthenticationRequired',
      message: 'Authorization token is missing or malformed.'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'InvalidToken',
      message: 'Token is invalid or has expired.'
    });
  }

  req.user = decoded;
  next();
}

/**
 * Role-Based Access Control (RBAC)
 * @param  {...string} roles Allowed roles ('customer', 'seller', 'admin')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Requires one of [${roles.join(', ')}] roles.`
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};
