import crypto from 'crypto';
import { env } from '../config/env.js';
import { EncryptionMetadata } from '../types/report.types.js';

export interface EncryptedPayload {
  ciphertext: Buffer;
  metadata: EncryptionMetadata;
}

export class EncryptionService {
  private key: Buffer;

  constructor(hexKey: string = env.ENCRYPTION_KEY) {
    this.key = Buffer.from(hexKey, 'hex');
    if (this.key.length !== 32) {
      throw new Error('Encryption key must be exactly 32 bytes (64 hex characters) for AES-256-GCM');
    }
  }

  /**
   * Encrypts plaintext buffer using AES-256-GCM.
   * Generates a unique 12-byte IV for every encryption.
   */
  public encrypt(plaintext: Buffer): EncryptedPayload {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);

    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      ciphertext,
      metadata: {
        algorithm: 'AES-256-GCM',
        iv: iv.toString('hex'),
        auth_tag: authTag.toString('hex'),
        version: 1,
      },
    };
  }

  /**
   * Decrypts ciphertext buffer using AES-256-GCM and verifies authenticity.
   * Throws if tag or ciphertext has been modified/tampered.
   */
  public decrypt(ciphertext: Buffer, metadata: EncryptionMetadata): Buffer {
    if (metadata.algorithm !== 'AES-256-GCM') {
      throw new Error(`Unsupported encryption algorithm: ${metadata.algorithm}`);
    }

    const iv = Buffer.from(metadata.iv, 'hex');
    const authTag = Buffer.from(metadata.auth_tag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);

    try {
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown decryption error';
      throw new Error(`Decryption failed: Authenticated decryption error (tampered data or invalid key): ${message}`);
    }
  }

  /**
   * Packs IV + AuthTag + Ciphertext into a single contiguous binary buffer.
   * Layout: [12 bytes IV | 16 bytes AuthTag | Ciphertext]
   */
  public pack(payload: EncryptedPayload): Buffer {
    const iv = Buffer.from(payload.metadata.iv, 'hex');
    const authTag = Buffer.from(payload.metadata.auth_tag, 'hex');
    return Buffer.concat([iv, authTag, payload.ciphertext]);
  }

  /**
   * Unpacks binary buffer packed with pack().
   */
  public unpack(packed: Buffer): EncryptedPayload {
    if (packed.length < 28) {
      throw new Error('Invalid packed encrypted data: buffer too short');
    }
    const iv = packed.subarray(0, 12);
    const authTag = packed.subarray(12, 28);
    const ciphertext = packed.subarray(28);

    return {
      ciphertext,
      metadata: {
        algorithm: 'AES-256-GCM',
        iv: iv.toString('hex'),
        auth_tag: authTag.toString('hex'),
        version: 1,
      },
    };
  }
}

export const encryptionService = new EncryptionService();
