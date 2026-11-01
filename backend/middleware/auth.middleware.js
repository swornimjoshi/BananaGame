const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests via httpOnly cookie JWT.
 * Never sends the token in the response body — always via Set-Cookie.
 */
const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Client interceptor will call /api/auth/refresh and retry
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Optional authentication: populates req.user if a valid token exists,
 * but allows guest requests through if not.
 */
const optionalAuth = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch {
    // Silently continue for guests with expired or invalid tokens
  }
  next();
};

module.exports = { authenticate, optionalAuth };
