/**
 * MarketSphere - Admin Authorization Middleware
 * Verifies that the authenticated user possesses administrative role permissions.
 */

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required prior to administrative access.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Access restricted exclusively to platform administrators.'
    });
  }

  next();
}

module.exports = {
  requireAdmin
};
