import { Request, Response } from 'express';
import { patientService } from '../services/patient.service.js';
import { sendSuccess, sendPaginated, sendError } from '../utils/response.js';

export class PatientController {
  async getPatients(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search ? String(req.query.search) : undefined;
    const hospital_id = req.query.hospital_id ? String(req.query.hospital_id) : undefined;

    const { patients, total } = await patientService.getPatients({
      page,
      limit,
      search,
      hospital_id,
    });

    sendPaginated(res, patients, total, page, limit);
  }

  async getPatientById(req: Request, res: Response): Promise<void> {
    const { patientId } = req.params;
    const patient = await patientService.getPatientById(patientId);

    if (!patient) {
      sendError(res, `Patient not found with ID "${patientId}"`, 'NOT_FOUND', 404);
      return;
    }

    sendSuccess(res, patient);
  }

  async getPatientReports(req: Request, res: Response): Promise<void> {
    const { patientId } = req.params;
    try {
      const reports = await patientService.getPatientReports(patientId);
      // Frontend expects: paginated structure or { data: reports }
      sendSuccess(res, reports);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching reports';
      sendError(res, message, 'NOT_FOUND', 404);
    }
  }
}

export const patientController = new PatientController();
