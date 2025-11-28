import React, { useState } from 'react';
import { useRecordingsList, useRecordingDownload } from '../hooks/useRecordings';
import { RecordingCard, RecordingDetailModal } from '../components/recordings';
import type { SessionRecordingListItem } from '../types/recordings';
import { Layout } from '../components/common/Layout/Layout';
import { authService } from '../services/api/auth';
import { VideoIcon, DownloadIcon, CalendarIcon, ClockIcon, UsersIcon, InfoIcon } from '../utils/icons';
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
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <div className={styles.loadingMessage}>Loading recordings...</div>
            <p className={styles.loadingSubtext}>Please wait while we fetch your session recordings</p>
          </div>
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
  const totalRecordings = data?.count || 0;
  const completedRecordings = data?.results.filter(r => r.status === 'completed').length || 0;

  return (
    <Layout user={user} isAuthenticated={true}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <VideoIcon size="xl" />
            </div>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Session Recordings</h1>
              <p className={styles.subtitle}>
                View and download recordings of your telehealth sessions
              </p>
            </div>
          </div>
          
          {data && data.count > 0 && (
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <VideoIcon size="md" />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{totalRecordings}</div>
                  <div className={styles.statLabel}>Total Recordings</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <DownloadIcon size="md" />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{completedRecordings}</div>
                  <div className={styles.statLabel}>Available</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {data && data.results.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <VideoIcon size="2xl" />
            </div>
            <h3 className={styles.emptyTitle}>No Recordings Available</h3>
            <p className={styles.emptyMessage}>
              You don't have any session recordings yet. Recordings will appear here after your telehealth sessions are completed.
            </p>
            <div className={styles.emptyInfo}>
              <InfoIcon size="sm" />
              <span>Recordings are automatically saved for sessions where recording consent was provided.</span>
            </div>
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

