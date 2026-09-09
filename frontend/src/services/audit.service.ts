import apiClient from './api'
import type { AuditLog } from '@/types/api'
import type { PaginatedResponse } from '@/types/api'

export const auditService = {
  async getLogs(params?: Record<string, unknown>): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get('/audit/logs', { params })
    return response.data
  },
}
