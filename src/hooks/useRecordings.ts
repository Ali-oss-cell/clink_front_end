import { useState, useEffect } from 'react';
import { recordingService } from '../services/api/recordings';
import type {
  SessionRecording,
  SessionRecordingListItem,
  RecordingsListResponse,
} from '../types/recordings';

/**
 * Hook to fetch recording for a specific appointment
 */
export function useAppointmentRecording(appointmentId: number | null) {
  const [recording, setRecording] = useState<SessionRecording | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) {
      setRecording(null);
      return;
    }

    const fetchRecording = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await recordingService.getRecordingByAppointment(appointmentId);
        setRecording(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('No recording found for this appointment');
        } else {
          setError(err.response?.data?.error || 'Failed to load recording');
        }
        setRecording(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecording();
  }, [appointmentId]);

  const refetch = async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await recordingService.getRecordingByAppointment(appointmentId);
      setRecording(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No recording found for this appointment');
      } else {
        setError(err.response?.data?.error || 'Failed to load recording');
      }
      setRecording(null);
    } finally {
      setLoading(false);
    }
  };

  return { recording, loading, error, refetch };
}

/**
 * Hook to list all recordings with pagination
 */
export function useRecordingsList(page: number = 1, pageSize: number = 20) {
  const [data, setData] = useState<RecordingsListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await recordingService.listRecordings(page, pageSize);
        setData(response);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load recordings');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, [page, pageSize]);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await recordingService.listRecordings(page, pageSize);
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

/**
 * Hook to download a recording
 */
export function useRecordingDownload() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (recordingId: number) => {
    setDownloading(true);
    setError(null);
    try {
      await recordingService.downloadRecording(recordingId);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to download recording');
      throw err;
    } finally {
      setDownloading(false);
    }
  };

  return { download, downloading, error };
}

