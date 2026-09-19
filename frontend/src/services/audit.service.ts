import apiClient from './api'
import type { AuditLog } from '@/types/api'
import type { PaginatedResponse } from '@/types/api'

export const auditService = {
  async getLogs(params?: Record<string, unknown>): Promise<PaginatedResponse<AuditLog>> {
    try {
      const response = await apiClient.get('/audit/logs', { params })
      return response.data
    } catch {
      // Phase 7 (Audit Logging API) is not yet implemented.
      // Return an empty list so the Dashboard does not crash.
      return { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
    }
  },
}
