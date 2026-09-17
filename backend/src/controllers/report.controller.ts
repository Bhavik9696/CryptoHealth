import { Request, Response } from 'express';
import { reportService } from '../services/report.service.js';
import { sendSuccess, sendPaginated, sendError } from '../utils/response.js';
import { env } from '../config/env.js';
import { MedicalReport } from '../types/report.types.js';

/**
 * Strips internal cryptographic fields before sending a report to the client.
 * encryption_metadata, file_path, file_hash are server-side implementation details
 * that must never be exposed through the API.
 */
function sanitizeReport(report: MedicalReport): Omit<MedicalReport, 'encryption_metadata' | 'file_path' | 'file_hash'> {
  const { encryption_metadata, file_path, file_hash, ...safe } = report;
  return safe;
}

export class ReportController {
  async uploadReport(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      sendError(res, 'No medical file uploaded', 'FILE_REQUIRED', 400);
      return;
    }

    if (!req.user) {
      sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
      return;
    }

    const { patient_id, report_type, notes } = req.body;

    if (!patient_id || !report_type) {
      sendError(res, 'patient_id and report_type are required', 'VALIDATION_ERROR', 422);
      return;
    }

    try {
      const report = await reportService.uploadReport({
        patientId: patient_id,
        reportType: report_type,
        fileBuffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        uploader: req.user,
        notes,
        ipAddress: req.ip,
      });

      sendSuccess(res, sanitizeReport(report), 'Medical report encrypted, signed, and uploaded successfully', 201);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Report upload failed';
      sendError(res, message, 'UPLOAD_ERROR', 400);
    }
  }

  async getReports(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const patient_id = req.query.patient_id ? String(req.query.patient_id) : undefined;
    const hospital_id = req.query.hospital_id ? String(req.query.hospital_id) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const report_type = req.query.report_type ? String(req.query.report_type) : undefined;

    try {
      const { reports, total } = await reportService.getReports(req.user, {
        page,
        limit,
        patient_id,
        hospital_id,
        status,
        report_type,
      });

      sendPaginated(res, reports.map(sanitizeReport), total, page, limit);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch reports';
      const statusCode = message.includes('denied') ? 403 : 400;
      sendError(res, message, statusCode === 403 ? 'FORBIDDEN' : 'FETCH_ERROR', statusCode);
    }
  }

  async getReportById(req: Request, res: Response): Promise<void> {
    const { reportId } = req.params;

    try {
      const report = await reportService.getReportById(reportId, req.user, req.ip);
      sendSuccess(res, sanitizeReport(report));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Report not found';
      const statusCode = message.includes('denied') ? 403 : 404;
      sendError(res, message, statusCode === 403 ? 'FORBIDDEN' : 'NOT_FOUND', statusCode);
    }
  }

  async getDownloadUrl(req: Request, res: Response): Promise<void> {
    const { reportId } = req.params;

    try {
      // Validate access first — throws if unauthorized
      await reportService.getReportById(reportId, req.user, req.ip);
      const baseUrl = env.APP_URL;
      const downloadUrl = `${baseUrl}/api/v1/reports/${reportId}/file`;

      sendSuccess(res, { url: downloadUrl });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to generate download URL';
      const statusCode = message.includes('denied') ? 403 : 404;
      sendError(res, message, statusCode === 403 ? 'FORBIDDEN' : 'NOT_FOUND', statusCode);
    }
  }

  async downloadFile(req: Request, res: Response): Promise<void> {
    const { reportId } = req.params;

    try {
      const { buffer, report } = await reportService.getDecryptedFile(reportId, req.user, req.ip);

      res.setHeader('Content-Type', report.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${report.file_name}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to retrieve decrypted file';
      const statusCode = message.includes('denied') ? 403 : 404;
      sendError(res, message, statusCode === 403 ? 'FORBIDDEN' : 'NOT_FOUND', statusCode);
    }
  }

  async deleteReport(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
      return;
    }

    const { reportId } = req.params;
    try {
      await reportService.deleteReport(reportId, req.user, req.ip);
      sendSuccess(res, null, 'Medical report deleted successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete report';
      sendError(res, message, 'DELETE_ERROR', 400);
    }
  }
}

export const reportController = new ReportController();
