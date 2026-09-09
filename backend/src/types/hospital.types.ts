export interface Hospital {
  id: string;
  name: string;
  registration_identifier: string;
  address?: string;
  phone?: string;
  email?: string;
  verified: boolean;
  public_key?: string;
  created_at: string;
  updated_at?: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  hospital_id: string;
  hospital_name?: string;
  full_name: string;
  email?: string;
  license_identifier: string;
  specialization: string;
  verified: boolean;
  created_at: string;
  updated_at?: string;
}
