import apiClient from './api'
import type { VerificationResult } from '@/types/report'
import type { ApiResponse } from '@/types/api'

export const verificationService = {
  async verifyReport(reportId: string): Promise<VerificationResult> {
    const response = await apiClient.post<ApiResponse<VerificationResult>>(
      `/verification/reports/${reportId}`
    )
    return response.data.data
  },

  async getVerificationStatus(reportId: string): Promise<VerificationResult> {
    const response = await apiClient.get<ApiResponse<VerificationResult>>(
      `/verification/reports/${reportId}`
    )
    return response.data.data
  },
}
