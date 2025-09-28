import type { User } from './auth';
import type { Psychologist } from './user';
import type { Appointment } from './appointment';

export interface SOAPNote {
  id: number;
  appointment: Appointment;
  patient: User;
  psychologist: Psychologist;
  
  // SOAP Components
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  
  // Additional fields
  session_duration_minutes: number;
  session_type: 'individual' | 'couples' | 'family' | 'group';
  risk_assessment?: 'low' | 'medium' | 'high';
  risk_notes?: string;
  goals_progress?: string;
  homework_assigned?: string;
  next_session_focus?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ProgressSummary {
  patient_id: number;
  total_sessions: number;
  sessions_completed: number;
  sessions_cancelled: number;
  sessions_no_show: number;
  last_session_date?: string;
  next_session_date?: string;
  overall_progress: 'excellent' | 'good' | 'fair' | 'poor';
  current_goals: string[];
}

export interface SOAPNoteRequest {
  appointment_id: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  session_duration_minutes: number;
  risk_assessment?: 'low' | 'medium' | 'high';
  risk_notes?: string;
  goals_progress?: string;
  homework_assigned?: string;
  next_session_focus?: string;
}
