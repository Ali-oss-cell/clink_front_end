import { isValidPhoneNumber } from 'libphonenumber-js';

// Australian / clinical validation utilities for intake form (phone is international E.164)
export const australianValidation = {
  // Australian states
  validStates: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
  
  // Validate Australian postcode (4 digits)
  validatePostcode: (postcode: string): boolean => {
    return /^\d{4}$/.test(postcode);
  },
  
  /** E.164 international mobile/phone (e.g. +61412345678, +963...) */
  validatePhoneNumber: (phone: string): boolean => {
    const digits = phone.replace(/\s/g, '').trim();
    if (!digits) return false;
    return isValidPhoneNumber(digits);
  },
  
  // Validate Australian state
  validateState: (state: string): boolean => {
    return australianValidation.validStates.includes(state.toUpperCase());
  },
  
  // Get validation error messages
  getPostcodeError: (postcode: string): string | null => {
    if (!postcode) return 'Postcode is required';
    if (!australianValidation.validatePostcode(postcode)) {
      return 'Postcode must be 4 digits (e.g., 3000)';
    }
    return null;
  },
  
  /**
   * Format validation only (non-empty). Use when "required" is already enforced elsewhere.
   */
  getPhoneError: (phone: string): string | null => {
    if (!phone || !String(phone).trim()) return null;
    const normalized = String(phone).replace(/\s/g, '');
    if (!isValidPhoneNumber(normalized)) {
      return 'Use a valid international number in E.164 format (starts with +, e.g. +61412345678)';
    }
    return null;
  },
  
  getStateError: (state: string): string | null => {
    if (!state) return 'State is required';
    if (!australianValidation.validateState(state)) {
      return `State must be one of: ${australianValidation.validStates.join(', ')}`;
    }
    return null;
  }
};

// AHPRA Registration Number Validation
export interface AHPRAValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

export const validateAHPRA = (
  ahpraNumber: string,
  role: string = 'psychologist'
): AHPRAValidationResult => {
  if (!ahpraNumber || !ahpraNumber.trim()) {
    return { 
      isValid: false, 
      error: 'AHPRA registration number is required' 
    };
  }

  // Remove spaces, dashes, underscores and convert to uppercase
  const cleaned = ahpraNumber.replace(/[\s\-_]/g, '').toUpperCase();

  // Check format: 3 letters + 10 digits
  const pattern = /^[A-Z]{3}[0-9]{10}$/;
  if (!pattern.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid format. Expected: 3 letters (e.g., PSY) followed by 10 digits (e.g., PSY0001234567)'
    };
  }

  // Check profession code for psychologists
  if (role === 'psychologist' && !cleaned.startsWith('PSY')) {
    return {
      isValid: false,
      error: 'Psychologists must have an AHPRA number starting with PSY'
    };
  }

  return { isValid: true, normalized: cleaned };
};

// Cross-field validation
export const crossFieldValidation = {
  // Validate GP / MHCP referral fields (align with backend intake + Medicare booking rules)
  validateGPReferral: (
    hasGPReferral: boolean,
    gpName: string,
    gpPracticeName: string,
    gpReferralDate?: string,
    gpProviderNumber?: string
  ): string | null => {
    if (!hasGPReferral) return null;
    if (!gpName?.trim()) {
      return 'GP name is required when GP referral is selected';
    }
    if (!gpPracticeName?.trim()) {
      return 'GP practice name is required when GP referral is selected';
    }
    if (!gpReferralDate?.trim()) {
      return 'GP referral date is required when GP referral is selected (Medicare mental health care plan)';
    }
    if (!gpProviderNumber?.trim()) {
      return 'GP provider number is required for Medicare-rebated bookings';
    }
    return null;
  },
  
  // Validate emergency contact
  validateEmergencyContact: (name: string, phone: string): string | null => {
    if (name && name.trim() && (!phone || !phone.trim())) {
      return 'Emergency contact phone is required when name is provided';
    }
    return null;
  }
};

// Comprehensive intake form validation
export const validateIntakeForm = (data: any): string[] => {
  const errors: string[] = [];
  
  // Required fields validation
  const requiredFields = [
    'first_name', 'last_name', 'phone_number', 'date_of_birth',
    'address_line_1', 'suburb', 'state', 'postcode',
    'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone',
    'referral_source', 'presenting_concerns', 'therapy_goals',
    'consent_to_treatment', 'client_signature', 'consent_date'
  ];
  
  // Check required fields
  requiredFields.forEach(field => {
    const value = data[field];
    if (!value || (typeof value === 'string' && !value.trim())) {
      const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      errors.push(`${fieldName} is required`);
    }
  });
  
  // Australian validation
  const postcodeError = australianValidation.getPostcodeError(data.postcode);
  if (postcodeError) errors.push(postcodeError);
  
  const phoneError = australianValidation.getPhoneError(data.phone_number);
  if (phoneError) errors.push(phoneError);

  const emergencyPhoneError = australianValidation.getPhoneError(data.emergency_contact_phone);
  if (emergencyPhoneError) errors.push(emergencyPhoneError);

  if (data.home_phone && String(data.home_phone).trim()) {
    const homeErr = australianValidation.getPhoneError(data.home_phone);
    if (homeErr) errors.push(`Home phone: ${homeErr}`);
  }

  const stateError = australianValidation.getStateError(data.state);
  if (stateError) errors.push(stateError);
  
  const hasGp =
    data.has_gp_referral === true ||
    data.has_gp_referral === 'true';

  if (data.gp_referral_expiry_date && String(data.gp_referral_expiry_date).trim()) {
    const d = String(data.gp_referral_expiry_date).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      errors.push('GP referral expiry must be a valid date (YYYY-MM-DD)');
    }
  }
  if (hasGp && data.gp_referral_date && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.gp_referral_date).trim())) {
    errors.push('GP referral date must be a valid date (YYYY-MM-DD)');
  }

  // Cross-field validation
  const gpError = crossFieldValidation.validateGPReferral(
    hasGp,
    data.gp_name,
    data.gp_practice_name,
    data.gp_referral_date,
    data.gp_provider_number
  );
  if (gpError) errors.push(gpError);
  
  const emergencyError = crossFieldValidation.validateEmergencyContact(
    data.emergency_contact_name,
    data.emergency_contact_phone
  );
  if (emergencyError) errors.push(emergencyError);
  
  // Consent validation
  if (!data.consent_to_treatment) {
    errors.push('Consent to treatment is required');
  }
  
  return errors;
};
