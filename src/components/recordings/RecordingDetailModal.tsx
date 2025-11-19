import React from 'react';
import type { SessionRecording } from '../../types/recordings';
import { useRecordingDownload } from '../../hooks/useRecordings';
import styles from './RecordingDetailModal.module.scss';

interface RecordingDetailModalProps {
  recording: SessionRecording;
  onClose: () => void;
}

export const RecordingDetailModal: React.FC<RecordingDetailModalProps> = ({
  recording,
  onClose,
}) => {
  const { download, downloading } = useRecordingDownload();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    try {
      await download(recording.id);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Recording Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailRow}>
            <label className={styles.detailLabel}>Appointment Date</label>
            <p className={styles.detailValue}>{formatDate(recording.created_at)}</p>
          </div>

          <div className={styles.detailRow}>
            <label className={styles.detailLabel}>Patient</label>
            <p className={styles.detailValue}>{recording.patient_name}</p>
          </div>

          <div className={styles.detailRow}>
            <label className={styles.detailLabel}>Psychologist</label>
            <p className={styles.detailValue}>{recording.psychologist_name}</p>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <label className={styles.detailLabel}>Duration</label>
              <p className={styles.detailValue}>{recording.duration_formatted}</p>
            </div>
            <div className={styles.detailRow}>
              <label className={styles.detailLabel}>File Size</label>
              <p className={styles.detailValue}>{recording.size_formatted}</p>
            </div>
          </div>

          <div className={styles.detailRow}>
            <label className={styles.detailLabel}>Status</label>
            <p className={styles.detailValue}>{recording.status_display}</p>
          </div>

          {recording.completed_at && (
            <div className={styles.detailRow}>
              <label className={styles.detailLabel}>Completed At</label>
              <p className={styles.detailValue}>{formatDate(recording.completed_at)}</p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          {recording.status === 'completed' && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={styles.downloadButton}
            >
              {downloading ? 'Downloading...' : 'Download Recording'}
            </button>
          )}
          <button onClick={onClose} className={styles.closeModalButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

