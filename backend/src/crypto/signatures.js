/**
 * Digital Signature module using Ed25519.
 * Uses Node.js built-in crypto for Ed25519 key generation, signing, and verification.
 *
 * - generateSigningKeyPair(): creates a new Ed25519 keypair
 * - signPayload(payload, privateKey): signs a canonical payload
 * - verifySignature(signature, payloadHash, publicKey): verifies a signature
 */
const crypto = require('crypto');

/**
 * Generate a new Ed25519 signing keypair.
 * @returns {{ publicKey: string, privateKey: string }} Base64-encoded keys (DER format)
 */
function generateSigningKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });

  return {
    publicKey: publicKey.toString('base64'),
    privateKey: privateKey.toString('base64'),
  };
}

/**
 * Create a canonical hash of the payload to be signed.
 * This ensures consistent signing regardless of JSON key ordering.
 * @param {object} payload - The data object to hash
 * @returns {Buffer} SHA-256 hash
 */
function hashPayload(payload) {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash('sha256').update(canonical).digest();
}

/**
 * Sign a payload with the hospital's Ed25519 private key.
 * @param {object} payload - The data to sign
 * @param {string} privateKeyBase64 - Base64-encoded DER private key
 * @returns {{ signature: string, payloadHash: string }}
 */
function signPayload(payload, privateKeyBase64) {
  const privateKeyDer = Buffer.from(privateKeyBase64, 'base64');

  // Create a KeyObject from the DER-encoded private key
  const privateKeyObject = crypto.createPrivateKey({
    key: privateKeyDer,
    format: 'der',
    type: 'pkcs8',
  });

  const messageHash = hashPayload(payload);

  // Ed25519 uses null algorithm (signs the message directly)
  const signature = crypto.sign(null, messageHash, privateKeyObject);

  return {
    signature: signature.toString('base64'),
    payloadHash: messageHash.toString('base64'),
  };
}

/**
 * Verify an Ed25519 signature against a payload hash and public key.
 * @param {string} signatureBase64 - Base64-encoded signature
 * @param {string} payloadHashBase64 - Base64-encoded SHA-256 hash of the signed payload
 * @param {string} publicKeyBase64 - Base64-encoded DER public key
 * @returns {boolean} true if valid
 */
function verifySignature(signatureBase64, payloadHashBase64, publicKeyBase64) {
  try {
    const signature = Buffer.from(signatureBase64, 'base64');
    const messageHash = Buffer.from(payloadHashBase64, 'base64');
    const publicKeyDer = Buffer.from(publicKeyBase64, 'base64');

    // Create a KeyObject from the DER-encoded public key
    const publicKeyObject = crypto.createPublicKey({
      key: publicKeyDer,
      format: 'der',
      type: 'spki',
    });

    // Ed25519 uses null algorithm
    return crypto.verify(null, messageHash, publicKeyObject, signature);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

module.exports = {
  generateSigningKeyPair,
  hashPayload,
  signPayload,
  verifySignature,
};
