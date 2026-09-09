import crypto from 'crypto';
import { sharingRepository, ShareFilterParams } from '../repositories/sharing.repository.js';
import { reportRepository } from '../repositories/report.repository.js';
import { patientRepository } from '../repositories/patient.repository.js';
import { generateShareToken, hashShareToken } from '../utils/token.js';
import { qrService } from './qr.service.js';
import { auditService } from './audit.service.js';
import { Share, CreateSharePayload } from '../types/sharing.types.js';
import { AuthContextUser } from '../types/auth.types.js';
import { env } from '../config/env.js';

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

    const share: Share = {
      id: shareId,
      report_id: report.id,
      report_type: report.report_type,
      patient_id: report.patient_id,
      patient_name: report.patient_name,
      created_by: user.id,
      recipient_id: payload.recipient_id,
      token_hash: tokenHash,
      access_token: rawToken,
      qr_code_url: qrCodeUrl,
      expires_at: expiresAt,
      status: 'ACTIVE',
      can_view: payload.can_view ?? true,
      can_download: payload.can_download ?? false,
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
      },
    });

    return created;
  }

  async getShares(user: AuthContextUser, params: ShareFilterParams = {}) {
    const filter: ShareFilterParams = { ...params };
    if (user.role === 'patient') {
      const patient = await patientRepository.findByUserId(user.id);
      if (patient) {
        filter.patient_id = patient.id;
      }
    }

    return sharingRepository.findAll(filter);
  }

  async getShareById(shareId: string): Promise<Share | null> {
    return sharingRepository.findById(shareId);
  }

  async validateToken(token: string, ipAddress?: string): Promise<Share> {
    const tokenHash = hashShareToken(token);
    let share = await sharingRepository.findByTokenHash(tokenHash);

    // Fallback search by raw token or share ID for development ease
    if (!share) {
      share = await sharingRepository.findById(token);
    }

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

    // Mark used_at timestamp
    await sharingRepository.update(share.id, { used_at: new Date().toISOString() });

    await auditService.log({
      action: 'SHARE_ACCESSED',
      resourceType: 'access_grant',
      resourceId: share.id,
      status: 'SUCCESS',
      ipAddress,
      metadata: { report_id: share.report_id },
    });

    return share;
  }

  async revokeShare(shareId: string, user: AuthContextUser, ipAddress?: string): Promise<void> {
    const share = await sharingRepository.findById(shareId);
    if (!share) {
      throw new Error(`Share grant with ID "${shareId}" not found`);
    }

    // Check authorization: creator or patient or hospital
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
