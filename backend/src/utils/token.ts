import crypto from 'crypto';
import { hashString } from './hash.js';

/**
 * Generates a cryptographically secure, unpredictable 64-character hex token (32 bytes).
 */
export function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes raw token with SHA-256 for safe database storage.
 */
export function hashShareToken(token: string): string {
  return hashString(token);
}
