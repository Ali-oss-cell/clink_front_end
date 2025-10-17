import { authService } from './auth';

// Intake form data interface matching backend serializer exactly
export interface IntakeFormData {
  // Pre-filled from login (10 fields)
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  address_line_1: string;
  suburb: string;
  state: string;
  postcode: string;
  medicare_number: string;
  
  // User must complete (26 fields)
  preferred_name?: string;
  gender_identity?: string;
  pronouns?: string;
  home_phone?: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  referral_source: string;
  has_gp_referral: boolean;
  gp_name?: string;
  gp_practice_name?: string;
  gp_provider_number?: string;
  gp_address?: string;
  previous_therapy: boolean;
  previous_therapy_details?: string;
  current_medications: boolean;
  medication_list?: string;
  other_health_professionals: boolean;
  other_health_details?: string;
  medical_conditions: boolean;
  medical_conditions_details?: string;
  presenting_concerns: string;
  therapy_goals: string;
  consent_to_treatment: boolean;
  consent_to_telehealth: boolean;
  client_signature: string;
  consent_date: string;
}

// Intake form service with API integration
export const intakeService = {
  // Get intake form data (pre-filled from backend)
  getIntakeForm: async (): Promise<IntakeFormData> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/users/intake-form/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load intake form data');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to get intake form:', error);
      throw new Error('Failed to load intake form data');
    }
  },

  // Submit intake form data
  submitIntakeForm: async (data: IntakeFormData): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/users/intake-form/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit intake form');
      }
      
      const result = await response.json();
      console.log('Intake form submitted:', result);
    } catch (error) {
      console.error('Failed to submit intake form:', error);
      throw new Error('Failed to submit intake form data');
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

    return {
      // Pre-filled from login (10 fields)
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      date_of_birth: user.date_of_birth,
      address_line_1: user.address_line_1 || '',
      suburb: user.suburb || '',
      state: user.state || '',
      postcode: user.postcode || '',
      medicare_number: user.medicare_number || '',
      
      // Default values for user-completed fields
      preferred_name: '',
      gender_identity: '',
      pronouns: '',
      home_phone: '',
      emergency_contact_name: '',
      emergency_contact_relationship: '',
      emergency_contact_phone: '',
      referral_source: '',
      has_gp_referral: false,
      gp_name: '',
      gp_practice_name: '',
      gp_provider_number: '',
      gp_address: '',
      previous_therapy: false,
      previous_therapy_details: '',
      current_medications: false,
      medication_list: '',
      other_health_professionals: false,
      other_health_details: '',
      medical_conditions: false,
      medical_conditions_details: '',
      presenting_concerns: '',
      therapy_goals: '',
      consent_to_treatment: false,
      consent_to_telehealth: false,
      client_signature: '',
      consent_date: ''
    };
  }
};
