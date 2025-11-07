// Admin API service for system management
import axiosInstance from './axiosInstance';

// User Management Types
export interface PsychologistProfile {
  id?: number;
  ahpra_registration_number?: string;
  ahpra_expiry_date?: string;
  title?: string;
  qualifications?: string;
  years_experience?: number;
  consultation_fee?: string;
  medicare_provider_number?: string;
  bio?: string;
  is_accepting_new_patients?: boolean;
  specializations?: Array<{ id: number; name: string }> | number[];
  services_offered?: Array<{ id: number; name: string }> | number[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  role: 'patient' | 'psychologist' | 'practice_manager' | 'admin';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  phone?: string; // Legacy field
  phone_number?: string; // API field name
  date_of_birth?: string;
  date_joined?: string;
  username?: string;
  psychologist_profile?: PsychologistProfile; // Included when role is psychologist
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
  full_name: string; // Required - will be split into first_name/last_name
  role: 'psychologist' | 'practice_manager' | 'admin'; // Note: patient role not supported by this endpoint
  phone_number?: string; // Australian format (+61XXXXXXXXX or 0XXXXXXXXX)
  
  // Psychologist-specific fields (required when role is 'psychologist')
  ahpra_registration_number?: string; // Required for psychologists
  ahpra_expiry_date?: string; // Required for psychologists (YYYY-MM-DD)
  title?: string; // Dr, Mr, Ms, Mrs - default: "Dr"
  qualifications?: string;
  years_experience?: number; // Default: 0
  consultation_fee?: string; // Decimal as string, default: "180.00"
  medicare_provider_number?: string;
  bio?: string;
  is_accepting_new_patients?: boolean; // Default: true
  specializations?: number[]; // Array of specialization IDs
  services_offered?: number[]; // Array of service IDs
}

export interface CreateUserResponse {
  message: string;
  user: User;
}

export interface UpdateUserRequest {
  // Basic user fields
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role?: 'patient' | 'psychologist' | 'practice_manager' | 'admin';
  is_verified?: boolean;
  is_active?: boolean;
  phone_number?: string; // API expects phone_number, not phone
  date_of_birth?: string;
  
