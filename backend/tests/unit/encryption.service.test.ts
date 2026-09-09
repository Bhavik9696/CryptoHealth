import { describe, it, expect } from 'vitest';
import { EncryptionService } from '../../src/services/encryption.service.js';

describe('EncryptionService (AES-256-GCM)', () => {
  const testKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const service = new EncryptionService(testKey);

  it('should encrypt and decrypt a plaintext buffer successfully', () => {
    const originalText = 'Confidential Patient Diagnostic Report: Brain MRI scan clear.';
    const plaintext = Buffer.from(originalText, 'utf8');

    const encrypted = service.encrypt(plaintext);

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.metadata.algorithm).toBe('AES-256-GCM');
    expect(encrypted.metadata.iv).toHaveLength(24); // 12 bytes = 24 hex chars
    expect(encrypted.metadata.auth_tag).toHaveLength(32); // 16 bytes = 32 hex chars

    const decrypted = service.decrypt(encrypted.ciphertext, encrypted.metadata);
    expect(decrypted.toString('utf8')).toBe(originalText);
  });

  it('should reject tampered ciphertext with an authenticated decryption error', () => {
    const plaintext = Buffer.from('Sensitive Medical Investigation Data', 'utf8');
    const encrypted = service.encrypt(plaintext);

    // Tamper with the ciphertext by flipping a bit
    const tamperedCiphertext = Buffer.from(encrypted.ciphertext);
    tamperedCiphertext[0] ^= 0xff;

    expect(() => {
      service.decrypt(tamperedCiphertext, encrypted.metadata);
    }).toThrow(/Authenticated decryption error/);
  });

  it('should reject tampered auth_tag with an authenticated decryption error', () => {
    const plaintext = Buffer.from('Sensitive Medical Data', 'utf8');
    const encrypted = service.encrypt(plaintext);

    // Tamper with auth tag
    const tamperedMetadata = {
      ...encrypted.metadata,
      auth_tag: '00000000000000000000000000000000',
    };

    expect(() => {
      service.decrypt(encrypted.ciphertext, tamperedMetadata);
    }).toThrow(/Authenticated decryption error/);
  });

  it('should correctly pack and unpack encrypted payload', () => {
    const plaintext = Buffer.from('Radiology Chest X-Ray Data', 'utf8');
    const encrypted = service.encrypt(plaintext);

    const packed = service.pack(encrypted);
    expect(packed.length).toBe(12 + 16 + encrypted.ciphertext.length);

    const unpacked = service.unpack(packed);
    expect(unpacked.metadata.iv).toBe(encrypted.metadata.iv);
    expect(unpacked.metadata.auth_tag).toBe(encrypted.metadata.auth_tag);

    const decrypted = service.decrypt(unpacked.ciphertext, unpacked.metadata);
    expect(decrypted.toString('utf8')).toBe('Radiology Chest X-Ray Data');
  });
});
