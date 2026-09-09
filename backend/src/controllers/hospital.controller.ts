import { Request, Response } from 'express';
import { hospitalService, doctorService } from '../services/hospital.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class HospitalController {
  async getMe(req: Request, res: Response): Promise<void> {
    const hospitalId = req.user?.profile?.hospital_id || '11111111-1111-1111-1111-111111111111';
    const hospital = await hospitalService.getHospitalById(hospitalId);
    if (!hospital) {
      sendError(res, 'Hospital not found', 'NOT_FOUND', 404);
      return;
    }
    sendSuccess(res, hospital);
  }

  async getDoctors(req: Request, res: Response): Promise<void> {
    const hospitalId = req.user?.profile?.hospital_id || '11111111-1111-1111-1111-111111111111';
    const doctors = await hospitalService.getDoctorsByHospital(hospitalId);
    sendSuccess(res, doctors);
  }

  async getReports(req: Request, res: Response): Promise<void> {
    const hospitalId = req.user?.profile?.hospital_id || '11111111-1111-1111-1111-111111111111';
    const reports = await hospitalService.getHospitalReports(hospitalId);
    sendSuccess(res, reports);
  }
}

export class DoctorController {
  async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 'Unauthenticated', 'UNAUTHORIZED', 401);
      return;
    }

    const doctor = await doctorService.getDoctorByUserId(req.user.id);
    if (!doctor) {
      sendError(res, 'Doctor profile not found', 'NOT_FOUND', 404);
      return;
    }
    sendSuccess(res, doctor);
  }
}

export const hospitalController = new HospitalController();
export const doctorController = new DoctorController();
