/**
 * Global error handler middleware.
 * Catches all errors thrown by routes/controllers and sends a
 * standardized JSON error response.
 */
const { sendError } = require('../utils/apiResponse');
const { AppError } = require('../utils/errors');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Handle our custom AppError subclasses
  if (err instanceof AppError) {
    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors || null,
    });
  }

  // Handle Joi / validation errors
  if (err.isJoi) {
    return sendError(res, {
      statusCode: 422,
      message: 'Validation Error',
      errors: err.details.map((d) => d.message),
    });
  }

  // Handle Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, {
      statusCode: 413,
      message: 'File too large. Maximum size is 50MB.',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendError(res, {
      statusCode: 400,
      message: 'Unexpected file field.',
    });
  }

  // Default — unknown/unhandled error
  return sendError(res, {
    statusCode: 500,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error',
  });
}

module.exports = { errorHandler };
