export interface IntakeFormData {
  // Personal Details
  first_name: string;
  last_name: string;
  preferred_name?: string;
  date_of_birth: string;
  gender_identity?: string;
  pronouns?: string;
  phone_number: string;
  email: string;
  address_line_1: string;
  suburb: string;
  state: string;
  postcode: string;
  medicare_number?: string;

  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;

  // Referral Information
  referral_source?: string;
  has_gp_referral: boolean;
  gp_name?: string;
  gp_practice_name?: string;

  // Medical History
  previous_therapy: boolean;
  previous_therapy_details?: string;
  current_medications?: string;
  medical_conditions?: string;

  // Presenting Concerns
  presenting_concerns?: string;
  therapy_goals?: string;

  // Consent
  consent_to_treatment: boolean;
  consent_to_telehealth: boolean;
  intake_completed: boolean;
}

export interface IntakeStep {
  id: number;
  title: string;
  completed: boolean;
  fields: string[];
}

export type IntakeStepData = Partial<IntakeFormData>;
