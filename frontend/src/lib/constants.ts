export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

export const MAX_FILE_SIZE_MB = 20
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp']

export const QUERY_KEYS = {
  ME: ['me'],
  PROFILE: ['profile'],
  PATIENTS: ['patients'],
  PATIENT: (id: string) => ['patients', id],
  PATIENT_REPORTS: (id: string) => ['patients', id, 'reports'],
  REPORTS: ['reports'],
  REPORT: (id: string) => ['reports', id],
  SHARES: ['shares'],
  SHARE: (id: string) => ['shares', id],
  AUDIT_LOGS: ['audit-logs'],
  VERIFICATION: (id: string) => ['verification', id],
} as const
