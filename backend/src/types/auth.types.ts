import { UserRole } from '../config/constants.js';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  hospital_id?: string;
  doctor_id?: string;
  verification_status?: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthContextUser {
  id: string;
  email: string;
  role: UserRole;
  profile?: Profile;
}
