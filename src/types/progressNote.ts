import type { User } from './auth';
import type { Psychologist } from './user';
import type { Appointment } from './appointment';

// Main Progress Note interface (matches backend API)
export interface ProgressNote {
  id: number;
  patient: number;
  patient_name: string;
  psychologist: number;
  psychologist_name: string;
  session_date: string;
  session_date_formatted: string;
  session_number: number;
  
  // SOAP Components
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  
  // Metadata
  session_duration: number;
  progress_rating: number; // 1-10 scale
  created_at: string;
}

// Request payload for creating a new note
export interface CreateNoteRequest {
  patient: number;
  session_date: string;
  session_number: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  session_duration: number;
  progress_rating: number;
}

// Request payload for updating a note
export interface UpdateNoteRequest extends Partial<CreateNoteRequest> {}

// Paginated response for notes list
export interface NotesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProgressNote[];
}

// Patient progress analytics
export interface PatientProgress {
  patient_id: number;
  patient_name: string;
  total_sessions: number;
  progress_trend: 'improving' | 'stable' | 'declining';
  average_rating: number;
  sessions_by_month: MonthlySession[];
  goals_progress: GoalProgress[];
  recent_notes: NoteSummary[];
}

export interface MonthlySession {
  month: string;
  sessions: number;
  average_rating: number;
}

export interface GoalProgress {
  goal: string;
  progress: string;
  sessions_addressed: number;
}

export interface NoteSummary {
  session_number: number;
  date: string;
  rating: number;
  key_points: string;
}

// Patient interface for notes context (renamed to avoid conflict with user.Patient)
export interface PatientNoteContext {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  date_of_birth?: string;
  last_appointment?: string;
  total_sessions: number;
  last_progress_rating?: number;
  intake_completed?: boolean;
  current_goals?: string;
  average_progress_rating?: number;
}

// LEGACY: Keep for backward compatibility (if needed)
export interface SOAPNote {
  id: number;
  appointment?: Appointment;
  patient: User | number;
  psychologist: Psychologist | number;
  
  // SOAP Components
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  
  // Additional fields
  session_duration_minutes?: number;
  session_type?: 'individual' | 'couples' | 'family' | 'group';
  risk_assessment?: 'low' | 'medium' | 'high';
  risk_notes?: string;
  goals_progress?: string;
  homework_assigned?: string;
  next_session_focus?: string;
  
  created_at: string;
  updated_at?: string;
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
  appointment_id?: number;
  patient?: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  session_duration_minutes?: number;
  session_duration?: number;
  progress_rating?: number;
  risk_assessment?: 'low' | 'medium' | 'high';
  risk_notes?: string;
  goals_progress?: string;
  homework_assigned?: string;
  next_session_focus?: string;
}
