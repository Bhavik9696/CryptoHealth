import apiClient from './api'
import type { Share, CreateSharePayload } from '@/types/sharing'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface SharedReportAccess {
  grant: {
    id: string
    reportId: string
    scope: 'view' | 'download'
    expiresAt: string
    useCount: number
    maxUses: number | null
  }
  report: {
    id: string
    report_type: string
    title?: string
    file_name: string
    file_size?: number
    mime_type?: string
    status: string
    uploaded_at: string
  }
}

export const sharingService = {
  async getShares(params?: Record<string, unknown>): Promise<PaginatedResponse<Share>> {
    const response = await apiClient.get('/sharing', { params })
    return response.data
  },

  async getShare(shareId: string): Promise<Share> {
    const response = await apiClient.get<ApiResponse<Share>>(`/sharing/${shareId}`)
    return response.data.data
  },

  async createShare(payload: CreateSharePayload): Promise<Share> {
    const response = await apiClient.post<ApiResponse<Share>>('/sharing', payload)
    return response.data.data
  },

  async revokeShare(shareId: string): Promise<void> {
    await apiClient.post(`/sharing/${shareId}/revoke`)
  },

  async validateShare(token: string): Promise<SharedReportAccess> {
    const response = await apiClient.post<ApiResponse<SharedReportAccess>>('/sharing/validate', { token })
    return response.data.data
  },

  async getSharedFileUrl(token: string): Promise<string> {
    const response = await apiClient.get<Blob>(`/sharing/${token}/file`, { responseType: 'blob' })
    return URL.createObjectURL(response.data)
  },
}
