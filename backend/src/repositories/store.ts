import { Profile } from '../types/auth.types.js';
import { Patient } from '../types/patient.types.js';
import { Hospital, Doctor } from '../types/hospital.types.js';
import { MedicalReport } from '../types/report.types.js';
import { Share } from '../types/sharing.types.js';
import { AuditLog } from '../types/audit.types.js';

export interface InMemoryStore {
  profiles: Profile[];
  patients: Patient[];
  hospitals: Hospital[];
  doctors: Doctor[];
  reports: MedicalReport[];
  shares: Share[];
  auditLogs: AuditLog[];
  files: Map<string, Buffer>; // storagePath -> Buffer
}

function getInitialStore(): InMemoryStore {
  const initialHospitals: Hospital[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Apollo Health Center Mangalore',
      registration_identifier: 'HOSP-MNG-2026-001',
      address: 'Main Road, Hampankatta, Mangalore, Karnataka 575001',
      phone: '+91-824-2445566',
      email: 'records@apollo-mng.example.com',
      verified: true,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'hosp-aj-mng',
      name: 'A.J. Hospital & Research Centre',
      registration_identifier: 'HOSP-MNG-2026-002',
      address: 'Kuntikana, Mangalore, Karnataka 575004',
      phone: '+91-824-2225533',
      email: 'contact@ajhospital.in',
      verified: true,
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
  ];

  const initialProfiles: Profile[] = [
    {
      id: '22222222-2222-2222-2222-222222222222',
      user_id: '22222222-2222-2222-2222-222222222222',
      role: 'hospital',
      full_name: 'Apollo Hospital Administrator',
      email: 'hospital@cryptohealth.example.com',
      hospital_id: '11111111-1111-1111-1111-111111111111',
      verification_status: 'VERIFIED',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      user_id: '33333333-3333-3333-3333-333333333333',
      role: 'doctor',
      full_name: 'Dr. Rajesh Kumar, MD',
      email: 'doctor@cryptohealth.example.com',
      hospital_id: '11111111-1111-1111-1111-111111111111',
      doctor_id: '55555555-5555-5555-5555-555555555555',
      verification_status: 'VERIFIED',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      user_id: '44444444-4444-4444-4444-444444444444',
      role: 'patient',
      full_name: 'Bhavik Sharma',
      email: 'patient@cryptohealth.example.com',
      verification_status: 'VERIFIED',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ];

  const initialDoctors: Doctor[] = [
    {
      id: '55555555-5555-5555-5555-555555555555',
      user_id: '33333333-3333-3333-3333-333333333333',
      hospital_id: '11111111-1111-1111-1111-111111111111',
      hospital_name: 'Apollo Health Center Mangalore',
      full_name: 'Dr. Rajesh Kumar, MD',
      email: 'doctor@cryptohealth.example.com',
      license_identifier: 'KMC-MED-84920',
      specialization: 'Neurology & Radiology',
      verified: true,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
  ];

  const initialPatients: Patient[] = [
    {
      id: '66666666-6666-6666-6666-666666666666',
      user_id: '44444444-4444-4444-4444-444444444444',
      patient_id: 'PAT-2026-001',
      full_name: 'Bhavik Sharma',
      date_of_birth: '1996-05-14',
      gender: 'male',
      phone: '+91-9876543210',
      email: 'patient@cryptohealth.example.com',
      hospital_id: '11111111-1111-1111-1111-111111111111',
      hospital_name: 'Apollo Health Center Mangalore',
      report_count: 2,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: '77777777-7777-7777-7777-777777777777',
      patient_id: 'PAT-2026-002',
      full_name: 'Priya Nayak',
      date_of_birth: '1999-08-22',
      gender: 'female',
      phone: '+91-9845012345',
      email: 'priya.nayak@example.com',
      hospital_id: '11111111-1111-1111-1111-111111111111',
      hospital_name: 'Apollo Health Center Mangalore',
      report_count: 1,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  const initialReports: MedicalReport[] = [
    {
      id: 'rep-mri-001',
      patient_id: '66666666-6666-6666-6666-666666666666',
      patient_name: 'Bhavik Sharma',
      hospital_id: '11111111-1111-1111-1111-111111111111',
      hospital_name: 'Apollo Health Center Mangalore',
      doctor_id: '55555555-5555-5555-5555-555555555555',
      doctor_name: 'Dr. Rajesh Kumar, MD',
      report_type: 'MRI',
      file_name: 'brain_mri_contrast_2026.pdf',
      file_size: 428000,
      mime_type: 'application/pdf',
      file_path: 'medical-reports/66666666-6666-6666-6666-666666666666/rep-mri-001/encrypted-report.bin',
      file_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      encryption_metadata: {
        algorithm: 'AES-256-GCM',
        iv: '1234567890abcdef12345678',
        auth_tag: 'abcdef1234567890abcdef1234567890',
        version: 1,
      },
      signature: 'ed25519-sig-mock-sample-hash-verified',
      status: 'VERIFIED',
      uploaded_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      verified_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      notes: 'Brain scan normal. No acute focal intracranial abnormality.',
    },
    {
      id: 'rep-blood-002',
      patient_id: '66666666-6666-6666-6666-666666666666',
      patient_name: 'Bhavik Sharma',
      hospital_id: '11111111-1111-1111-1111-111111111111',
      hospital_name: 'Apollo Health Center Mangalore',
      doctor_id: '55555555-5555-5555-5555-555555555555',
      doctor_name: 'Dr. Rajesh Kumar, MD',
      report_type: 'Blood Test',
      file_name: 'complete_blood_count.pdf',
      file_size: 154000,
      mime_type: 'application/pdf',
      file_path: 'medical-reports/66666666-6666-6666-6666-666666666666/rep-blood-002/encrypted-report.bin',
      file_hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      encryption_metadata: {
        algorithm: 'AES-256-GCM',
        iv: '9876543210fedcba98765432',
        auth_tag: 'fedcba9876543210fedcba9876543210',
        version: 1,
      },
      signature: 'ed25519-sig-mock-cbc-verified',
      status: 'VERIFIED',
      uploaded_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      verified_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      notes: 'CBC panel normal limits. Hemoglobin 14.2 g/dL.',
    },
  ];

  const initialShares: Share[] = [
    {
      id: 'share-sample-01',
      report_id: 'rep-mri-001',
      report_type: 'MRI',
      patient_id: '66666666-6666-6666-6666-666666666666',
      patient_name: 'Bhavik Sharma',
      created_by: '44444444-4444-4444-4444-444444444444',
      token_hash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
      access_token: 'sample-active-token-xyz',
      expires_at: new Date(Date.now() + 2 * 3600000).toISOString(),
      status: 'ACTIVE',
      can_download: true,
      can_view: true,
      created_at: new Date().toISOString(),
    },
  ];

  const initialAuditLogs: AuditLog[] = [
    {
      id: '88888888-8888-8888-8888-888888888888',
      user_id: '22222222-2222-2222-2222-222222222222',
      user_name: 'Apollo Hospital Administrator',
      action: 'LOGIN',
      resource_type: 'auth',
      resource_id: '22222222-2222-2222-2222-222222222222',
      status: 'SUCCESS',
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '99999999-9999-9999-9999-999999999999',
      user_id: '44444444-4444-4444-4444-444444444444',
      user_name: 'Bhavik Sharma',
      action: 'SHARE_CREATED',
      resource_type: 'medical_report',
      resource_id: 'rep-mri-001',
      status: 'SUCCESS',
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  return {
    profiles: initialProfiles,
    patients: initialPatients,
    hospitals: initialHospitals,
    doctors: initialDoctors,
    reports: initialReports,
    shares: initialShares,
    auditLogs: initialAuditLogs,
    files: new Map<string, Buffer>(),
  };
}

export const store = getInitialStore();
