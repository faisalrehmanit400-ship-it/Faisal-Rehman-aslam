/**
 * OmniTrade Global Marketplace - Input Validation & Sanitization Middleware
 */

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long.');
  }

  if (!email || !validateEmail(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }

  if (role && !['customer', 'seller', 'admin'].includes(role)) {
    errors.push('Invalid account role specified.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      errors
    });
  }

  req.body.name = sanitizeString(name);
  req.body.email = email.trim().toLowerCase();
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Email and password are required.'
    });
  }
  next();
}

function validateProduct(req, res, next) {
  const { title, price, category_id, stock_quantity } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Product title must be at least 3 characters.');
  }

  if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    errors.push('Price must be a valid positive number.');
  }

  if (!category_id) {
    errors.push('Product category is required.');
  }

  if (stock_quantity !== undefined && (isNaN(parseInt(stock_quantity, 10)) || parseInt(stock_quantity, 10) < 0)) {
    errors.push('Stock quantity must be a non-negative integer.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      errors
    });
  }

  next();
}

function validateCheckout(req, res, next) {
  const { items, shipping_address, payment_method } = req.body;
  const errors = [];

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item.');
  }

  if (!shipping_address || !shipping_address.street_address || !shipping_address.city || !shipping_address.country) {
    errors.push('Complete shipping address (street, city, country) is required.');
  }

  if (!payment_method) {
    errors.push('Payment method must be selected.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      errors
    });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateCheckout,
  sanitizeString
};
