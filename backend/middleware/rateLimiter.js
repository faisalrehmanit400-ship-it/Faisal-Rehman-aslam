/**
 * OmniTrade Global Marketplace - Rate Limiting Middleware
 * In-memory sliding window rate limiter for security & abuse prevention
 */

const requestCounts = new Map();

/**
 * Creates a rate limiting middleware
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum allowed requests in window
 */
function rateLimiter(windowMs = 60 * 1000, maxRequests = 100) {
  // Periodically clean up old IPs
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requestCounts.entries()) {
      if (now - data.startTime > windowMs) {
        requestCounts.delete(ip);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = requestCounts.get(ip);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now };
      requestCounts.set(ip, record);
    } else {
      record.count += 1;
    }

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'TooManyRequests',
        message: 'Rate limit exceeded. Please wait a moment before sending more requests.'
      });
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    next();
  };
}

module.exports = { rateLimiter };
