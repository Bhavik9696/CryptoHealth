export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'] as const;

export const REPORT_TYPES = [
  'Blood Test',
  'X-Ray',
  'MRI',
  'CT Scan',
  'Ultrasound',
  'ECG',
  'Urine Test',
  'Biopsy',
  'Prescription',
  'Discharge Summary',
  'Other',
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const USER_ROLES = ['patient', 'doctor', 'hospital', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const REPORT_STATUS = ['VERIFIED', 'PENDING', 'INVALID', 'REVOKED'] as const;
export type ReportStatus = (typeof REPORT_STATUS)[number];

export const SHARE_STATUS = ['ACTIVE', 'EXPIRED', 'REVOKED'] as const;
export type ShareStatus = (typeof SHARE_STATUS)[number];

export const AUDIT_STATUS = ['SUCCESS', 'DENIED', 'ERROR'] as const;
export type AuditStatus = (typeof AUDIT_STATUS)[number];
