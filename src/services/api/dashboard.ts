// Dashboard service for role-based dashboard data
import axiosInstance from './axiosInstance';

// Dashboard data interfaces
export interface PatientDashboard {
  next_appointment: any;
  total_sessions: number;
  intake_completed: boolean;
  outstanding_invoices: number;
  recent_progress: any[];
}

export interface RecentNote {
  id: number;
  patient_name: string;
  session_number: number;
  session_date: string;
  progress_rating: number | null;
  created_at: string;
}

export interface DashboardStats {
  total_appointments_this_month: number;
  average_rating: number;
  sessions_completed_this_week: number;
}

export interface PsychologistDashboard {
  today_appointments_count: number;
  upcoming_appointments_this_week: number;
  recent_notes: RecentNote[];
  active_patients_count: number;
  total_patients_count: number;
  pending_notes_count: number;
  completed_sessions_today: number;
  stats: DashboardStats;
}

// Practice Manager Dashboard Types
export interface PracticeManagerStats {
  today_appointments: number;
  this_week_appointments: number;
  this_month_appointments: number;
  completed_sessions_today: number;
  cancelled_appointments_today: number;
  total_patients: number;
  active_patients: number;
  new_patients_this_month: number;
  total_psychologists: number;
  total_practice_managers: number;
  today_revenue: number;
  this_week_revenue: number;
  this_month_revenue: number;
  total_revenue: number;
  pending_invoices: number;
}

export interface PracticeManagerAppointment {
  id: number;
  patient_name: string;
  psychologist_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_type?: string;
}

export interface TopPsychologist {
  id: number;
  name: string;
  appointment_count: number;
  rating?: number;
}

export interface PracticeManagerDashboard {
  stats: PracticeManagerStats;
  recent_appointments: PracticeManagerAppointment[];
  upcoming_appointments: PracticeManagerAppointment[];
  top_psychologists: TopPsychologist[];
  recent_invoices?: any[];
}

// Admin Dashboard Types
export interface AdminStats {
  total_users: number;
  total_patients: number;
  total_psychologists: number;
  total_practice_managers: number;
  total_admins: number;
  new_users_this_month: number;
  new_patients_this_month: number;
  new_psychologists_this_month: number;
  verified_users: number;
  unverified_users: number;
  total_appointments: number;
  completed_appointments: number;
  scheduled_appointments: number;
  cancelled_appointments: number;
  total_progress_notes: number;
  total_invoices: number;
  total_revenue: number;
  total_medicare_claims: number;
}

export interface SystemHealth {
  status: string;
  total_users: number;
  total_appointments: number;
  active_patients: number;
  verified_users_percentage: number;
}

export interface RecentUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export interface AdminDashboard {
  stats: AdminStats;
  system_health: SystemHealth;
  recent_users: RecentUser[];
}

// Dashboard service class
export class DashboardService {
  // Get patient dashboard data
  async getPatientDashboard(): Promise<PatientDashboard> {
    try {
      const response = await axiosInstance.get('/auth/dashboard/patient/');
      return response.data;
    } catch (error) {
      console.error('Failed to get patient dashboard:', error);
      throw new Error('Failed to load patient dashboard');
    }
  }

  // Get psychologist dashboard data
  async getPsychologistDashboard(): Promise<PsychologistDashboard> {
    try {
      const response = await axiosInstance.get('/auth/psychologist/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Failed to get psychologist dashboard:', error);
      throw new Error('Failed to load psychologist dashboard');
    }
  }

  // Get practice manager dashboard data
  async getPracticeManagerDashboard(): Promise<PracticeManagerDashboard> {
    try {
      const response = await axiosInstance.get('/auth/dashboard/practice-manager/');
      return response.data;
    } catch (error) {
      console.error('Failed to get practice manager dashboard:', error);
      throw new Error('Failed to load practice manager dashboard');
    }
  }

  // Get admin dashboard data
  async getAdminDashboard(): Promise<AdminDashboard> {
    try {
      const response = await axiosInstance.get('/auth/dashboard/admin/');
      return response.data;
    } catch (error) {
      console.error('Failed to get admin dashboard:', error);
      throw new Error('Failed to load admin dashboard');
    }
  }

  // Get role-based dashboard data
  async getDashboardData(userRole: string): Promise<any> {
    switch (userRole) {
      case 'patient':
        return this.getPatientDashboard();
      case 'psychologist':
        return this.getPsychologistDashboard();
      case 'practice_manager':
        return this.getPracticeManagerDashboard();
      case 'admin':
        return this.getAdminDashboard();
      default:
        throw new Error('Invalid user role');
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
