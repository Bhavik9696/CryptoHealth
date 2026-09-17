import crypto from 'crypto';

export interface KeyPairResult {
  publicKeyPem: string;
  privateKeyPem: string;
}

export class SignatureService {
  private defaultHospitalKeyPair: KeyPairResult;

  constructor() {
    this.defaultHospitalKeyPair = this.loadOrGenerateKeyPair();
  }

  /**
   * Loads Ed25519 keys from env vars for persistence across restarts.
   * Previously, new keys were generated on every server start, making all
   * prior signatures permanently unverifiable after restart.
   *
   * Set SIGNING_PRIVATE_KEY and SIGNING_PUBLIC_KEY in your .env to persist keys.
   * In production, missing keys will log an error. In development they are auto-generated
   * with a clear warning.
   */
  private loadOrGenerateKeyPair(): KeyPairResult {
    const privateKeyEnv = process.env.SIGNING_PRIVATE_KEY;
    const publicKeyEnv = process.env.SIGNING_PUBLIC_KEY;

    if (privateKeyEnv && publicKeyEnv) {
      // Restore newlines that may have been escaped for env var storage
      const privateKeyPem = privateKeyEnv.replace(/\\n/g, '\n');
      const publicKeyPem = publicKeyEnv.replace(/\\n/g, '\n');
      return { publicKeyPem, privateKeyPem };
    }

    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[SECURITY] SIGNING_PRIVATE_KEY and SIGNING_PUBLIC_KEY are required in production. ' +
        'Generate with: node -e "const c=require(\'crypto\');const k=c.generateKeyPairSync(\'ed25519\',{publicKeyEncoding:{type:\'spki\',format:\'pem\'},privateKeyEncoding:{type:\'pkcs8\',format:\'pem\'}});console.log(k.privateKey,k.publicKey)"'
      );
    }

    // Auto-generate ephemeral keys in non-production environments
    const keyPair = this.generateKeyPair();
    console.warn(
      '[SECURITY WARNING] Ed25519 signing keys auto-generated for this session. ' +
      'Reports signed now cannot be verified after a server restart. ' +
      'Set SIGNING_PRIVATE_KEY and SIGNING_PUBLIC_KEY in .env to persist keys.'
    );
    return keyPair;
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
