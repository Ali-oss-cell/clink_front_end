import React, { useState, useEffect } from 'react';
import type { SessionRecording } from '../../types/recordings';
import { useRecordingDownload } from '../../hooks/useRecordings';
import { recordingService } from '../../services/api/recordings';
import { RecordingVideoPlayer } from './RecordingVideoPlayer';
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Get video URL from recording
    const url = recordingService.getVideoUrl(recording);
    setVideoUrl(url);
    
    // If no direct URL, try to get download URL which might be playable
    if (!url && recording.status === 'completed') {
      recordingService.getDownloadUrl(recording.id)
        .then((downloadData) => {
          if (downloadData.download_url) {
            setVideoUrl(downloadData.download_url);
          }
        })
        .catch((error) => {
          console.error('Failed to get download URL:', error);
          setVideoError('Video URL not available');
        });
    }
  }, [recording]);

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

  const handleVideoError = (error: Error) => {
    console.error('Video player error:', error);
    setVideoError('Failed to play video. The recording may require authentication.');
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
          {/* Video Player Section */}
          {recording.status === 'completed' && (
            <div className={styles.videoSection}>
              <div className={styles.videoSectionHeader}>
                <h3 className={styles.videoSectionTitle}>Session Recording</h3>
                {videoUrl && (
                  <button
                    onClick={() => setShowVideo(!showVideo)}
                    className={styles.toggleVideoButton}
                  >
                    {showVideo ? 'Hide Video' : 'Show Video'}
                  </button>
                )}
              </div>
              
              {showVideo && videoUrl ? (
                <RecordingVideoPlayer
                  videoUrl={videoUrl}
                  onError={handleVideoError}
                />
              ) : videoUrl ? (
                <div className={styles.videoPlaceholder}>
                  <div className={styles.videoPlaceholderIcon}>📹</div>
                  <p>Click "Show Video" to play the recording</p>
                </div>
              ) : videoError ? (
                <div className={styles.videoError}>
                  <p>{videoError}</p>
                  <p className={styles.videoErrorHint}>
                    You can still download the recording using the download button below.
                  </p>
                </div>
              ) : (
                <div className={styles.videoPlaceholder}>
                  <div className={styles.videoPlaceholderIcon}>⏳</div>
                  <p>Loading video URL...</p>
                </div>
              )}
            </div>
          )}

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

