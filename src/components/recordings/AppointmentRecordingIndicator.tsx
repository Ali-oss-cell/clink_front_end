import React, { useState } from 'react';
import { useAppointmentRecording } from '../../hooks/useRecordings';
import { RecordingDetailModal } from './RecordingDetailModal';
import styles from './AppointmentRecordingIndicator.module.scss';

interface AppointmentRecordingIndicatorProps {
  appointmentId: string | number;
  appointmentStatus: string;
}

export const AppointmentRecordingIndicator: React.FC<AppointmentRecordingIndicatorProps> = ({
  appointmentId,
  appointmentStatus,
}) => {
  const [showModal, setShowModal] = useState(false);
  const { recording, loading, error } = useAppointmentRecording(
    typeof appointmentId === 'string' ? parseInt(appointmentId) : appointmentId
  );

  // Only show for completed appointments
  if (appointmentStatus !== 'completed') {
    return null;
  }

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (error || !recording) {
    return null; // Don't show if no recording or error
  }

  return (
    <>
      <div className={styles.recordingIndicator}>
        <span className={styles.recordingIcon}>📹</span>
        <span className={styles.recordingText}>Recording Available</span>
        <button
          onClick={() => setShowModal(true)}
          className={styles.viewButton}
        >
          View
        </button>
      </div>

      {showModal && recording && (
        <RecordingDetailModal
          recording={recording}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

