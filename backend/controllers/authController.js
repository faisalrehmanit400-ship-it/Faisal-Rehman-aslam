/**
 * MarketSphere - Authentication & User Profile Controller
 * Implements registration, login, JWT token issuance, password updates, and profile management.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'marketsphere_ultra_secure_jwt_secret_token_2026_x89!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Register a new customer or seller
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role = 'customer', city, country, phone, street_address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Disallow arbitrary self-assigning of admin role
    const assignedRole = role === 'admin' ? 'customer' : role;

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      city,
      country,
      phone,
      street_address
    });

    const token = generateToken(user);
    const safeUser = User.formatSafe(user);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Log in existing user
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Email or password does not match.'
      });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Email or password does not match.'
      });
    }

    const token = generateToken(user);
    const safeUser = User.formatSafe(user);

    res.json({
      success: true,
      message: 'Authentication successful.',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Log out user
 * POST /api/auth/logout
 */
async function logout(req, res) {
  res.json({
    success: true,
    message: 'User logged out successfully. Please clear the client-side authentication token.'
  });
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
async function getMe(req, res) {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
}

/**
 * Update authenticated user profile
 * PUT /api/auth/profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, phone, street_address, city, country, postal_code, avatar } = req.body;
    const updated = await User.updateProfile(req.user.id, {
      name,
      phone,
      street_address,
      city,
      country,
      postal_code,
      avatar
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: User.formatSafe(updated)
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Change authenticated user password
 * PUT /api/auth/change-password
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const userWithPassword = await User.findById(req.user.id);
    const isMatch = await User.comparePassword(currentPassword, userWithPassword.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password provided is incorrect.'
      });
    }

    await User.changePassword(req.user.id, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword
};
