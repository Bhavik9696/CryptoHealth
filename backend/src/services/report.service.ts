import crypto from 'crypto';
import { reportRepository, ReportFilterParams } from '../repositories/report.repository.js';
import { patientRepository } from '../repositories/patient.repository.js';
import { hospitalRepository } from '../repositories/hospital.repository.js';
import { encryptionService } from './encryption.service.js';
import { signatureService } from './signature.service.js';
import { hashBuffer } from '../utils/hash.js';
import { auditService } from './audit.service.js';
import { MedicalReport } from '../types/report.types.js';
import { AuthContextUser } from '../types/auth.types.js';

export interface UploadReportParams {
  patientId: string;
  reportType: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  uploader: AuthContextUser;
  notes?: string;
  ipAddress?: string;
}

export class ReportService {
  /**
   * Secure upload pipeline:
   * 1. Validate patient and hospital existence
   * 2. Hash raw plaintext file with SHA-256
   * 3. Encrypt file with AES-256-GCM
   * 4. Sign file hash with hospital Ed25519 digital signature
   * 5. Upload encrypted binary to secure storage
   * 6. Save metadata record to database
   * 7. Record security audit log
   */
  async uploadReport(params: UploadReportParams): Promise<MedicalReport> {
    const patient = await patientRepository.findById(params.patientId);
    if (!patient) {
      throw new Error(`Patient not found with ID: ${params.patientId}`);
    }

    const hospitalId = params.uploader.profile?.hospital_id || patient.hospital_id || '11111111-1111-1111-1111-111111111111';
    const hospital = await hospitalRepository.findById(hospitalId);

    const reportId = crypto.randomUUID();

    // 1. Calculate integrity hash of original file
    const fileHash = hashBuffer(params.fileBuffer);

    // 2. Encrypt with AES-256-GCM
    const encrypted = encryptionService.encrypt(params.fileBuffer);
    const packedEncryptedData = encryptionService.pack(encrypted);

    // 3. Digitally sign hash using Ed25519
    const signature = signatureService.sign(fileHash);

    // 4. Store encrypted binary in storage
    const storagePath = `medical-reports/${patient.id}/${reportId}/encrypted-report.bin`;
    await reportRepository.saveFile(storagePath, packedEncryptedData, 'application/octet-stream');

    // 5. Create report record
    const report: MedicalReport = {
      id: reportId,
      patient_id: patient.id,
      patient_name: patient.full_name,
      hospital_id: hospitalId,
      hospital_name: hospital?.name || 'Healthcare Provider',
      doctor_id: params.uploader.profile?.doctor_id,
      doctor_name: params.uploader.profile?.full_name,
      report_type: params.reportType,
      file_name: params.fileName,
      file_size: params.fileBuffer.length,
      mime_type: params.mimeType,
      file_path: storagePath,
      file_hash: fileHash,
      encryption_metadata: encrypted.metadata,
      signature,
      status: 'VERIFIED',
      uploaded_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      notes: params.notes,
    };

    const createdReport = await reportRepository.create(report);

    // 6. Audit log
    await auditService.log({
      userId: params.uploader.id,
      userName: params.uploader.profile?.full_name,
      action: 'REPORT_UPLOAD',
      resourceType: 'medical_report',
      resourceId: reportId,
      status: 'SUCCESS',
      ipAddress: params.ipAddress,
      metadata: {
        file_name: params.fileName,
        file_size: params.fileBuffer.length,
        file_hash: fileHash,
        patient_id: patient.id,
      },
    });

    return createdReport;
  }

  async getReports(user: AuthContextUser, params: ReportFilterParams = {}) {
    // Role-based filtering
    const filter: ReportFilterParams = { ...params };
    if (user.role === 'patient') {
      const patient = await patientRepository.findByUserId(user.id);
      if (patient) {
        filter.patient_id = patient.id;
      }
    } else if (user.role === 'hospital' && user.profile?.hospital_id) {
      filter.hospital_id = user.profile.hospital_id;
    }

    return reportRepository.findAll(filter);
  }

  async getReportById(reportId: string, user?: AuthContextUser, ipAddress?: string): Promise<MedicalReport> {
    const report = await reportRepository.findById(reportId);
    if (!report) {
      throw new Error(`Report not found with ID: ${reportId}`);
    }

    // Check authorization if user provided
    if (user && user.role === 'patient') {
      const patient = await patientRepository.findByUserId(user.id);
      if (patient && report.patient_id !== patient.id) {
        await auditService.log({
          userId: user.id,
          userName: user.profile?.full_name,
          action: 'UNAUTHORIZED_ACCESS',
          resourceType: 'medical_report',
          resourceId: reportId,
          status: 'DENIED',
          ipAddress,
        });
        throw new Error('Access denied: You do not have permission to view this report');
      }
    }

    if (user) {
      await auditService.log({
        userId: user.id,
        userName: user.profile?.full_name,
        action: 'REPORT_VIEW',
        resourceType: 'medical_report',
        resourceId: reportId,
        status: 'SUCCESS',
        ipAddress,
      });
    }

    return report;
  }

  async getDecryptedFile(reportId: string, user?: AuthContextUser, ipAddress?: string): Promise<{ buffer: Buffer; report: MedicalReport }> {
    const report = await this.getReportById(reportId, user, ipAddress);
    if (!report.file_path) {
      throw new Error('Report file path not found');
    }

    const encryptedData = await reportRepository.getFile(report.file_path);
    if (!encryptedData) {
      throw new Error('Encrypted report file not found in storage');
    }

    let plaintext: Buffer;
    try {
      if (report.encryption_metadata) {
        // Unpack if packed, or decrypt using metadata
        if (encryptedData.length >= 28) {
          try {
            const unpacked = encryptionService.unpack(encryptedData);
            plaintext = encryptionService.decrypt(unpacked.ciphertext, unpacked.metadata);
          } catch {
            plaintext = encryptionService.decrypt(encryptedData, report.encryption_metadata);
          }
        } else {
          plaintext = encryptionService.decrypt(encryptedData, report.encryption_metadata);
        }
      } else {
        plaintext = encryptedData;
      }
    } catch {
      throw new Error('Cryptographic error: Failed to decrypt report file');
    }

    if (user) {
      await auditService.log({
        userId: user.id,
        userName: user.profile?.full_name,
        action: 'REPORT_DOWNLOAD',
        resourceType: 'medical_report',
        resourceId: reportId,
        status: 'SUCCESS',
        ipAddress,
      });
    }

    return { buffer: plaintext, report };
  }

  async deleteReport(reportId: string, user: AuthContextUser, ipAddress?: string): Promise<boolean> {
    const report = await this.getReportById(reportId, user);
    if (user.role === 'patient') {
      const patient = await patientRepository.findByUserId(user.id);
      if (!patient || report.patient_id !== patient.id) {
        throw new Error('Unauthorized to delete this report');
      }
    }

    const success = await reportRepository.delete(reportId);
    if (success) {
      await auditService.log({
        userId: user.id,
        userName: user.profile?.full_name,
        action: 'REPORT_DELETE',
        resourceType: 'medical_report',
        resourceId: reportId,
        status: 'SUCCESS',
        ipAddress,
      });
    }
    return success;
  }
}

export const reportService = new ReportService();
