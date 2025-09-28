import type { User } from './auth';

export interface Patient extends User {
  role: 'patient';
  medicare_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  intake_completed: boolean;
}

export interface Psychologist extends User {
  role: 'psychologist';
  title: string;
  display_name: string;
  qualifications: string;
  specializations: string[];
  years_experience: number;
  consultation_fee: number;
  is_accepting_new_patients: boolean;
  bio?: string;
  profile_image?: string;
}

export interface PracticeManager extends User {
  role: 'practice_manager';
  department?: string;
}

export type UserProfile = Patient | Psychologist | PracticeManager;
