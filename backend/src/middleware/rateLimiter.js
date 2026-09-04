/**
 * Rate limiting middleware to prevent API abuse.
 */
const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

/**
 * Stricter rate limiter for auth endpoints — 20 requests per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
});

/**
 * Strict limiter for sensitive operations — 10 requests per 15 minutes.
 */
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded for sensitive operation.',
  },
});

module.exports = { generalLimiter, authLimiter, sensitiveLimiter };
