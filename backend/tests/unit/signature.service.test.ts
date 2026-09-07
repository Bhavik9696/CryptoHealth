import { describe, it, expect } from 'vitest';
import { SignatureService } from '../../src/services/signature.service.js';
import { hashString } from '../../src/utils/hash.js';

describe('SignatureService (Ed25519)', () => {
  const service = new SignatureService();

  it('should sign data and verify with the matching public key', () => {
    const fileHash = hashString('Sample Report Content');
    const signature = service.sign(fileHash);

    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(64);

    const isValid = service.verify(fileHash, signature);
    expect(isValid).toBe(true);
  });

  it('should reject signature if the signed data has been modified', () => {
    const originalHash = hashString('Report Original');
    const tamperedHash = hashString('Report Tampered');

    const signature = service.sign(originalHash);

    const isValid = service.verify(tamperedHash, signature);
    expect(isValid).toBe(false);
  });

  it('should support generating custom keypairs for individual hospitals', () => {
    const hospitalKeyPair = service.generateKeyPair();
    expect(hospitalKeyPair.publicKeyPem).toContain('BEGIN PUBLIC KEY');
    expect(hospitalKeyPair.privateKeyPem).toContain('BEGIN PRIVATE KEY');

    const digest = hashString('Hospital Specific Report');
    const signature = service.sign(digest, hospitalKeyPair.privateKeyPem);

    const isValid = service.verify(digest, signature, hospitalKeyPair.publicKeyPem);
    expect(isValid).toBe(true);

    // Should fail with another key
    const anotherKeyPair = service.generateKeyPair();
    const isInvalidKey = service.verify(digest, signature, anotherKeyPair.publicKeyPem);
    expect(isInvalidKey).toBe(false);
  });
});
