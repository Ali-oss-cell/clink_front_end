export type RecordingStatus = 'started' | 'completed' | 'failed';

export interface SessionRecording {
  id: number;
  appointment_id: number;
  recording_sid: string;
  media_uri: string;
  media_external_location?: string;
  duration: number;
  duration_formatted: string;
  size: number;
  size_formatted: string;
  status: RecordingStatus;
  status_display: string;
  participant_identity?: string;
  created_at: string;
  completed_at?: string;
  patient_name: string;
  psychologist_name: string;
}

export interface SessionRecordingListItem {
  id: number;
  recording_sid: string;
  appointment_date: string;
  patient_name: string;
  psychologist_name: string;
  duration: number;
  duration_formatted: string;
  size: number;
  size_formatted: string;
  status: RecordingStatus;
  created_at: string;
  completed_at?: string;
}

export interface RecordingDownloadResponse {
  recording_id: number;
  appointment_id: number;
  download_url: string;
  external_location?: string;
  duration: number;
  size: number;
  size_formatted: string;
  duration_formatted: string;
  created_at: string;
  completed_at?: string;
  note: string;
}

export interface RecordingsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SessionRecordingListItem[];
}

