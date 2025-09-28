// Simplified auth types to match Django backend
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'patient' | 'psychologist' | 'practice_manager' | 'admin';
  phone_number: string;
  date_of_birth: string;
  age: number | null;
  is_verified: boolean;
  created_at: string;
  // Optional fields that may be available from registration
  address_line_1?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  medicare_number?: string;
}

export interface Tokens {
  refresh: string;
  access: string;
}

export interface PatientRegistrationResponse {
  message: string;
  user: User;
  tokens: Tokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Django backend returns tokens directly in response
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
}

export interface RegisterResponse {
  user: User;
  message: string;
  tokens: Tokens;
}
