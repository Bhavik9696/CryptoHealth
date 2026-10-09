import apiClient from './api'
import type { MedicalReport } from '@/types/report'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export const reportService = {
  async getReports(params?: Record<string, unknown>): Promise<{ data: MedicalReport[]; total: number; page: number; limit: number; totalPages: number }> {
    const response = await apiClient.get('/reports', { params })
    // Backend returns: { success, message, data: { reports: [...], pagination: {...} } }
    const body = response.data
    const inner = body?.data ?? {}
    return {
      data: inner.reports ?? [],
      total: inner.pagination?.total ?? 0,
      page: inner.pagination?.page ?? 1,
      limit: inner.pagination?.limit ?? 20,
      totalPages: inner.pagination?.totalPages ?? 1,
    }
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
    // The API streams the authorized, decrypted file (not a public storage URL).
    // Fetch with the Bearer token and create a temporary browser-only object URL.
    const response = await apiClient.get<Blob>(`/reports/${reportId}/file`, {
      responseType: 'blob',
    })
    return URL.createObjectURL(response.data)
  },

  async downloadReport(reportId: string, fileName: string): Promise<void> {
    const response = await apiClient.get<Blob>(`/reports/${reportId}/file`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(response.data)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName || 'medical-report'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  },
}
