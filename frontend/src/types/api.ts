export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  status: 'SUCCESS' | 'DENIED' | 'ERROR';
  ip_address?: string;
  created_at: string;
}
