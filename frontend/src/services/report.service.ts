import apiClient from './api'
import type { MedicalReport } from '@/types/report'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export const reportService = {
  async getReports(params?: Record<string, unknown>): Promise<PaginatedResponse<MedicalReport>> {
    const response = await apiClient.get('/reports', { params })
    return response.data
  },

  async getReport(reportId: string): Promise<MedicalReport> {
    const response = await apiClient.get<ApiResponse<MedicalReport>>(`/reports/${reportId}`)
    return response.data.data
  },

  async getPatientReports(patientId: string): Promise<MedicalReport[]> {
    const response = await apiClient.get<PaginatedResponse<MedicalReport>>(
      `/patients/${patientId}/reports`
    )
    return response.data.data
  },

  async uploadReport(
    formData: FormData,
    onUploadProgress?: (percent: number) => void
  ): Promise<MedicalReport> {
    const response = await apiClient.post<ApiResponse<MedicalReport>>('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total) {
          onUploadProgress?.(Math.round((event.loaded * 100) / event.total))
        }
      },
    })
    return response.data.data
  },

  async getReportDownloadUrl(reportId: string): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ url: string }>>(
      `/reports/${reportId}/download`
    )
    return response.data.data.url
  },
}
