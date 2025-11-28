import { authService } from './auth';
import axiosInstance from './axiosInstance';

// Intake form data interface matching backend serializer exactly
export interface IntakeFormData {
  // Required fields
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string; // YYYY-MM-DD
  address_line_1: string;
  suburb: string;
  state: "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT";
  postcode: string; // 4 digits
  
  // Optional personal details
  preferred_name?: string;
  gender_identity?: string;
  pronouns?: string;
  home_phone?: string;
  medicare_number?: string;
  email?: string; // Read-only from registration
  
  // Emergency contact
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  
  // Referral information
  referral_source?: string;
  has_gp_referral?: boolean;
  gp_name?: string;
  gp_practice_name?: string;
  gp_provider_number?: string;
  gp_address?: string;
  
  // Medical history
  previous_therapy?: boolean;
  previous_therapy_details?: string;
  current_medications?: boolean;
  medication_list?: string;
  other_health_professionals?: boolean;
  other_health_details?: string;
  medical_conditions?: boolean;
  medical_conditions_details?: string;
  
  // Presenting concerns
  presenting_concerns?: string;
  therapy_goals?: string;
  
  // Consent fields (REQUIRED for treatment)
  consent_to_treatment: boolean;
  consent_to_telehealth?: boolean;
  telehealth_emergency_protocol_acknowledged?: boolean;
  telehealth_tech_requirements_acknowledged?: boolean;
  telehealth_recording_consent?: boolean;
  privacy_policy_accepted: boolean;
  consent_to_data_sharing?: boolean;
  consent_to_marketing?: boolean;
  
  // Communication preferences
  email_notifications_enabled?: boolean;
  sms_notifications_enabled?: boolean;
  appointment_reminders_enabled?: boolean;
  
  // Privacy preferences
  share_progress_with_emergency_contact?: boolean;
  
  // Parental consent (for minors under 18)
  parental_consent?: boolean;
  parental_consent_name?: string;
  parental_consent_signature?: string;
  
  // Completion flag
  intake_completed?: boolean;
  
  // Legacy fields (for backward compatibility)
  client_signature?: string;
  consent_date?: string;
}

