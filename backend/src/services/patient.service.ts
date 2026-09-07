import { patientRepository } from '../repositories/patient.repository.js';
import { reportRepository } from '../repositories/report.repository.js';
import { Patient, PatientListParams } from '../types/patient.types.js';
import { MedicalReport } from '../types/report.types.js';

export class PatientService {
  async getPatients(params: PatientListParams = {}): Promise<{ patients: Patient[]; total: number }> {
    return patientRepository.findAll(params);
  }

  async getPatientById(id: string): Promise<Patient | null> {
    return patientRepository.findById(id);
  }

  async getPatientReports(patientId: string): Promise<MedicalReport[]> {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new Error(`Patient with ID "${patientId}" not found`);
    }
    return reportRepository.findByPatientId(patient.id);
  }
}

export const patientService = new PatientService();
