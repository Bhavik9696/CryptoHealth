import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('Crypto Health API Integration Tests', () => {
  const patientAuthHeader = 'Bearer mock-token-patient';
  const hospitalAuthHeader = 'Bearer mock-token-hospital';

  describe('1. Health and Documentation Endpoints', () => {
    it('GET /health should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('crypto-health-api');
    });

    it('GET / should return API metadata', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Crypto Health API');
    });
  });

  describe('2. Authentication and Profile API', () => {
    it('GET /api/v1/auth/me should return current user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', patientAuthHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('patient@cryptohealth.example.com');
      expect(res.body.data.role).toBe('patient');
    });

    it('GET /api/v1/auth/me without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('3. Patients API', () => {
    it('GET /api/v1/patients should return paginated patients list', async () => {
      const res = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', patientAuthHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
    });

    it('GET /api/v1/patients/:patientId should return patient details', async () => {
      const res = await request(app)
        .get('/api/v1/patients/66666666-6666-6666-6666-666666666666')
        .set('Authorization', patientAuthHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patient_id).toBe('PAT-2026-001');
    });
  });

  describe('4. Medical Reports API (Upload, Encryption, Retrieval)', () => {
    let uploadedReportId = '';

    it('POST /api/v1/reports should upload, encrypt, sign, and store medical report', async () => {
      const dummyReportContent = 'Hospital Diagnostic Investigation: Normal ECG & Blood Panel';

      const res = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', hospitalAuthHeader)
        .field('patient_id', '66666666-6666-6666-6666-666666666666')
        .field('report_type', 'ECG')
        .field('notes', 'Routine checkup prior to surgery')
        .attach('file', Buffer.from(dummyReportContent, 'utf8'), {
          filename: 'patient_ecg_test.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.file_hash).toBeDefined();
      expect(res.body.data.signature).toBeDefined();
      expect(res.body.data.encryption_metadata.algorithm).toBe('AES-256-GCM');
      expect(res.body.data.status).toBe('VERIFIED');

      uploadedReportId = res.body.data.id;
    });

    it('GET /api/v1/reports/:reportId should fetch report metadata', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/${uploadedReportId}`)
        .set('Authorization', patientAuthHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(uploadedReportId);
      expect(res.body.data.report_type).toBe('ECG');
    });

    it('GET /api/v1/reports/:reportId/download should return secure download link', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/${uploadedReportId}/download`)
        .set('Authorization', patientAuthHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toContain(`/api/v1/reports/${uploadedReportId}/file`);
    });

    it('GET /api/v1/reports/:reportId/file should decrypt and serve original plaintext', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/${uploadedReportId}/file`)
        .set('Authorization', patientAuthHeader);

      expect(res.status).toBe(200);
      const content = Buffer.isBuffer(res.body) ? res.body.toString('utf8') : res.text;
      expect(content).toBe('Hospital Diagnostic Investigation: Normal ECG & Blood Panel');
    });
  });

  describe('5. Sharing API (Temporary Grants, QR, Token Validation, Revocation)', () => {
    let shareId = '';
    let token = '';

    it('POST /api/v1/sharing should create temporary share with QR code', async () => {
      const res = await request(app)
        .post('/api/v1/sharing')
        .set('Authorization', patientAuthHeader)
        .send({
          report_id: 'rep-mri-001',
          duration_minutes: 60,
          can_view: true,
          can_download: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.access_token).toBeDefined();
      expect(res.body.data.qr_code_url).toContain('data:image/png;base64,');
      expect(res.body.data.status).toBe('ACTIVE');

      shareId = res.body.data.id;
      token = res.body.data.access_token;
    });

    it('POST /api/v1/sharing/validate should successfully validate active token', async () => {
      const res = await request(app)
        .post('/api/v1/sharing/validate')
        .send({ token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(shareId);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('POST /api/v1/sharing/:shareId/revoke should revoke active share grant', async () => {
      const res = await request(app)
        .post(`/api/v1/sharing/${shareId}/revoke`)
        .set('Authorization', patientAuthHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/v1/sharing/validate should reject revoked token', async () => {
      const res = await request(app)
        .post('/api/v1/sharing/validate')
        .send({ token });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('revoked');
    });
  });

  describe('6. Verification and Audit Logging API', () => {
    it('POST /api/v1/verification/reports/:reportId should verify report signature', async () => {
      const res = await request(app)
        .post('/api/v1/verification/reports/rep-mri-001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.signature_valid).toBe(true);
      expect(res.body.data.status).toBe('VERIFIED');
    });

    it('GET /api/v1/audit/logs should return security audit trail', async () => {
      const res = await request(app)
        .get('/api/v1/audit/logs')
        .set('Authorization', hospitalAuthHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
    });
  });
});
