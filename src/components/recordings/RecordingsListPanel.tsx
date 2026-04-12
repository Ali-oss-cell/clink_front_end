import { useState } from 'react';
import { useRecordingsList, useRecordingDownload } from '../../hooks/useRecordings';
import { RecordingCard } from './RecordingCard';
import { RecordingDetailModal } from './RecordingDetailModal';
import type { SessionRecordingListItem } from '../../types/recordings';
import { VideoIcon, DownloadIcon, InfoIcon } from '../../utils/icons';
import { Button } from '../ui/button';
import styles from '../../pages/RecordingsPage.module.scss';

export type RecordingsListLayout = 'full' | 'compact';

export interface RecordingsListPanelProps {
  layout?: RecordingsListLayout;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  className?: string;
}

const defaultTitle = 'Session Recordings';
const defaultSubtitle = 'View and download recordings of your telehealth sessions';
const defaultEmpty =
  "You don't have any session recordings yet. Recordings will appear here after your telehealth sessions are completed.";

export const RecordingsListPanel: React.FC<RecordingsListPanelProps> = ({
  layout = 'full',
  title = defaultTitle,
  subtitle = defaultSubtitle,
  emptyMessage = defaultEmpty,
  className,
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedRecording, setSelectedRecording] = useState<SessionRecordingListItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data, loading, error, refetch } = useRecordingsList(page, pageSize);
  const { download } = useRecordingDownload();

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
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  if (loading && !data) {
    return (
      <div className={`${styles.container} ${className ?? ''}`.trim()}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingMessage}>Loading recordings...</div>
          <p className={styles.loadingSubtext}>Please wait while we fetch your session recordings</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.errorContainer} ${className ?? ''}`.trim()}>
        <div className={styles.errorMessage}>{error}</div>
        <Button type="button" onClick={() => refetch()} className={styles.retryButton}>
          Retry
        </Button>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.count / pageSize) : 1;
  const totalRecordings = data?.count || 0;
  const completedRecordings = data?.results.filter((r) => r.status === 'completed').length || 0;

  return (
    <div className={`${layout === 'full' ? styles.container : ''} ${className ?? ''}`.trim()}>
      {layout === 'full' && (
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <VideoIcon size="xl" />
            </div>
            <div className={styles.headerText}>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.subtitle}>{subtitle}</p>
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
      )}

      {layout === 'compact' && data && data.count > 0 && (
        <div className={styles.stats} style={{ marginBottom: '1.25rem' }}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <VideoIcon size="md" />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{totalRecordings}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <DownloadIcon size="md" />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{completedRecordings}</div>
              <div className={styles.statLabel}>Ready to play</div>
            </div>
          </div>
        </div>
      )}

      {data && data.results.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <VideoIcon size="2xl" />
          </div>
          <h3 className={styles.emptyTitle}>No Recordings Available</h3>
          <p className={styles.emptyMessage}>{emptyMessage}</p>
          <div className={styles.emptyInfo}>
            <InfoIcon size="sm" />
            <span>Recordings are saved when recording consent is in place and the session completes processing.</span>
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
              <Button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.previous || page === 1}
                className={styles.paginationButton}
              >
                Previous
              </Button>
              <span className={styles.paginationInfo}>
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.next || page === totalPages}
                className={styles.paginationButton}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {showModal && selectedRecording && (
        <RecordingDetailModal
          recording={selectedRecording as never}
          onClose={() => {
            setShowModal(false);
            setSelectedRecording(null);
          }}
        />
      )}
    </div>
  );
};
