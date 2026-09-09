import crypto from 'crypto';

/**
 * Calculates SHA-256 hex digest of a buffer.
 */
export function hashBuffer(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Calculates SHA-256 hex digest of a string.
 */
export function hashString(str: string): string {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

/**
 * Constant-time comparison between two hashes to protect against timing attacks.
 */
export function verifyHash(hashA: string, hashB: string): boolean {
  try {
    const bufA = Buffer.from(hashA, 'hex');
    const bufB = Buffer.from(hashB, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
