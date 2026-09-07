export interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  hospital_id?: string;
  hospital_name?: string;
  report_count?: number;
  created_at: string;
}

export interface PatientListParams {
  search?: string;
  page?: number;
  limit?: number;
}
