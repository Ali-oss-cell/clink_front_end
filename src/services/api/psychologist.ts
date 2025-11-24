// Psychologist API service for profile management
import axiosInstance from './axiosInstance';

export interface PsychologistProfile {
  id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_gender?: string;
  display_name: string;
  
  // Profile Image Fields
  profile_image: string | null;
  profile_image_url: string | null;
  has_profile_image: boolean;
  
  // Availability
  next_available_slot?: string | null;
  
  ahpra_registration_number: string;
  ahpra_expiry_date: string;
  is_ahpra_current: boolean;
  title: string;
  qualifications: string;
  years_experience: number;
  experience_level: string;
  
  consultation_fee: string;
  medicare_rebate_amount: string;
  patient_cost_after_rebate: string;
  is_accepting_new_patients: boolean;
  
  practice_name: string;
  practice_address: string;
  practice_phone: string;
  practice_email: string;
  personal_website: string;
  
  languages_spoken: string;
  languages_list: string[];
  session_types: string;
  session_types_list: string[];
  
  insurance_providers: string;
  insurance_providers_list: string[];
  billing_methods: string;
  
  working_hours: string;
  working_days: string[];
  start_time: string;
  end_time: string;
  session_duration_minutes: number;
  break_between_sessions_minutes: number;
  telehealth_available: boolean;
  in_person_available: boolean;
  
  total_patients_seen: number;
  currently_active_patients: number;
  sessions_completed: number;
  average_rating: string;
  total_reviews: number;
  is_highly_rated: boolean;
  
  bio: string;
  specializations_list: Array<{ id: number; name: string; description: string; is_active: boolean }>;
  services_list: Array<{ id: number; name: string; description: string; standard_fee: string; duration_minutes: number; is_active: boolean }>;
  max_patients_per_day?: number;
  is_active_practitioner?: boolean;
}

export interface PsychologistDashboard {
  profile: PsychologistProfile;
  today_appointments: number;
  total_patients: number;
  pending_notes: number;
  upcoming_sessions: any[];
  recent_notes: any[];
}

// Psychologist service class
export class PsychologistService {

  // Get all psychologists (for patient selection)
  async getAllPsychologists(): Promise<PsychologistProfile[]> {
    try {
      // Try different endpoint patterns - backend may use /services/psychologists/ instead of /auth/psychologists/
      let response;
      let data;
      
      try {
        // First try /services/psychologists/ (matches other psychologist endpoints)
        response = await axiosInstance.get('/services/psychologists/');
        data = response.data;
      } catch (firstError: any) {
        // If 404, try /auth/psychologists/ as fallback
        if (firstError.response?.status === 404) {
          console.log('Trying alternative endpoint: /auth/psychologists/');
          response = await axiosInstance.get('/auth/psychologists/');
          data = response.data;
        } else {
          throw firstError;
        }
      }
      
      // Handle different response formats dynamically
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.results)) {
          return data.results;
        } else if (Array.isArray(data.data)) {
          return data.data;
        } else if (Array.isArray(data.items)) {
          return data.items;
        }
      }
      
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error('Failed to load psychologists:', error);
      throw error;
    }
  }

  // Get specific psychologist profile
  async getPsychologistProfile(id: number): Promise<PsychologistProfile> {
    try {
      const response = await axiosInstance.get(`/services/psychologists/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to get psychologist profile:', error);
      throw new Error('Failed to load psychologist profile');
    }
  }

  // Get current psychologist's own profile
  async getMyProfile(): Promise<PsychologistProfile> {
    try {
      const response = await axiosInstance.get('/services/psychologists/my_profile/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get my profile:', error);
      throw new Error(`Failed to load my profile: ${error.response?.status || 'Unknown error'}`);
    }
  }

  // Update psychologist profile
  async updateProfile(id: number, profileData: Partial<PsychologistProfile>): Promise<PsychologistProfile> {
    try {
      const response = await axiosInstance.put(`/services/psychologists/${id}/`, profileData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      throw new Error(`Failed to update profile: ${error.response?.data?.message || 'Unknown error'}`);
    }
  }

  // Upload profile image
  async uploadProfileImage(id: number, imageFile: File): Promise<{ image_url: string }> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await axiosInstance.post(`/services/psychologists/${id}/upload_image/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Get psychologist dashboard data
  async getDashboard(): Promise<PsychologistDashboard> {
    try {
      const response = await axiosInstance.get('/auth/dashboard/psychologist/');
      return response.data;
    } catch (error) {
      console.error('Failed to get dashboard:', error);
      throw new Error('Failed to load dashboard');
    }
  }

  // Get psychologist appointments
  async getAppointments(): Promise<any[]> {
    try {
      const response = await axiosInstance.get('/appointments/appointments/');
      return response.data;
    } catch (error) {
      console.error('Failed to get appointments:', error);
      throw new Error('Failed to load appointments');
    }
  }
}

// Export singleton instance
export const psychologistService = new PsychologistService();
