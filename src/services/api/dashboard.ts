// Dashboard service for role-based dashboard data

// Dashboard data interfaces
export interface PatientDashboard {
  next_appointment: any;
  total_sessions: number;
  intake_completed: boolean;
  outstanding_invoices: number;
  recent_progress: any[];
}

export interface PsychologistDashboard {
  today_appointments: number;
  total_patients: number;
  pending_notes: number;
  upcoming_sessions: any[];
  recent_notes: any[];
}

export interface PracticeManagerDashboard {
  user: any;
  staff: any[];
  patients: any[];
  appointments: any[];
  billing: any;
  analytics: any;
}

export interface AdminDashboard {
  user: any;
  users: any[];
  system_stats: any;
  analytics: any;
  settings: any;
}

// Dashboard service class
export class DashboardService {
  private baseURL = 'http://127.0.0.1:8000/api';

  // Get patient dashboard data
  async getPatientDashboard(): Promise<PatientDashboard> {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${this.baseURL}/auth/dashboard/patient/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load patient dashboard');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to get patient dashboard:', error);
      throw new Error('Failed to load patient dashboard');
    }
  }

  // Get psychologist dashboard data
  async getPsychologistDashboard(): Promise<PsychologistDashboard> {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${this.baseURL}/auth/dashboard/psychologist/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load psychologist dashboard');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to get psychologist dashboard:', error);
      throw new Error('Failed to load psychologist dashboard');
    }
  }

  // Get practice manager dashboard data
  async getPracticeManagerDashboard(): Promise<PracticeManagerDashboard> {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${this.baseURL}/auth/dashboard/practice-manager/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load practice manager dashboard');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to get practice manager dashboard:', error);
      throw new Error('Failed to load practice manager dashboard');
    }
  }

  // Get admin dashboard data
  async getAdminDashboard(): Promise<AdminDashboard> {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${this.baseURL}/auth/dashboard/admin/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load admin dashboard');
      }
      
      return response.json();
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
