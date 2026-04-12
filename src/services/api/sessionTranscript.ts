import axios from 'axios';
import axiosInstance from './axiosInstance';
import { extractApiErrorMessage } from '../../utils/apiError';

/** Psychologist-facing transcript + optional clinician-assistant fields (API strips for patients). */
export interface SessionTranscriptResponse {
  id: number;
  appointment_id: number;
  recording_id: number | null;
  provider: string;
  provider_display: string;
  status: string;
  status_display: string;
  language_code?: string | null;
  confidence_score?: number | null;
  content?: string | null;
  redacted_content?: string | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  patient_name?: string | null;
  psychologist_name?: string | null;
  clinician_assistant_status?: string | null;
  clinician_assistant_status_display?: string | null;
  clinician_summary?: string | null;
  clinician_draft_note?: string | null;
  clinician_assistant_meta?: Record<string, unknown> | null;
  clinician_assistant_error?: string | null;
  clinician_assistant_completed_at?: string | null;
}

/**
 * Fetch transcript for an appointment. Returns null when none exists (404).
 */
export async function fetchAppointmentTranscript(
  appointmentId: number
): Promise<SessionTranscriptResponse | null> {
  try {
    const { data } = await axiosInstance.get<SessionTranscriptResponse>(
      `/appointments/${appointmentId}/transcript/`
    );
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw new Error(extractApiErrorMessage(err, 'Failed to load transcript'));
  }
}
