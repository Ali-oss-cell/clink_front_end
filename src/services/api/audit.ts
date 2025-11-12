// Audit Logs API service
import axiosInstance from './axiosInstance';

export interface AuditLog {
  id: number;
  timestamp: string;
  user: number | null;
  user_email: string | null;
  user_role: string | null;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'download' | 'export';
  action_display: string;
  content_type: number | null;
  content_type_name: string | null;
  object_id: number | null;
  object_repr: string;
  changes: {
    [key: string]: {
      old: any;
      new: any;
    };
  };
  ip_address: string | null;
  user_agent: string | null;
  request_path: string | null;
  request_method: string | null;
  metadata: Record<string, any>;
}

export interface AuditLogStats {
  total_logs: number;
  recent_logs_30_days: number;
  actions_by_type: Record<string, number>;
  actions_by_role: Record<string, number>;
}

export interface AuditLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

export interface AuditLogsParams {
  action?: string;
  user_role?: string;
  user_id?: number;
  start_date?: string;
  end_date?: string;
  content_type?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

class AuditService {
  // Get all audit logs with filters
  async getAuditLogs(params?: AuditLogsParams): Promise<AuditLogsResponse> {
    try {
      const queryParams: any = {};
      if (params?.action) queryParams.action = params.action;
      if (params?.user_role) queryParams.user_role = params.user_role;
      if (params?.user_id) queryParams.user_id = params.user_id;
      if (params?.start_date) queryParams.start_date = params.start_date;
      if (params?.end_date) queryParams.end_date = params.end_date;
      if (params?.content_type) queryParams.content_type = params.content_type;
      if (params?.search) queryParams.search = params.search;
      if (params?.ordering) queryParams.ordering = params.ordering;
      if (params?.page) queryParams.page = params.page;
      if (params?.page_size) queryParams.page_size = params.page_size;

      const response = await axiosInstance.get('/audit/logs/', { params: queryParams });
      return response.data;
    } catch (error: any) {
      console.error('Failed to get audit logs:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load audit logs');
    }
  }

  // Get single audit log by ID
  async getAuditLog(id: number): Promise<AuditLog> {
    try {
      const response = await axiosInstance.get(`/audit/logs/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get audit log:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load audit log');
    }
  }

  // Get audit log statistics
  async getAuditLogStats(): Promise<AuditLogStats> {
    try {
      const response = await axiosInstance.get('/audit/logs/stats/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get audit log stats:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load audit log statistics');
    }
  }
}

// Export singleton instance
export const auditService = new AuditService();

