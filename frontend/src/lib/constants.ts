/**
 * Backend API base URL.
 * All API requests go through the backend server.
 * Override with VITE_API_URL in .env if needed.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * API URL for general routes (mounted at /api on the backend).
 */
export const API_URL = `${API_BASE_URL}/api`

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
