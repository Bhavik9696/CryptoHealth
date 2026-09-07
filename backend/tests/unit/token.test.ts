import { describe, it, expect } from 'vitest';
import { generateShareToken, hashShareToken } from '../../src/utils/token.js';
import { verifyHash, hashString } from '../../src/utils/hash.js';

describe('Token and Hash Utilities', () => {
  it('should generate high-entropy 64-char hex share tokens', () => {
    const token1 = generateShareToken();
    const token2 = generateShareToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it('should hash share tokens with SHA-256 deterministically', () => {
    const token = 'test-token-123456';
    const hash1 = hashShareToken(token);
    const hash2 = hashString(token);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('should perform timing-safe hash comparison', () => {
    const hashA = hashString('Hello World');
    const hashB = hashString('Hello World');
    const hashC = hashString('Different Value');

    expect(verifyHash(hashA, hashB)).toBe(true);
    expect(verifyHash(hashA, hashC)).toBe(false);
  });
});
