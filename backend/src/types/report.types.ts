import { ReportStatus, ReportType } from '../config/constants.js';

export interface EncryptionMetadata {
  algorithm: 'AES-256-GCM';
  iv: string;
  auth_tag: string;
  key_id?: string;
  version: number;
}

export interface MedicalReport {
  id: string;
  patient_id: string;
  patient_name?: string;
  hospital_id: string;
  hospital_name?: string;
  doctor_id?: string;
  doctor_name?: string;
  report_type: ReportType | string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  file_path?: string;
  file_hash?: string;
  encryption_metadata?: EncryptionMetadata;
  signature?: string;
  status: ReportStatus;
  uploaded_at: string;
  verified_at?: string;
  updated_at?: string;
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
