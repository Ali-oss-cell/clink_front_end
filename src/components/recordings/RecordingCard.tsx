import React from 'react';
import type { SessionRecordingListItem } from '../../types/recordings';
import styles from './RecordingCard.module.scss';

interface RecordingCardProps {
  recording: SessionRecordingListItem;
  onView?: (recordingId: number) => void;
  onDownload?: (recordingId: number) => void;
}

export const RecordingCard: React.FC<RecordingCardProps> = ({
  recording,
  onView,
  onDownload,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'started':
        return styles.statusStarted;
      case 'failed':
        return styles.statusFailed;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={styles.recordingCard}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>Session Recording</h3>
          <p className={styles.cardDate}>{formatDate(recording.appointment_date)}</p>
        </div>
        <span className={`${styles.statusBadge} ${getStatusClass(recording.status)}`}>
          {recording.status}
        </span>
      </div>

      <div className={styles.cardInfo}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Patient:</span>
          <span className={styles.infoValue}>{recording.patient_name}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Psychologist:</span>
          <span className={styles.infoValue}>{recording.psychologist_name}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Duration:</span>
          <span className={styles.infoValue}>{recording.duration_formatted}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Size:</span>
          <span className={styles.infoValue}>{recording.size_formatted}</span>
        </div>
      </div>

      <div className={styles.cardActions}>
        {onView && (
          <button
            onClick={() => onView(recording.id)}
            className={styles.viewButton}
          >
            View Details
          </button>
        )}
        {onDownload && recording.status === 'completed' && (
          <button
            onClick={() => onDownload(recording.id)}
            className={styles.downloadButton}
          >
            Download
          </button>
        )}
      </div>
    </div>
  );
};

