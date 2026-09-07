import crypto from 'crypto';

export interface KeyPairResult {
  publicKeyPem: string;
  privateKeyPem: string;
}

export class SignatureService {
  private defaultHospitalKeyPair: KeyPairResult;

  constructor() {
    this.defaultHospitalKeyPair = this.generateKeyPair();
  }

  /**
   * Generates a new Ed25519 keypair for an organization/hospital.
   */
  public generateKeyPair(): KeyPairResult {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    return {
      publicKeyPem: publicKey,
      privateKeyPem: privateKey,
    };
  }

  /**
   * Signs a report hash or buffer using an organization's Ed25519 private key.
   */
  public sign(data: Buffer | string, privateKeyPem?: string): string {
    const key = privateKeyPem || this.defaultHospitalKeyPair.privateKeyPem;
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');

    const signature = crypto.sign(null, buffer, key);
    return signature.toString('hex');
  }

  /**
   * Verifies an Ed25519 signature against data and public key.
   */
  public verify(data: Buffer | string, signatureHex: string, publicKeyPem?: string): boolean {
    const key = publicKeyPem || this.defaultHospitalKeyPair.publicKeyPem;
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');

    try {
      const signature = Buffer.from(signatureHex, 'hex');
      return crypto.verify(null, buffer, key, signature);
    } catch {
      return false;
    }
  }

  /**
   * Returns the default hospital public key PEM for verification.
   */
  public getDefaultHospitalPublicKey(): string {
    return this.defaultHospitalKeyPair.publicKeyPem;
  }
}

export const signatureService = new SignatureService();
