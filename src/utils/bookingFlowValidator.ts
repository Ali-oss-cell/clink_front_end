/**
 * Booking Flow Validator
 * Validates all data before booking to prevent common errors
 */

export interface BookingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BookingData {
  psychologist_id: any;
  service_id: any;
  time_slot_id: any;
  session_type: any;
  notes?: string;
}

/**
 * Validates booking data before sending to API
 */
export function validateBookingData(data: BookingData): BookingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate psychologist_id
  if (data.psychologist_id === undefined || data.psychologist_id === null) {
    errors.push('❌ psychologist_id is required');
  } else if (typeof data.psychologist_id !== 'number') {
    errors.push(`❌ psychologist_id must be a number, got: ${typeof data.psychologist_id}`);
  } else if (!Number.isInteger(data.psychologist_id)) {
    errors.push(`❌ psychologist_id must be an integer, got: ${data.psychologist_id}`);
  } else if (data.psychologist_id < 1) {
    errors.push(`❌ psychologist_id must be positive, got: ${data.psychologist_id}`);
  }

  // Validate service_id
  if (data.service_id === undefined || data.service_id === null) {
    errors.push('❌ service_id is required');
  } else if (typeof data.service_id !== 'number') {
    errors.push(`❌ service_id must be a number, got: ${typeof data.service_id}`);
  } else if (!Number.isInteger(data.service_id)) {
    errors.push(`❌ service_id must be an integer, got: ${data.service_id}`);
  } else if (data.service_id < 1) {
    errors.push(`❌ service_id must be positive, got: ${data.service_id}`);
  }

  // Validate time_slot_id
  if (data.time_slot_id === undefined || data.time_slot_id === null) {
    errors.push('❌ time_slot_id is required');
  } else if (typeof data.time_slot_id !== 'number') {
    errors.push(`❌ time_slot_id must be a number, got: ${typeof data.time_slot_id}`);
  } else if (!Number.isInteger(data.time_slot_id)) {
    errors.push(`❌ time_slot_id must be an integer, got: ${data.time_slot_id}`);
  } else if (data.time_slot_id < 1) {
    errors.push(`❌ time_slot_id must be positive, got: ${data.time_slot_id}`);
  }

  // Validate session_type
  if (!data.session_type) {
    errors.push('❌ session_type is required');
  } else if (typeof data.session_type !== 'string') {
    errors.push(`❌ session_type must be a string, got: ${typeof data.session_type}`);
  } else if (!['telehealth', 'in_person'].includes(data.session_type)) {
    errors.push(
      `❌ session_type must be 'telehealth' or 'in_person', got: '${data.session_type}'`
    );
  }

  // Validate notes (optional)
  if (data.notes !== undefined && data.notes !== null && typeof data.notes !== 'string') {
    warnings.push(`⚠️ notes should be a string, got: ${typeof data.notes}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Logs validation results to console with colors
 */
export function logValidationResults(
  data: BookingData,
  result: BookingValidationResult
): void {
  console.group('🔍 Booking Data Validation');
  
  console.log('📋 Data to validate:', data);
  
  console.log('🔢 Type check:', {
    psychologist_id: typeof data.psychologist_id,
    service_id: typeof data.service_id,
    time_slot_id: typeof data.time_slot_id,
    session_type: typeof data.session_type
  });

  if (result.errors.length > 0) {
    console.error('❌ Validation Errors:');
    result.errors.forEach(error => console.error(`  ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Validation Warnings:');
    result.warnings.forEach(warning => console.warn(`  ${warning}`));
  }

  if (result.isValid) {
    console.log('✅ Validation passed! Data is ready for booking.');
  } else {
    console.error('❌ Validation failed! Fix errors before booking.');
  }

  console.groupEnd();
}

/**
 * Validates authentication token
 */
export function validateAuthToken(): BookingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const token = localStorage.getItem('access_token');

  if (!token) {
    errors.push('❌ No authentication token found. User must login first.');
  } else if (typeof token !== 'string' || token.trim().length === 0) {
    errors.push('❌ Invalid authentication token format.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Complete pre-booking validation
 */
export function validateCompleteBookingFlow(
  bookingData: BookingData
): BookingValidationResult {
  const authResult = validateAuthToken();
  const dataResult = validateBookingData(bookingData);

  return {
    isValid: authResult.isValid && dataResult.isValid,
    errors: [...authResult.errors, ...dataResult.errors],
    warnings: [...authResult.warnings, ...dataResult.warnings]
  };
}

