/**
 * Request validation middleware using Joi.
 * Validates req.body, req.query, or req.params against a Joi schema.
 */
const { ValidationError } = require('../utils/errors');

/**
 * Returns middleware that validates the request body against the given Joi schema.
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate against
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), controller.register);
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return next(new ValidationError('Validation failed', messages));
    }

    // Replace body with validated and sanitized data
    req.body = value;
    next();
  };
}

/**
 * Validates req.query against the given schema.
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return next(new ValidationError('Query validation failed', messages));
    }

    req.query = value;
    next();
  };
}

/**
 * Validates req.params against the given schema.
 */
function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return next(new ValidationError('Parameter validation failed', messages));
    }

    req.params = value;
    next();
  };
}

module.exports = { validate, validateQuery, validateParams };
