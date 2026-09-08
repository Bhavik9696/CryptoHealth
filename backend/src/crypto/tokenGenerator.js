/**
 * Secure token/code generation utilities.
 * Uses Node.js built-in crypto for cryptographically random values.
 */
const crypto = require('crypto');

/**
 * Generate a cryptographically random alphanumeric code of the given length.
 * Used for patient linking codes — short, human-readable, one-time use.
 * @param {number} length - Length of the code
 * @returns {string} Uppercase alphanumeric code (e.g., "A3K9M2X7")
 */
function generateLinkingCode(length = 8) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Removed ambiguous: 0/O, 1/I/L
  const bytes = crypto.randomBytes(length);
  let code = '';

  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }

  return code;
}

/**
 * Generate a cryptographically random hex token.
 * Used for access tokens — long, high-entropy, machine-readable.
 * @param {number} length - Number of random bytes (output will be 2x hex chars)
 * @returns {string} Hex-encoded token
 */
function generateAccessToken(length = 48) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token using SHA-256 for storage.
 * Raw tokens should never be stored directly — only their hashes.
 * @param {string} token - The raw token
 * @returns {string} SHA-256 hex hash
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateLinkingCode,
  generateAccessToken,
  hashToken,
};
