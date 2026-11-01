/**
 * Global error handler middleware.
 * Sanitizes error messages in production to prevent data leaks.
 */
const errorHandler = (err, req, res, next) => {
  // Log full error server-side only
  console.error(`[${new Date().toISOString()}] Error:`, err.message || err);

  // Handle known MySQL error codes
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Username or email already exists' });
  }
  if (err.code === 'ER_DATA_TOO_LONG') {
    return res.status(400).json({ error: 'Input data too long' });
  }

  // Validation errors from express-validator (passed as err objects sometimes)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const statusCode = err.statusCode || 500;

  // Never expose internal error details in production
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
