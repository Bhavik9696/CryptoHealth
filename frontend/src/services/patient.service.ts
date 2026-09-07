import apiClient from './api'
import type { Patient, PatientListParams } from '@/types/patient'
import type { PaginatedResponse, ApiResponse } from '@/types/api'

export const patientService = {
  async getPatients(params?: PatientListParams): Promise<PaginatedResponse<Patient>> {
    const response = await apiClient.get('/patients', { params })
    return response.data
  },

  async getPatient(patientId: string): Promise<Patient> {
    const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${patientId}`)
    return response.data.data
  },

  async searchPatients(query: string): Promise<Patient[]> {
    const response = await apiClient.get<PaginatedResponse<Patient>>('/patients', {
      params: { search: query, limit: 20 },
    })
    return response.data.data
  },
}
