import crypto from 'crypto';
import { sharingRepository, ShareFilterParams } from '../repositories/sharing.repository.js';
import { reportRepository } from '../repositories/report.repository.js';
import { patientRepository } from '../repositories/patient.repository.js';
import { generateShareToken, hashShareToken } from '../utils/token.js';
import { qrService } from './qr.service.js';
import { auditService } from './audit.service.js';
import { encryptionService } from './encryption.service.js';
import { Share, CreateSharePayload } from '../types/sharing.types.js';
import { AuthContextUser } from '../types/auth.types.js';
import { env } from '../config/env.js';

/**
 * Strips sensitive internal fields before returning share data to clients.
 * token_hash must never leave the server. access_token is only returned on creation.
 */
function sanitizeShare(share: Share): Omit<Share, 'token_hash' | 'access_token'> {
  const { token_hash, access_token, ...safe } = share;
  return safe;
}

export class SharingService {
  async createShare(payload: CreateSharePayload, user: AuthContextUser, ipAddress?: string): Promise<Share> {
    const report = await reportRepository.findById(payload.report_id);
    if (!report) {
      throw new Error(`Report not found: ${payload.report_id}`);
    }

    // Patient authorization check
    if (user.role === 'patient') {
      const patient = await patientRepository.findByUserId(user.id);
      if (patient && report.patient_id !== patient.id) {
        throw new Error('Unauthorized: You can only share your own medical records');
      }
    }

    const shareId = crypto.randomUUID();
    const rawToken = generateShareToken();
    const tokenHash = hashShareToken(rawToken);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + payload.duration_minutes * 60 * 1000).toISOString();

    const frontendOrigin = env.CORS_ORIGINS.split(',')[0].trim() || 'http://localhost:5173';
    const accessUrl = `${frontendOrigin}/shared/${rawToken}`;
    const qrCodeUrl = await qrService.generateDataUrl(accessUrl);

    // Store only the hash — raw token is NEVER persisted in the database
    const share: Share = {
      id: shareId,
      report_id: report.id,
      report_type: report.report_type,
      patient_id: report.patient_id,
      patient_name: report.patient_name,
      created_by: user.id,
      recipient_id: payload.recipient_id,
      token_hash: tokenHash,
      qr_code_url: qrCodeUrl,
      expires_at: expiresAt,
      status: 'ACTIVE',
      can_view: payload.can_view ?? true,
      can_download: payload.can_download ?? false,
      one_time_use: payload.one_time_use ?? false,
      access_count: 0,
      created_at: now.toISOString(),
    };

    const created = await sharingRepository.create(share);

    await auditService.log({
      userId: user.id,
      userName: user.profile?.full_name,
      action: 'SHARE_CREATED',
      resourceType: 'medical_report',
      resourceId: report.id,
      status: 'SUCCESS',
      ipAddress,
      metadata: {
        share_id: shareId,
        expires_at: expiresAt,
        duration_minutes: payload.duration_minutes,
        one_time_use: payload.one_time_use,
      },
    });

