import apiClient from './api'
import type { Share, CreateSharePayload } from '@/types/sharing'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

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

  async validateShare(token: string): Promise<Share> {
    const response = await apiClient.post<ApiResponse<Share>>('/sharing/validate', { token })
    return response.data.data
  },
}
