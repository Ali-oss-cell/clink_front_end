import { useEffect, useState } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService, type ReferralDocument } from '../../services/api/auth';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { CheckCircleIcon, CloseIcon, WarningIcon } from '../../utils/icons';
import styles from './AdminPages.module.scss';

export const AdminReferralsPage: React.FC = () => {
  const user = authService.getStoredUser();
  const [statusFilter, setStatusFilter] = useState<string>('uploaded_pending_review');
  const [patientQuery, setPatientQuery] = useState('');
  const [rows, setRows] = useState<ReferralDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReferralDocument | null>(null);
  const [action, setAction] = useState<'verify' | 'reject' | 'mark_expired'>('verify');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.listReferralQueue({
        status: statusFilter || undefined,
        patient: patientQuery || undefined,
      });
      setRows(response.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load referral queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [statusFilter]);

  const openReview = (doc: ReferralDocument, nextAction: 'verify' | 'reject' | 'mark_expired') => {
    setSelected(doc);
    setAction(nextAction);
    setReviewNotes('');
    setRejectionReason('');
  };

  const submitReview = async () => {
    if (!selected) return;
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setSubmitting(true);
    try {
      await authService.reviewReferralDocument(selected.id, {
        action,
        rejection_reason: action === 'reject' ? rejectionReason.trim() : undefined,
        review_notes: reviewNotes.trim() || undefined,
      });
      setSelected(null);
      await loadQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const badgeClass = (status: string) => {
    if (status === 'verified') return styles.statusApproved;
    if (status === 'rejected') return styles.statusRejected;
    if (status === 'expired') return styles.statusCancelled;
    if (status === 'uploaded_pending_review') return styles.statusPending;
    return styles.statusCompleted;
  };

  return (
    <Layout user={user} isAuthenticated className={styles.adminLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Referral verification queue</h1>
            <p className={styles.pageSubtitle}>Review uploaded GP referral / MHTP documents for Medicare workflows.</p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <WarningIcon size="md" />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.filterSection}>
            <label htmlFor="statusFilter">Status:</label>
            <Select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All</option>
              <option value="uploaded_pending_review">Pending review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </Select>
            <Input
              type="text"
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
              placeholder="Search patient name/email..."
              className={styles.searchInput}
            />
            <Button className={styles.searchButton} onClick={loadQueue}>
              Search
            </Button>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <p>Loading referrals...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No referrals found</h3>
              <p>Try changing filters or search terms.</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>File</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.id}</td>
                      <td>{doc.patient_name || `Patient #${doc.patient}`}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${badgeClass(doc.status)}`}>{doc.status}</span>
                      </td>
                      <td>{formatDate(doc.submitted_at)}</td>
                      <td>
                        {doc.file_url ? (
                          <a href={doc.file_url} target="_blank" rel="noreferrer">
                            {doc.file_name || doc.original_filename || 'Open file'}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <Button className={styles.approveButton} onClick={() => openReview(doc, 'verify')}>
                            <CheckCircleIcon size="sm" /> Verify
                          </Button>
                          <Button className={styles.rejectButton} onClick={() => openReview(doc, 'reject')}>
                            <CloseIcon size="sm" /> Reject
                          </Button>
                          <Button className={styles.viewButton} onClick={() => openReview(doc, 'mark_expired')}>
                            Mark expired
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selected && (
            <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>Review referral #{selected.id}</h2>
                  <Button className={styles.modalCloseButton} onClick={() => setSelected(null)}>
                    <CloseIcon size="md" />
                  </Button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.detailRow}>
                    <strong>Patient</strong>
                    <span>{selected.patient_name || `Patient #${selected.patient}`}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <strong>Current status</strong>
                    <span>{selected.status}</span>
                  </div>
                  {selected.file_url && (
                    <div className={styles.detailRow}>
                      <strong>Document</strong>
                      <a href={selected.file_url} target="_blank" rel="noreferrer">
                        {selected.file_name || selected.original_filename || 'Open file'}
                      </a>
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Action</label>
                    <Select value={action} onChange={(e) => setAction(e.target.value as any)} className={styles.select}>
                      <option value="verify">Verify</option>
                      <option value="reject">Reject</option>
                      <option value="mark_expired">Mark expired</option>
                    </Select>
                  </div>
                  {action === 'reject' && (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Rejection reason (shown to patient)</label>
                      <Textarea
                        rows={3}
                        className={styles.textarea}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Internal notes</label>
                    <Textarea
                      rows={3}
                      className={styles.textarea}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <Button className={styles.cancelButton} onClick={() => setSelected(null)}>
                    Cancel
                  </Button>
                  <Button className={styles.approveButton} disabled={submitting} onClick={submitReview}>
                    {submitting ? 'Saving...' : 'Save review'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

