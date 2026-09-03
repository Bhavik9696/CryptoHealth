/**
 * Authentication middleware.
 * Verifies the Supabase JWT from the Authorization header
 * and attaches the user to req.user.
 */
const { supabase } = require('../config/supabase');
const { supabaseAdmin } = require('../config/supabase');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Middleware that requires a valid Supabase JWT.
 * Extracts token from "Bearer <token>" header,
 * verifies it with Supabase, and attaches user + profile to req.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Fetch user profile with role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new UnauthorizedError('User profile not found');
    }

    // Attach to request
    req.user = {
      id: user.id,
      email: user.email,
      ...profile,
    };
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    next(new UnauthorizedError('Authentication failed'));
  }
}

/**
 * Optional authentication — does not fail if no token is present,
 * but attaches user if a valid token exists.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return next();

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      req.user = { id: user.id, email: user.email, ...profile };
      req.token = token;
    }

    next();
  } catch {
    // Silently continue — optional auth should not block
    next();
  }
}

module.exports = { authenticate, optionalAuth };
