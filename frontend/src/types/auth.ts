// Auth types
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
}

export type UserRole = 'patient' | 'doctor' | 'hospital_admin' | 'admin';

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'hospital_admin';
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}
