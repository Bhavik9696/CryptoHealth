/**
 * Role-Based Access Control middleware.
 * Restricts routes to specific user roles.
 */
const { ForbiddenError } = require('../utils/errors');

/**
 * Returns middleware that allows only the specified roles.
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.get('/admin-only', authenticate, authorize('admin'), handler);
 *   router.get('/multi-role', authenticate, authorize('patient', 'doctor'), handler);
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('No user context found'));
    }

    if (!req.user.role) {
      return next(new ForbiddenError('User has no assigned role'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
}

module.exports = { authorize };
