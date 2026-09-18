const crypto = require('crypto');

const AES_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

function decodeMasterKey(value) {
  if (!value || !/^[0-9a-f]{64}$/i.test(value)) {
    throw new Error('MASTER_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(value, 'hex');
}

function encryptBuffer(plaintext, masterKeyHex) {
  const masterKey = decodeMasterKey(masterKeyHex);
  const dataKey = crypto.randomBytes(KEY_LENGTH);
  const dataIv = crypto.randomBytes(IV_LENGTH);
  const dataCipher = crypto.createCipheriv(AES_ALGORITHM, dataKey, dataIv);
  const ciphertext = Buffer.concat([dataCipher.update(plaintext), dataCipher.final()]);
  const dataTag = dataCipher.getAuthTag();

  const wrapIv = crypto.randomBytes(IV_LENGTH);
  const wrapCipher = crypto.createCipheriv(AES_ALGORITHM, masterKey, wrapIv);
  const encryptedDek = Buffer.concat([wrapCipher.update(dataKey), wrapCipher.final()]);
  const wrapTag = wrapCipher.getAuthTag();

  return {
    ciphertext,
    metadata: {
      algorithm: 'AES-256-GCM',
      version: 2,
      iv: dataIv.toString('base64'),
      auth_tag: dataTag.toString('base64'),
      encrypted_dek: encryptedDek.toString('base64'),
      key_wrap_iv: wrapIv.toString('base64'),
      key_wrap_tag: wrapTag.toString('base64'),
    },
  };
}

function decryptBuffer(ciphertext, metadata, masterKeyHex) {
  const masterKey = decodeMasterKey(masterKeyHex);
  if (!metadata || metadata.algorithm !== 'AES-256-GCM' || metadata.version !== 2) {
    throw new Error('Unsupported encryption metadata');
  }

  const unwrap = crypto.createDecipheriv(
    AES_ALGORITHM,
    masterKey,
    Buffer.from(metadata.key_wrap_iv, 'base64')
  );
  unwrap.setAuthTag(Buffer.from(metadata.key_wrap_tag, 'base64'));
  const dataKey = Buffer.concat([
    unwrap.update(Buffer.from(metadata.encrypted_dek, 'base64')),
    unwrap.final(),
  ]);

  const decipher = crypto.createDecipheriv(
    AES_ALGORITHM,
    dataKey,
    Buffer.from(metadata.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(metadata.auth_tag, 'base64'));
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

module.exports = { encryptBuffer, decryptBuffer };