import { ShareStatus } from '../config/constants.js';

export interface Share {
  id: string;
  report_id: string;
  report_type?: string;
  patient_id: string;
  patient_name?: string;
  created_by: string;
  recipient_id?: string;
  recipient_name?: string;
  token_hash?: string;
  access_token?: string;
  qr_code_url?: string;
  expires_at: string;
  status: ShareStatus;
  can_download: boolean;
  can_view: boolean;
  created_at: string;
  revoked_at?: string;
  used_at?: string;
}

export interface CreateSharePayload {
  report_id: string;
  recipient_id?: string;
  duration_minutes: number;
  can_view: boolean;
  can_download: boolean;
}
