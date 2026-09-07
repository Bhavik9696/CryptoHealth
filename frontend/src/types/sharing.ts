export type ShareStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface Share {
  id: string;
  report_id: string;
  report_type?: string;
  patient_id: string;
  patient_name?: string;
  created_by: string;
  recipient_id?: string;
  recipient_name?: string;
  expires_at: string;
  status: ShareStatus;
  can_download: boolean;
  can_view: boolean;
  access_token?: string;
  created_at: string;
}

export interface CreateSharePayload {
  report_id: string;
  recipient_id?: string;
  duration_minutes: number;
  can_view: boolean;
  can_download: boolean;
}

export const SHARE_DURATIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '6 hours', value: 360 },
  { label: '24 hours', value: 1440 },
] as const;
