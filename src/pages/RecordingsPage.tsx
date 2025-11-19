import React, { useState } from 'react';
import { useRecordingsList, useRecordingDownload } from '../hooks/useRecordings';
import { RecordingCard, RecordingDetailModal } from '../components/recordings';
import type { SessionRecordingListItem } from '../types/recordings';
import { Layout } from '../components/common/Layout/Layout';
import { authService } from '../services/api/auth';
import styles from './RecordingsPage.module.scss';

export const RecordingsPage: React.FC = () => {
  const user = authService.getStoredUser();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedRecording, setSelectedRecording] = useState<SessionRecordingListItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data, loading, error, refetch } = useRecordingsList(page, pageSize);
  const { download, downloading } = useRecordingDownload();

  const handleView = (recordingId: number) => {
    const recording = data?.results.find((r) => r.id === recordingId);
    if (recording) {
      setSelectedRecording(recording);
      setShowModal(true);
    }
  };

  const handleDownload = async (recordingId: number) => {
    try {
      await download(recordingId);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading && !data) {
    return (
      <Layout user={user} isAuthenticated={true}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingMessage}>Loading recordings...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={user} isAuthenticated={true}>
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>{error}</div>
          <button onClick={() => refetch()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const totalPages = data ? Math.ceil(data.count / pageSize) : 1;

  return (
    <Layout user={user} isAuthenticated={true}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Session Recordings</h1>
          <p className={styles.subtitle}>
            View and download recordings of your telehealth sessions
          </p>
        </div>

        {data && data.results.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyMessage}>No recordings found.</p>
          </div>
        ) : (
          <>
            <div className={styles.recordingsGrid}>
              {data?.results.map((recording) => (
                <RecordingCard
                  key={recording.id}
                  recording={recording}
                  onView={handleView}
                  onDownload={handleDownload}
                />
              ))}
            </div>

            {data && data.count > pageSize && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data.previous || page === 1}
                  className={styles.paginationButton}
                >
                  Previous
                </button>
                <span className={styles.paginationInfo}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.next || page === totalPages}
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {showModal && selectedRecording && (
          <RecordingDetailModal
            recording={selectedRecording as any}
            onClose={() => {
              setShowModal(false);
              setSelectedRecording(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

