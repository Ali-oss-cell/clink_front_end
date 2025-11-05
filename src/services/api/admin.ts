// Admin API service for system management
import axiosInstance from './axiosInstance';

// User Management Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'patient' | 'psychologist' | 'practice_manager' | 'admin';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  phone?: string;
  date_joined?: string;
}

export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'patient' | 'psychologist' | 'practice_manager' | 'admin';
  phone?: string;
}

export interface UpdateUserRequest {
  email?: string;
  full_name?: string;
  role?: 'patient' | 'psychologist' | 'practice_manager' | 'admin';
  is_verified?: boolean;
  is_active?: boolean;
  phone?: string;
}

// Patient Types
export interface Patient {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  user_phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
}

export interface PatientsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Patient[];
}

// Appointment Types (for admin view)
export interface AdminAppointment {
  id: number;
  patient: number;
  patient_name: string;
  psychologist: number;
  psychologist_name: string;
  service: number;
  service_name: string;
  appointment_date: string;
  formatted_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  status_display: string;
  session_type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminAppointment[];
}

// Billing Types
export interface Invoice {
  id: number;
  appointment: number;
  patient_name: string;
  psychologist_name: string;
  amount: string;
  status: string;
  created_at: string;
  due_date?: string;
}

export interface Payment {
  id: number;
  invoice: number;
  amount: string;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface MedicareClaim {
  id: number;
  invoice: number;
  patient_name: string;
  amount: string;
  status: string;
  created_at: string;
}

export interface BillingResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Admin Service Class
export class AdminService {
  // User Management
  async getAllUsers(params?: {
    role?: string;
    search?: string;
    page?: number;
    page_size?: number;
    is_verified?: boolean;
    is_active?: boolean;
  }): Promise<UsersResponse> {
    try {
      const queryParams: any = {};
      if (params?.role) queryParams.role = params.role;
      if (params?.search) queryParams.search = params.search;
      if (params?.page) queryParams.page = params.page;
      if (params?.page_size) queryParams.page_size = params.page_size;
      if (params?.is_verified !== undefined) queryParams.is_verified = params.is_verified;
      if (params?.is_active !== undefined) queryParams.is_active = params.is_active;

      const response = await axiosInstance.get('/users/', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Failed to get users:', error);
      throw new Error('Failed to load users');
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response = await axiosInstance.get(`/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user:', error);
      throw new Error('Failed to load user');
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await axiosInstance.post('/users/', userData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create user:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to create user';
      throw new Error(errorMessage);
    }
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await axiosInstance.put(`/users/${id}/`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update user:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to update user';
      throw new Error(errorMessage);
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/users/${id}/`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Patient Management
  async getAllPatients(params?: {
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PatientsResponse> {
    try {
      const queryParams: any = {};
      if (params?.search) queryParams.search = params.search;
      if (params?.page) queryParams.page = params.page;
      if (params?.page_size) queryParams.page_size = params.page_size;

      const response = await axiosInstance.get('/auth/patients/', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Failed to get patients:', error);
      throw new Error('Failed to load patients');
    }
  }

  async getPatientById(id: number): Promise<Patient> {
    try {
      const response = await axiosInstance.get(`/auth/patients/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to get patient:', error);
      throw new Error('Failed to load patient');
    }
  }

  // Appointment Management
  async getAllAppointments(params?: {
    status?: string;
    psychologist?: number;
    patient?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
  }): Promise<AppointmentsResponse> {
    try {
      const queryParams: any = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.psychologist) queryParams.psychologist = params.psychologist;
      if (params?.patient) queryParams.patient = params.patient;
      if (params?.date_from) queryParams.date_from = params.date_from;
      if (params?.date_to) queryParams.date_to = params.date_to;
      if (params?.page) queryParams.page = params.page;
      if (params?.page_size) queryParams.page_size = params.page_size;

      const response = await axiosInstance.get('/appointments/', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Failed to get appointments:', error);
      throw new Error('Failed to load appointments');
    }
  }

  // Staff Management
  async getPsychologists(params?: {
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<UsersResponse> {
    try {
      const queryParams: any = { role: 'psychologist' };
      if (params?.search) queryParams.search = params.search;
      if (params?.page) queryParams.page = params.page;
      if (params?.page_size) queryParams.page_size = params.page_size;

      const response = await axiosInstance.get('/users/', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Failed to get psychologists:', error);
      throw new Error('Failed to load psychologists');
    }
  }

  async getPracticeManagers(params?: {
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<UsersResponse> {
    try {
      const queryParams: any = { role: 'practice_manager' };
      if (params?.search) queryParams.search = params.search;
      if (params?.page) queryParams.page = params.page;
      if (params?.page_size) queryParams.page_size = params.page_size;

      const response = await axiosInstance.get('/users/', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Failed to get practice managers:', error);
      throw new Error('Failed to load practice managers');
    }
  }

  // Billing Management
  async getAllInvoices(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<BillingResponse<Invoice>> {
    try {
      const queryParams: any = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.page) queryParams.page = params.page;
      if (params?.page_size) queryParams.page_size = params.page_size;

      const response = await axiosInstance.get('/billing/invoices/', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Failed to get invoices:', error);
      throw new Error('Failed to load invoices');
    }
  }

  async getAllPayments(params?: {
    page?: number;
    page_size?: number;
  }): Promise<BillingResponse<Payment>> {
    try {
      const queryParams: any = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.page_size) queryParams.page_size = params.page_size;

      const response = await axiosInstance.get('/billing/payments/', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Failed to get payments:', error);
      throw new Error('Failed to load payments');
    }
  }

  async getAllMedicareClaims(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<BillingResponse<MedicareClaim>> {
    try {
      const queryParams: any = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.page) queryParams.page = params.page;
      if (params?.page_size) queryParams.page_size = params.page_size;

      const response = await axiosInstance.get('/billing/medicare-claims/', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Failed to get Medicare claims:', error);
      throw new Error('Failed to load Medicare claims');
    }
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await axiosInstance.get('/auth/admin/settings/');
      return response.data;
    } catch (error) {
      console.error('Failed to get system settings:', error);
      throw new Error('Failed to load system settings');
    }
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<any> {
    try {
      const response = await axiosInstance.put('/auth/admin/settings/', settings);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update system settings:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to update system settings';
      throw new Error(errorMessage);
    }
  }

  // System Analytics
  async getSystemAnalytics(params?: {
    period?: 'today' | 'week' | 'month' | 'year' | 'all';
    start_date?: string;
    end_date?: string;
  }): Promise<SystemAnalytics> {
    try {
      const queryParams: any = {};
      if (params?.period) queryParams.period = params.period;
      if (params?.start_date) queryParams.start_date = params.start_date;
      if (params?.end_date) queryParams.end_date = params.end_date;

      const response = await axiosInstance.get('/auth/admin/analytics/', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Failed to get system analytics:', error);
      throw new Error('Failed to load system analytics');
    }
  }
}

// System Settings Types
export interface SystemSettings {
  clinic: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    abn: string;
  };
  system: {
    timezone: string;
    language: string;
    gst_rate: number;
    medicare_provider_number: string;
    ahpra_registration_number: string;
  };
  notifications: {
    email_enabled: boolean;
    sms_enabled: boolean;
    whatsapp_enabled: boolean;
  };
  billing: {
    default_payment_method: string;
    invoice_terms_days: number;
    auto_generate_invoices: boolean;
  };
}

// System Analytics Types
export interface SystemAnalytics {
  period: {
    type: string;
    start_date: string;
    end_date: string;
  };
  users: {
    total: number;
    by_role: Array<{ role: string; count: number }>;
    growth: Array<{ date: string; count: number }>;
    verified_count: number;
    verification_rate: number;
  };
  appointments: {
    total: number;
    by_status: Array<{ status: string; count: number }>;
    by_type: Array<{ session_type: string; count: number }>;
    trends: Array<{ date: string; count: number }>;
  };
  financial: {
    total_revenue: number;
    total_invoices: number;
    paid_invoices: number;
    pending_invoices: number;
    total_medicare_claims: number;
  };
  progress_notes: {
    total: number;
    average_rating: number;
  };
  performance: {
    active_patients: number;
    total_users: number;
    verification_rate: number;
  };
}

// Export singleton instance
export const adminService = new AdminService();

