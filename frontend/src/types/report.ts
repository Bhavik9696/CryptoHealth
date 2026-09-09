export type ReportStatus = 'VERIFIED' | 'PENDING' | 'INVALID' | 'REVOKED';

export interface MedicalReport {
  id: string;
  patient_id: string;
  patient_name?: string;
  hospital_id: string;
  hospital_name?: string;
  doctor_id?: string;
  doctor_name?: string;
  report_type: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  status: ReportStatus;
  uploaded_at: string;
  verified_at?: string;
  notes?: string;
}

export interface VerificationResult {
  report_id: string;
  status: ReportStatus;
  signature_valid: boolean;
  hash_valid: boolean;
  hospital?: string;
  doctor?: string;
  verified_at?: string;
  message?: string;
}

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

export type ReportType = typeof REPORT_TYPES[number];
