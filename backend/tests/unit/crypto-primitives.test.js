const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { encryptBuffer, decryptBuffer } = require('../../src/crypto/envelopeEncryption');
const {
  generateSigningKeyPair,
  signCanonicalPayload,
  verifySignature,
} = require('../../src/crypto/signatures');
const {
  generateLinkingCode,
  generateAccessToken,
  hashToken,
} = require('../../src/crypto/tokenGenerator');

const masterKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

test('AES-256-GCM envelope encryption round-trips data', () => {
  const plaintext = Buffer.from('Confidential medical report test data');
  const encrypted = encryptBuffer(plaintext, masterKey);
  const decrypted = decryptBuffer(encrypted.ciphertext, encrypted.metadata, masterKey);

  assert.deepEqual(decrypted, plaintext);
  assert.equal(encrypted.metadata.algorithm, 'AES-256-GCM');
  assert.equal(encrypted.metadata.version, 2);
  assert.notDeepEqual(encrypted.ciphertext, plaintext);
});

test('AES-256-GCM rejects changed ciphertext', () => {
  const encrypted = encryptBuffer(Buffer.from('report payload'), masterKey);
  const changed = Buffer.from(encrypted.ciphertext);
  if (changed.length) changed[0] ^= 0xff;
  assert.throws(() => decryptBuffer(changed, encrypted.metadata, masterKey));
});

test('envelope encryption rejects invalid master keys', () => {
  assert.throws(() => encryptBuffer(Buffer.from('x'), 'not-a-key'), /64-character hex string/);
});

test('Ed25519 signatures validate the signed canonical payload', () => {
  const keys = generateSigningKeyPair();
  const payload = { reportId: 'r-1', sha256: crypto.createHash('sha256').update('document').digest('hex') };
  const signed = signCanonicalPayload(payload, keys.privateKey);

  assert.equal(verifySignature(signed.signature, signed.payloadHash, keys.publicKey), true);
  assert.equal(verifySignature(signed.signature, signed.payloadHash, generateSigningKeyPair().publicKey), false);
});

test('link codes and share tokens use expected formats and hash deterministically', () => {
  const code = generateLinkingCode();
  const token = generateAccessToken(48);

  assert.match(code, /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/);
  assert.match(token, /^[0-9a-f]{96}$/);
  assert.notEqual(token, generateAccessToken(48));
  assert.equal(hashToken(token), hashToken(token));
  assert.match(hashToken(token), /^[0-9a-f]{64}$/);
});
