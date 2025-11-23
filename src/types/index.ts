// Re-export all types for easy importing
export * from './auth';
export * from './user';
export * from './intake';
export * from './appointment';
export * from './api';
// Export progressNote types explicitly to avoid Patient name conflict with user.Patient
export type { 
  ProgressNote, 
  CreateNoteRequest, 
  PatientProgress,
  PatientNoteContext
} from './progressNote';

// Common utility types
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
