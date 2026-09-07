import { hospitalRepository, doctorRepository } from '../repositories/hospital.repository.js';
import { reportRepository } from '../repositories/report.repository.js';
import { Hospital, Doctor } from '../types/hospital.types.js';
import { MedicalReport } from '../types/report.types.js';

export class HospitalService {
  async getHospitalById(id: string): Promise<Hospital | null> {
    return hospitalRepository.findById(id);
  }

  async getDoctorsByHospital(hospitalId: string): Promise<Doctor[]> {
    return doctorRepository.findByHospitalId(hospitalId);
  }

  async getHospitalReports(hospitalId: string): Promise<MedicalReport[]> {
    const res = await reportRepository.findAll({ hospital_id: hospitalId, limit: 100 });
    return res.reports;
  }
}

export class DoctorService {
  async getDoctorByUserId(userId: string): Promise<Doctor | null> {
    return doctorRepository.findByUserId(userId);
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    return doctorRepository.findById(id);
  }
}

export const hospitalService = new HospitalService();
export const doctorService = new DoctorService();