// Intake form service with API integration
export const intakeService = {
  // Get intake form data (pre-filled from backend)
  getIntakeForm: async (): Promise<IntakeFormData> => {
    try {
      // Try /api/auth/intake-form/ first (preferred), fallback to /api/users/intake-form/
      let response;
      try {
        response = await axiosInstance.get('/auth/intake-form/');
      } catch (authError: any) {
        if (authError.response?.status === 404) {
          // Fallback to /users/intake-form/ if /auth/ doesn't exist
          response = await axiosInstance.get('/users/intake-form/');
        } else {
          throw authError;
        }
      }
      return response.data;
    } catch (error) {
      console.error('Failed to get intake form:', error);
      throw new Error('Failed to load intake form data');
    }
  },

  // Submit intake form data (PUT preferred, POST also supported)
  submitIntakeForm: async (data: IntakeFormData): Promise<{ message: string; intake_completed: boolean }> => {
    try {
      // Mark as completed when submitting
      const submitData = {
        ...data,
        intake_completed: true
      };
      
      // Try PUT /api/auth/intake-form/ first (preferred)
      let response;
      try {
        response = await axiosInstance.put('/auth/intake-form/', submitData);
      } catch (putError: any) {
        if (putError.response?.status === 404 || putError.response?.status === 405) {
          // Fallback to POST /api/users/intake-form/ if PUT doesn't work
          response = await axiosInstance.post('/users/intake-form/', submitData);
        } else {
          throw putError;
        }
      }
      
      console.log('Intake form submitted:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to submit intake form:', error);
      const errorMessage = error.response?.data?.message 
        || (error.response?.data && typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data) 
          : 'Failed to submit intake form data');
      throw new Error(errorMessage);
    }
  },

  // Save draft (partial update without marking as completed)
  saveDraft: async (data: Partial<IntakeFormData>): Promise<IntakeFormData> => {
    try {
      // Try PUT /api/auth/intake-form/ first (preferred)
      let response;
      try {
        response = await axiosInstance.put('/auth/intake-form/', data);
      } catch (putError: any) {
        if (putError.response?.status === 404 || putError.response?.status === 405) {
          // Fallback to POST /api/users/intake-form/ if PUT doesn't work
          response = await axiosInstance.post('/users/intake-form/', data);
        } else {
          throw putError;
        }
      }
      return response.data;
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      throw new Error(error.response?.data?.message || 'Failed to save draft');
    }
  },

  // Get intake form data (local storage fallback)
  getIntakeFormData: (): IntakeFormData | null => {
    try {
      const storedData = localStorage.getItem('intake_form_data');
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('Failed to get intake form data:', error);
      return null;
    }
  },

  // Check if intake form is completed
  isIntakeFormCompleted: (): boolean => {
    const data = intakeService.getIntakeFormData();
    return !!(data && data.consent_to_treatment);
  },

  // Get medical information for account page
  getMedicalInfo: () => {
    const data = intakeService.getIntakeFormData();
    if (!data) return null;

    return {
      currentMedications: data.medication_list || 'Not provided',
      medicalConditions: data.medical_conditions_details || 'Not provided',
      previousTherapy: data.previous_therapy_details || 'Not provided',
      otherHealthProfessionals: data.other_health_details || 'Not provided',
      gpContact: data.gp_name && data.gp_practice_name 
        ? `${data.gp_name} - ${data.gp_practice_name}` 
        : 'Not provided',
      presentingConcerns: data.presenting_concerns || 'Not provided',
      therapyGoals: data.therapy_goals || 'Not provided'
    };
  },

  // Get personal information for account page
  getPersonalInfo: () => {
    const data = intakeService.getIntakeFormData();
    const user = authService.getStoredUser();
    
    if (!data && !user) return null;

    return {
      fullName: data?.first_name && data?.last_name 
        ? `${data.first_name} ${data.last_name}` 
        : `${user?.first_name} ${user?.last_name}` || 'Not provided',
      preferredName: data?.preferred_name || 'Not provided',
      email: user?.email || data?.email || 'Not provided',
      phone: user?.phone_number || data?.phone_number || 'Not provided',
      dateOfBirth: data?.date_of_birth || user?.date_of_birth || 'Not provided',
      genderIdentity: data?.gender_identity || 'Not provided',
      pronouns: data?.pronouns || 'Not provided',
      address: data?.address_line_1 ? `${data.address_line_1}, ${data.suburb} ${data.postcode}` : 'Not provided',
      emergencyContact: data?.emergency_contact_name && data?.emergency_contact_phone 
        ? `${data.emergency_contact_name} (${data.emergency_contact_relationship}) - ${data.emergency_contact_phone}` 
        : 'Not provided'
    };
  },

  // Get pre-filled data for intake form (matching API structure)
  getPreFilledData: (): Partial<IntakeFormData> => {
    const user = authService.getStoredUser();
    if (!user) return {};

    // Calculate age for parental consent check
    const age = user.date_of_birth ? 
      Math.floor((new Date().getTime() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
      null;
    const isMinor = age !== null && age < 18;

    return {
      // Required fields - pre-filled from registration
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
      date_of_birth: user.date_of_birth || '',
      address_line_1: user.address_line_1 || '',
      suburb: user.suburb || '',
      state: (user.state as any) || '',
      postcode: user.postcode || '',
      
      // Optional personal details
      email: user.email,
      preferred_name: '',
      gender_identity: '',
      pronouns: '',
      home_phone: '',
      medicare_number: user.medicare_number || '',
      
      // Emergency contact
      emergency_contact_name: '',
      emergency_contact_relationship: '',
      emergency_contact_phone: '',
      
      // Referral information
      referral_source: '',
      has_gp_referral: false,
      gp_name: '',
      gp_practice_name: '',
      gp_provider_number: '',
      gp_address: '',
      
      // Medical history
      previous_therapy: false,
      previous_therapy_details: '',
      current_medications: false,
      medication_list: '',
      other_health_professionals: false,
      other_health_details: '',
      medical_conditions: false,
      medical_conditions_details: '',
      
      // Presenting concerns
      presenting_concerns: '',
      therapy_goals: '',
      
      // Consent fields (defaults)
      consent_to_treatment: false,
      consent_to_telehealth: false,
      telehealth_emergency_protocol_acknowledged: false,
      telehealth_tech_requirements_acknowledged: false,
      telehealth_recording_consent: false,
      privacy_policy_accepted: false,
      consent_to_data_sharing: false,
      consent_to_marketing: false,
      
      // Communication preferences (defaults)
      email_notifications_enabled: true,
      sms_notifications_enabled: false,
      appointment_reminders_enabled: true,
      
      // Privacy preferences
      share_progress_with_emergency_contact: false,
      
      // Parental consent (if minor)
      parental_consent: isMinor ? false : undefined,
      parental_consent_name: '',
      parental_consent_signature: '',
      
      // Completion flag
      intake_completed: false
    };
  }
};