  // Psychologist profile fields (when role is psychologist)
  ahpra_registration_number?: string;
  ahpra_expiry_date?: string; // YYYY-MM-DD format
  title?: string; // Dr, Mr, Ms, Mrs
  qualifications?: string;
  years_experience?: number;
  consultation_fee?: string; // Decimal as string
  medicare_provider_number?: string;
  bio?: string;
  is_accepting_new_patients?: boolean;
  specializations?: number[]; // Array of specialization IDs
  services_offered?: number[]; // Array of service IDs
}

// Patient Types
export interface Patient {
  id: number;
  // Name fields (API returns both snake_case and camelCase)
  name?: string;
  fullName?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  // Contact fields
  email?: string;
  emailAddress?: string;
  phone?: string;
  phone_number?: string;
  // Personal info
  date_of_birth?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  gender_identity?: string;
  // Status and metadata
  intake_completed?: boolean;
  status?: string;
  is_verified?: boolean;
  // Session statistics
  total_sessions?: number;
  totalSessions?: number;
  completed_sessions?: number;
  completedSessions?: number;
  upcoming_sessions?: number;
  upcomingSessions?: number;
  progress_notes_count?: number;
  last_progress_rating?: number;
  lastProgressRating?: number;
  average_progress_rating?: number;
  averageProgressRating?: number;
  // Appointment dates
  last_appointment?: string;
  lastAppointment?: string;
  last_session_date?: string;
  lastSessionDate?: string;
  next_appointment?: string;
  nextAppointment?: string;
  // Therapy info
  therapy_goals?: string;
  therapyFocus?: string;
  presenting_concerns?: string;
  // Dates
  registered_date?: string;
  registeredDate?: string;
  created_at?: string;
  // Legacy fields (for backward compatibility)
  user?: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface PatientsResponse {
  count: number;
  total_count?: number;
  next: string | null;
  previous: string | null;
  results: Patient[];
  filters_applied?: {
    search?: string;
    status?: string;
    sort?: string;
  };
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
    ordering?: string; // e.g., 'created_at', '-created_at', 'email', '-email'
  }): Promise<UsersResponse> {
    try {
      const queryParams: any = {};
      if (params?.role) queryParams.role = params.role;
      if (params?.search) queryParams.search = params.search;
      if (params?.page) queryParams.page = params.page;
      if (params?.page_size) queryParams.page_size = params.page_size;
      if (params?.is_verified !== undefined) queryParams.is_verified = params.is_verified;
      if (params?.is_active !== undefined) queryParams.is_active = params.is_active;
      if (params?.ordering) queryParams.ordering = params.ordering;

      const response = await axiosInstance.get('/users/', { params: queryParams });
      return response.data;
    } catch (error: any) {
      console.error('Failed to get users:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to load users';
      throw new Error(errorMessage);
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

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      // Clean up the data: remove empty strings and undefined values
      const cleanedData: any = {
        email: userData.email.trim(),
        password: userData.password,
        full_name: userData.full_name.trim(),
        role: userData.role
      };

      // Only include optional fields if they have values
      if (userData.phone_number && userData.phone_number.trim()) {
        cleanedData.phone_number = userData.phone_number.trim();
      }

      // Add psychologist-specific fields if role is psychologist
      if (userData.role === 'psychologist') {
        // Required fields for psychologists
        if (userData.ahpra_registration_number) {
          cleanedData.ahpra_registration_number = userData.ahpra_registration_number.trim();
        }
        if (userData.ahpra_expiry_date) {
          cleanedData.ahpra_expiry_date = userData.ahpra_expiry_date;
        }
        
        // Optional psychologist fields
        if (userData.title && userData.title.trim()) {
          cleanedData.title = userData.title.trim();
        }
        if (userData.qualifications && userData.qualifications.trim()) {
          cleanedData.qualifications = userData.qualifications.trim();
        }
        if (userData.years_experience !== undefined) {
          cleanedData.years_experience = userData.years_experience;
        }
        if (userData.consultation_fee) {
          cleanedData.consultation_fee = userData.consultation_fee;
        }
        if (userData.medicare_provider_number && userData.medicare_provider_number.trim()) {
          cleanedData.medicare_provider_number = userData.medicare_provider_number.trim();
        }
        if (userData.bio && userData.bio.trim()) {
          cleanedData.bio = userData.bio.trim();
        }
        if (userData.is_accepting_new_patients !== undefined) {
          cleanedData.is_accepting_new_patients = userData.is_accepting_new_patients;
        }
        if (userData.specializations && userData.specializations.length > 0) {
          cleanedData.specializations = userData.specializations;
        }
        if (userData.services_offered && userData.services_offered.length > 0) {
          cleanedData.services_offered = userData.services_offered;
        }
      }

      // Use the new admin-specific endpoint
      const response = await axiosInstance.post('/auth/admin/create-user/', cleanedData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create user:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to create user';
      throw new Error(errorMessage);
    }
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      // Clean up the data: remove empty strings and undefined values
      const cleanedData: any = {};

      // Basic user fields
      if (userData.email !== undefined) cleanedData.email = userData.email.trim();
      if (userData.full_name !== undefined) cleanedData.full_name = userData.full_name.trim();
      if (userData.first_name !== undefined) cleanedData.first_name = userData.first_name.trim();
      if (userData.last_name !== undefined) cleanedData.last_name = userData.last_name.trim();
      if (userData.role !== undefined) cleanedData.role = userData.role;
      if (userData.is_verified !== undefined) cleanedData.is_verified = userData.is_verified;
      if (userData.is_active !== undefined) cleanedData.is_active = userData.is_active;
      if (userData.phone_number !== undefined && userData.phone_number.trim()) {
        cleanedData.phone_number = userData.phone_number.trim();
      }
      if (userData.date_of_birth !== undefined) cleanedData.date_of_birth = userData.date_of_birth;

      // Psychologist profile fields (only include if provided)
      if (userData.ahpra_registration_number !== undefined) {
        cleanedData.ahpra_registration_number = userData.ahpra_registration_number.trim();
      }
      if (userData.ahpra_expiry_date !== undefined) {
        cleanedData.ahpra_expiry_date = userData.ahpra_expiry_date;
      }
      if (userData.title !== undefined) cleanedData.title = userData.title.trim();
      if (userData.qualifications !== undefined) cleanedData.qualifications = userData.qualifications.trim();
      if (userData.years_experience !== undefined) cleanedData.years_experience = userData.years_experience;
      if (userData.consultation_fee !== undefined) cleanedData.consultation_fee = userData.consultation_fee;
      if (userData.medicare_provider_number !== undefined) {
        cleanedData.medicare_provider_number = userData.medicare_provider_number.trim();
      }
      if (userData.bio !== undefined) cleanedData.bio = userData.bio.trim();
      if (userData.is_accepting_new_patients !== undefined) {
        cleanedData.is_accepting_new_patients = userData.is_accepting_new_patients;
      }
      if (userData.specializations !== undefined) cleanedData.specializations = userData.specializations;
      if (userData.services_offered !== undefined) cleanedData.services_offered = userData.services_offered;

      const response = await axiosInstance.put(`/users/${id}/`, cleanedData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update user:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to update user';
      throw new Error(errorMessage);
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/users/${id}/`);
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to delete user';
      throw new Error(errorMessage);
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
    } catch (error: any) {
      console.error('Failed to get system analytics:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to load system analytics';
      throw new Error(errorMessage);
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
    verification_rate: number | null; // Can be null
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
    average_rating: number | null; // Can be null if no ratings yet
  };
  performance: {
    active_patients: number;
    total_users: number;
    verification_rate: number | null; // Can be null
  };
}

// Export singleton instance
export const adminService = new AdminService();

