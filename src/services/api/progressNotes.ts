import axiosInstance from './axiosInstance';
import axios from 'axios';

// Types
export interface ProgressNote {
  id: number;
  patient: number;
  patient_name: string;
  psychologist: number;
  psychologist_name: string;
  session_date: string;
  session_date_formatted: string;
  session_number: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  session_duration: number;
  progress_rating: number;
  created_at: string;
}

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

export interface UpdateNoteRequest extends Partial<CreateNoteRequest> {}

export interface NotesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProgressNote[];
}

export interface PatientProgress {
  patient_id: number;
  patient_name: string;
  total_sessions: number;
  progress_trend: 'improving' | 'stable' | 'declining';
  average_rating: number;
  sessions_by_month: {
    month: string;
    sessions: number;
    average_rating: number;
  }[];
  goals_progress: {
    goal: string;
    progress: string;
    sessions_addressed: number;
  }[];
  recent_notes: {
    session_number: number;
    date: string;
    rating: number;
    key_points: string;
  }[];
}

export interface Patient {
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

/**
 * Progress Notes Service
 * Handles all API calls related to SOAP progress notes
 */
class ProgressNotesService {
  /**
   * List all progress notes for the logged-in psychologist
   * @param params - Query parameters for pagination, filtering, and search
   * @returns Paginated list of progress notes
   */
  async listNotes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    patient_id?: number;
    ordering?: string;
  }): Promise<NotesListResponse> {
    try {
      const response = await axiosInstance.get('/auth/progress-notes/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching progress notes:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new progress note
   * @param noteData - Data for the new progress note
   * @returns Created progress note
   */
  async createNote(noteData: CreateNoteRequest): Promise<ProgressNote> {
    try {
      const response = await axiosInstance.post('/auth/progress-notes/', noteData);
      return response.data;
    } catch (error) {
      console.error('Error creating progress note:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific progress note by ID
   * @param noteId - ID of the progress note
   * @returns Progress note details
   */
  async getNote(noteId: number): Promise<ProgressNote> {
    try {
      const response = await axiosInstance.get(`/auth/progress-notes/${noteId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching progress note:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing progress note
   * @param noteId - ID of the progress note to update
   * @param updates - Fields to update
   * @returns Updated progress note
   */
  async updateNote(noteId: number, updates: UpdateNoteRequest): Promise<ProgressNote> {
    try {
      const response = await axiosInstance.put(`/auth/progress-notes/${noteId}/`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating progress note:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a progress note
   * @param noteId - ID of the progress note to delete
   */
  async deleteNote(noteId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/auth/progress-notes/${noteId}/`);
    } catch (error) {
      console.error('Error deleting progress note:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all progress notes for a specific patient
   * @param patientId - ID of the patient
   * @returns List of progress notes for the patient
   */
  async getNotesByPatient(patientId: number): Promise<ProgressNote[]> {
    try {
      const response = await axiosInstance.get('/auth/progress-notes/by_patient/', {
        params: { patient_id: patientId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient notes:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get progress analytics for a specific patient
   * @param patientId - ID of the patient
   * @returns Patient progress analytics
   */
  async getPatientProgress(patientId: number): Promise<PatientProgress> {
    try {
      const response = await axiosInstance.get(`/auth/patients/${patientId}/progress/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient progress:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get list of all patients
   * @returns List of patients
   */
  async getPatients(): Promise<{ count: number; results: Patient[] }> {
    try {
      const response = await axiosInstance.get('/auth/patients/');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed information about a specific patient
   * @param patientId - ID of the patient
   * @returns Patient details
   */
  async getPatientDetails(patientId: number): Promise<any> {
    try {
      const response = await axiosInstance.get(`/auth/patients/${patientId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors and return user-friendly messages
   * @param error - Error from axios
   * @returns Error object with message
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 401:
            return new Error('Unauthorized. Please log in again.');
          case 403:
            return new Error('You do not have permission to access this resource.');
          case 404:
            return new Error('Resource not found.');
          case 400:
            // Return validation errors from backend
            if (data && typeof data === 'object') {
              const messages = Object.entries(data)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
              return new Error(messages || 'Invalid request.');
            }
            return new Error('Invalid request.');
          case 500:
            return new Error('Server error. Please try again later.');
          default:
            return new Error(data?.message || 'An error occurred.');
        }
      } else if (error.request) {
        // Request made but no response
        return new Error('No response from server. Please check your connection.');
      }
    }
    return new Error('An unexpected error occurred.');
  }
}

// Export singleton instance
export const progressNotesService = new ProgressNotesService();

// Export class for testing
export default ProgressNotesService;

