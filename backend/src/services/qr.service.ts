import QRCode from 'qrcode';

export class QrService {
  /**
   * Generates a base64 Data URL (image/png) for a QR code string.
   */
  public async generateDataUrl(text: string): Promise<string> {
    return QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: '#0f172a', // Slate-900
        light: '#ffffff',
      },
    });
  }

  /**
   * Generates a PNG Buffer for a QR code.
   */
  public async generateBuffer(text: string): Promise<Buffer> {
    return QRCode.toBuffer(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
    });
  }
}

export const qrService = new QrService();
