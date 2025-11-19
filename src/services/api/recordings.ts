import axiosInstance from './axiosInstance';
import type {
  SessionRecording,
  SessionRecordingListItem,
  RecordingDownloadResponse,
  RecordingsListResponse,
} from '../../types/recordings';

/**
 * Session Recording API Service
 * Handles all recording-related API calls
 */
class RecordingService {
  /**
   * Get recording for a specific appointment
   * @param appointmentId - Appointment ID
   * @returns Recording details
   */
  async getRecordingByAppointment(appointmentId: number): Promise<SessionRecording> {
    const response = await axiosInstance.get<SessionRecording>(
      `/appointments/${appointmentId}/recording/`
    );
    return response.data;
  }

  /**
   * List all recordings accessible to current user
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 20)
   * @returns Paginated list of recordings
   */
  async listRecordings(
    page: number = 1,
    pageSize: number = 20
  ): Promise<RecordingsListResponse> {
    const response = await axiosInstance.get<RecordingsListResponse>(
      '/appointments/recordings/',
      {
        params: {
          page,
          page_size: pageSize,
        },
      }
    );
    return response.data;
  }

  /**
   * Get download URL for a recording
   * @param recordingId - Recording ID
   * @returns Download URL and metadata
   */
  async getDownloadUrl(recordingId: number): Promise<RecordingDownloadResponse> {
    const response = await axiosInstance.get<RecordingDownloadResponse>(
      `/appointments/recordings/${recordingId}/download/`
    );
    return response.data;
  }

  /**
   * Download recording file
   * Note: This opens the download URL in a new window
   * For direct download, you may need to proxy through backend
   * @param recordingId - Recording ID
   */
  async downloadRecording(recordingId: number): Promise<void> {
    const downloadData = await this.getDownloadUrl(recordingId);
    window.open(downloadData.download_url, '_blank');
  }

  /**
   * Get playable video URL for a recording
   * Returns the media_uri if available, otherwise tries to get download URL
   * @param recording - Recording object
   * @returns Video URL that can be used for playback
   */
  getVideoUrl(recording: { media_uri?: string; media_external_location?: string; id: number }): string | null {
    // Prefer external location if available (usually more reliable)
    if (recording.media_external_location) {
      return recording.media_external_location;
    }
    
    // Fall back to media_uri
    if (recording.media_uri) {
      return recording.media_uri;
    }
    
    return null;
  }
}

export const recordingService = new RecordingService();

