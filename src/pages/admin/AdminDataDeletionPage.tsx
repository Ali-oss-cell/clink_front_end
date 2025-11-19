import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { CheckCircleIcon, WarningIcon, CloseIcon, DeleteIcon } from '../../utils/icons';
import styles from './AdminPages.module.scss';

interface DeletionRequest {
  id: number;
  patient: number;
  patient_name?: string;
  patient_email?: string;
  request_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  earliest_deletion_date?: string;
  scheduled_deletion_date?: string;
  retention_period_years?: number;
  can_be_deleted_now?: boolean;
  rejection_reason?: string;
  rejection_notes?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  reviewed_by?: number;
}

export const AdminDataDeletionPage: React.FC = () => {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.listDataDeletionRequests(statusFilter || undefined);
      setRequests(data.requests || []);
    } catch (err: any) {
      console.error('Failed to load deletion requests:', err);
      setError(err.message || 'Failed to load deletion requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (request: DeletionRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes('');
    setRejectionReason('');
    setRejectionNotes('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedRequest) return;

    setReviewing(true);
    try {
      const payload: any = {
        action: reviewAction,
        notes: reviewNotes || undefined,
      };

      if (reviewAction === 'reject') {
        payload.rejection_reason = rejectionReason || 'other';
        payload.rejection_notes = rejectionNotes || undefined;
      }

      await authService.reviewDataDeletionRequest(selectedRequest.id, payload);
      setShowReviewModal(false);
      setSelectedRequest(null);
      await fetchRequests();
      alert(`Deletion request ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully.`);
    } catch (err: any) {
      console.error('Failed to review deletion request:', err);
      alert(err.message || 'Failed to review deletion request');
    } finally {
      setReviewing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  return (
    <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Data Deletion Requests</h1>
            <p className={styles.pageSubtitle}>
              Review and manage patient data deletion requests (APP 13 Compliance)
            </p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <WarningIcon size="md" />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.filterSection}>
            <label htmlFor="statusFilter">Filter by Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading deletion requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className={styles.emptyState}>
              <DeleteIcon size="xl" />
              <h3>No deletion requests found</h3>
              <p>There are no deletion requests matching your filter criteria.</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Email</th>
                    <th>Request Date</th>
                    <th>Earliest Deletion</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.id}</td>
                      <td>{request.patient_name || `Patient #${request.patient}`}</td>
                      <td>{request.patient_email || 'N/A'}</td>
                      <td>{formatDate(request.request_date)}</td>
                      <td>{formatDate(request.earliest_deletion_date)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        {request.status === 'pending' && (
                          <div className={styles.actionButtons}>
                            <button
                              className={styles.approveButton}
                              onClick={() => handleReview(request, 'approve')}
                            >
                              <CheckCircleIcon size="sm" />
                              Approve
                            </button>
                            <button
                              className={styles.rejectButton}
                              onClick={() => handleReview(request, 'reject')}
                            >
                              <CloseIcon size="sm" />
                              Reject
                            </button>
                          </div>
                        )}
                        {request.status !== 'pending' && (
                          <button
                            className={styles.viewButton}
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowReviewModal(true);
                            }}
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Review Modal */}
          {showReviewModal && selectedRequest && (
            <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>
                    {reviewAction === 'approve' ? 'Approve' : 'Reject'} Deletion Request #{selectedRequest.id}
                  </h2>
                  <button
                    className={styles.modalCloseButton}
                    onClick={() => setShowReviewModal(false)}
                  >
                    <CloseIcon size="md" />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.requestDetails}>
                    <div className={styles.detailRow}>
                      <strong>Patient:</strong>
                      <span>{selectedRequest.patient_name || `Patient #${selectedRequest.patient}`}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Email:</strong>
                      <span>{selectedRequest.patient_email || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Request Date:</strong>
                      <span>{formatDate(selectedRequest.request_date)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Earliest Deletion Date:</strong>
                      <span>{formatDate(selectedRequest.earliest_deletion_date)}</span>
                    </div>
                    {selectedRequest.retention_period_years && (
                      <div className={styles.detailRow}>
                        <strong>Retention Period:</strong>
                        <span>{selectedRequest.retention_period_years} years</span>
                      </div>
                    )}
                    {selectedRequest.reason && (
                      <div className={styles.detailRow}>
                        <strong>Patient Reason:</strong>
                        <span>{selectedRequest.reason}</span>
                      </div>
                    )}
                    {selectedRequest.can_be_deleted_now !== undefined && (
                      <div className={styles.detailRow}>
                        <strong>Can Be Deleted Now:</strong>
                        <span>{selectedRequest.can_be_deleted_now ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                  </div>

                  {reviewAction === 'reject' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="rejectionReason">Rejection Reason *</label>
                      <select
                        id="rejectionReason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className={styles.formInput}
                        required
                      >
                        <option value="">Select a reason</option>
                        <option value="legal_retention">Legal retention period not met</option>
                        <option value="active_appointments">Patient has active appointments</option>
                        <option value="unpaid_invoices">Patient has unpaid invoices</option>
                        <option value="legal_obligation">Legal obligation to retain records</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}

                  {reviewAction === 'reject' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="rejectionNotes">Rejection Notes</label>
                      <textarea
                        id="rejectionNotes"
                        value={rejectionNotes}
                        onChange={(e) => setRejectionNotes(e.target.value)}
                        className={styles.formTextarea}
                        rows={3}
                        placeholder="Optional notes about the rejection..."
                      />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="reviewNotes">Review Notes</label>
                    <textarea
                      id="reviewNotes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className={styles.formTextarea}
                      rows={3}
                      placeholder="Optional notes about your review decision..."
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setShowReviewModal(false)}
                    disabled={reviewing}
                  >
                    Cancel
                  </button>
                  <button
                    className={reviewAction === 'approve' ? styles.approveButton : styles.rejectButton}
                    onClick={submitReview}
                    disabled={reviewing || (reviewAction === 'reject' && !rejectionReason)}
                  >
                    {reviewing ? (
                      <>
                        <span className={styles.spinner}></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        {reviewAction === 'approve' ? (
                          <>
                            <CheckCircleIcon size="sm" />
                            Approve Request
                          </>
                        ) : (
                          <>
                            <CloseIcon size="sm" />
                            Reject Request
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

