-- Crypto Health Seed Data
-- supabase/seed.sql

-- 1. Sample Hospital
INSERT INTO public.hospitals (id, name, registration_identifier, address, phone, email, verified)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Apollo Health Center Mangalore',
    'HOSP-MNG-2026-001',
    'Main Road, Hampankatta, Mangalore, Karnataka 575001',
    '+91-824-2445566',
    'records@apollo-mng.example.com',
    TRUE
) ON CONFLICT DO NOTHING;

-- 2. Sample Profiles
INSERT INTO public.profiles (id, user_id, role, full_name, email, hospital_id, verification_status)
VALUES 
(
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'hospital',
    'Apollo Hospital Admin',
    'hospital@cryptohealth.example.com',
    '11111111-1111-1111-1111-111111111111',
    'VERIFIED'
),
(
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'doctor',
    'Dr. Rajesh Kumar, MD',
    'doctor@cryptohealth.example.com',
    '11111111-1111-1111-1111-111111111111',
    'VERIFIED'
),
(
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'patient',
    'Bhavik Sharma',
    'patient@cryptohealth.example.com',
    NULL,
    'VERIFIED'
) ON CONFLICT DO NOTHING;

-- 3. Sample Doctor
INSERT INTO public.doctors (id, user_id, hospital_id, license_identifier, specialization, verified)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'KMC-MED-84920',
    'Neurology & Radiology',
    TRUE
) ON CONFLICT DO NOTHING;

-- 4. Sample Patients
INSERT INTO public.patients (id, user_id, patient_id, full_name, date_of_birth, gender, phone, email, hospital_id)
VALUES 
(
    '66666666-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    'PAT-2026-001',
    'Bhavik Sharma',
    '1996-05-14',
    'male',
    '+91-9876543210',
    'patient@cryptohealth.example.com',
    '11111111-1111-1111-1111-111111111111'
),
(
    '77777777-7777-7777-7777-777777777777',
    NULL,
    'PAT-2026-002',
    'Priya Nayak',
    '1999-08-22',
    'female',
    '+91-9845012345',
    'priya.nayak@example.com',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT DO NOTHING;

-- 5. Sample Audit Logs
INSERT INTO public.audit_logs (id, user_id, action, resource_type, resource_id, status, ip_address)
VALUES (
    '88888888-8888-8888-8888-888888888888',
    '22222222-2222-2222-2222-222222222222',
    'LOGIN',
    'auth',
    '22222222-2222-2222-2222-222222222222',
    'SUCCESS',
    '127.0.0.1'
) ON CONFLICT DO NOTHING;