    // Return raw token ONLY in the creation response so the patient can distribute it
    return { ...created, access_token: rawToken };
  }

  async getShares(user: AuthContextUser, params: ShareFilterParams = {}) {
    const filter: ShareFilterParams = { ...params };
    if (user.role === 'patient') {
      const patient = await patientRepository.findByUserId(user.id);
      if (patient) {
        filter.patient_id = patient.id;
      }
    }

    const result = await sharingRepository.findAll(filter);
    return {
      shares: result.shares.map(sanitizeShare),
      total: result.total,
    };
  }

  async getShareById(shareId: string, user: AuthContextUser): Promise<ReturnType<typeof sanitizeShare> | null> {
    const share = await sharingRepository.findById(shareId);
    if (!share) return null;

    // Only the creator, the patient who owns the share, or an admin can view share details
    if (user.role === 'patient') {
      const patient = await patientRepository.findByUserId(user.id);
      if (patient && share.patient_id !== patient.id && share.created_by !== user.id) {
        throw new Error('Access denied: You can only view your own shares');
      }
    } else if (user.role !== 'admin' && share.created_by !== user.id) {
      throw new Error('Access denied: You can only view shares you created');
    }

    return sanitizeShare(share);
  }

  async validateToken(
    token: string,
    user?: AuthContextUser,
    ipAddress?: string
  ): Promise<ReturnType<typeof sanitizeShare>> {
    const tokenHash = hashShareToken(token);
    // Only lookup by hash — no fallback to share ID (that would bypass the token security model)
    const share = await sharingRepository.findByTokenHash(tokenHash);

    if (!share) {
      await auditService.log({
        action: 'INVALID_SHARE_TOKEN',
        resourceType: 'access_grant',
        status: 'DENIED',
        ipAddress,
        metadata: { token_prefix: token.slice(0, 8) },
      });
      throw new Error('Invalid or non-existent share token');
    }

    if (share.status === 'REVOKED') {
      await auditService.log({
        action: 'REVOKED_SHARE_ACCESS_ATTEMPT',
        resourceType: 'access_grant',
        resourceId: share.id,
        status: 'DENIED',
        ipAddress,
      });
      throw new Error('Access denied: This share link was revoked by the patient');
    }

    if (share.status === 'EXPIRED' || new Date(share.expires_at) < new Date()) {
      await sharingRepository.update(share.id, { status: 'EXPIRED' });
      await auditService.log({
        action: 'EXPIRED_SHARE_ACCESS_ATTEMPT',
        resourceType: 'access_grant',
        resourceId: share.id,
        status: 'DENIED',
        ipAddress,
      });
      throw new Error('Access denied: This temporary share grant has expired');
    }

    // Enforce one-time-use: if already used, deny immediately
    if (share.one_time_use && share.used_at) {
      await auditService.log({
        action: 'ONE_TIME_SHARE_REUSE_ATTEMPT',
        resourceType: 'access_grant',
        resourceId: share.id,
        status: 'DENIED',
        ipAddress,
      });
      throw new Error('Access denied: This share link has already been used (one-time use only)');
    }

    // Enforce recipient restriction: if recipient_id is set, the authenticated user must match
    if (share.recipient_id) {
      if (!user) {
        throw new Error('Authentication required: This share link is restricted to a specific recipient');
      }
      const isRecipient =
        user.id === share.recipient_id ||
        user.profile?.doctor_id === share.recipient_id;
      if (!isRecipient) {
        await auditService.log({
          userId: user.id,
          action: 'WRONG_RECIPIENT_ACCESS_ATTEMPT',
          resourceType: 'access_grant',
          resourceId: share.id,
          status: 'DENIED',
          ipAddress,
          metadata: { expected_recipient: share.recipient_id },
        });
        throw new Error('Access denied: This share link was not issued to you');
      }
    }

    // Record access
    const newAccessCount = (share.access_count || 0) + 1;
    await sharingRepository.update(share.id, {
      used_at: new Date().toISOString(),
      access_count: newAccessCount,
    });

    await auditService.log({
      userId: user?.id,
      action: 'SHARE_ACCESSED',
      resourceType: 'access_grant',
      resourceId: share.id,
      status: 'SUCCESS',
      ipAddress,
      metadata: { report_id: share.report_id, access_count: newAccessCount },
    });

    return sanitizeShare(share);
  }

  /**
   * Access report data through a validated share grant, enforcing can_view / can_download scope.
   */
  async accessSharedReport(
    token: string,
    action: 'view' | 'download',
    user?: AuthContextUser,
    ipAddress?: string
  ): Promise<{ report: Record<string, unknown>; file?: { buffer: Buffer; mimeType: string; fileName: string } }> {
    const share = await this.validateToken(token, user, ipAddress);

    if (action === 'view' && !share.can_view) {
      throw new Error('Access denied: This share does not grant viewing permission');
    }
    if (action === 'download' && !share.can_download) {
      throw new Error('Access denied: This share does not grant download permission');
    }

    const report = await reportRepository.findById(share.report_id);
    if (!report) {
      throw new Error('Report no longer exists');
    }

    // Return only safe public metadata — never expose file_path, encryption_metadata, file_hash
    const safeReport: Record<string, unknown> = {
      id: report.id,
      patient_name: report.patient_name,
      hospital_name: report.hospital_name,
      doctor_name: report.doctor_name,
      report_type: report.report_type,
      file_name: report.file_name,
      file_size: report.file_size,
      mime_type: report.mime_type,
      status: report.status,
      uploaded_at: report.uploaded_at,
      verified_at: report.verified_at,
      notes: report.notes,
    };

    if (action === 'download' && report.file_path) {
      const encryptedData = await reportRepository.getFile(report.file_path);
      if (!encryptedData) throw new Error('Report file not found in storage');

      let plaintext: Buffer;
      try {
        if (report.encryption_metadata && encryptedData.length >= 28) {
          try {
            const unpacked = encryptionService.unpack(encryptedData);
            plaintext = encryptionService.decrypt(unpacked.ciphertext, unpacked.metadata);
          } catch {
            plaintext = encryptionService.decrypt(encryptedData, report.encryption_metadata);
          }
        } else if (report.encryption_metadata) {
          plaintext = encryptionService.decrypt(encryptedData, report.encryption_metadata);
        } else {
          plaintext = encryptedData;
        }
      } catch {
        throw new Error('Cryptographic error: Failed to decrypt report file');
      }

      return {
        report: safeReport,
        file: {
          buffer: plaintext,
          mimeType: report.mime_type || 'application/octet-stream',
          fileName: report.file_name,
        },
      };
    }

    return { report: safeReport };
  }

  async revokeShare(shareId: string, user: AuthContextUser, ipAddress?: string): Promise<void> {
    const share = await sharingRepository.findById(shareId);
    if (!share) {
      throw new Error(`Share grant with ID "${shareId}" not found`);
    }

    if (user.role === 'patient') {
      const patient = await patientRepository.findByUserId(user.id);
      if (patient && share.patient_id !== patient.id && share.created_by !== user.id) {
        throw new Error('Unauthorized: You can only revoke your own shares');
      }
    }

    await sharingRepository.revoke(shareId);

    await auditService.log({
      userId: user.id,
      userName: user.profile?.full_name,
      action: 'SHARE_REVOKED',
      resourceType: 'access_grant',
      resourceId: shareId,
      status: 'SUCCESS',
      ipAddress,
      metadata: { report_id: share.report_id },
    });
  }
}

export const sharingService = new SharingService();
