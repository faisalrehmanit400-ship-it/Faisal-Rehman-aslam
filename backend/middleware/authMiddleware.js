/**
 * MarketSphere - Authentication Middleware
 * Validates JWT bearer tokens from request headers and binds the authenticated user to req.user.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'marketsphere_ultra_secure_jwt_secret_token_2026_x89!';

async function authenticate(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No bearer token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user
    const user = await User.findById(decoded.id);
    if (!user || user.is_active === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or account has been deactivated.'
      });
    }

    req.user = User.formatSafe(user);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
}

/**
 * Optional authentication middleware: if token present, sets req.user; else continues
 */
async function optionalAuth(req, res, next) {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.is_active !== 0) {
        req.user = User.formatSafe(user);
      }
    }
  } catch (err) {
    // Ignore error for optional authentication
  }
  next();
}

module.exports = {
  authenticate,
  optionalAuth
};
