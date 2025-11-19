import { useState, useEffect } from 'react';
import { getPrivacyPolicyStatus, acceptPrivacyPolicy, type PrivacyPolicyStatus } from '../../../services/api/privacy';
import { CheckCircleIcon, WarningIcon, CloseIcon } from '../../../utils/icons';
import styles from './PrivacyPolicyModal.module.scss';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  required?: boolean;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  required = false,
}) => {
  const [status, setStatus] = useState<PrivacyPolicyStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrivacyPolicyStatus();
      setStatus(data);
      setAccepted(data.accepted && !data.needs_update);
    } catch (err: any) {
      console.error('[PrivacyPolicyModal] Failed to load Privacy Policy status:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to load Privacy Policy status.';
      if (err.message?.includes('not authenticated')) {
        errorMessage = 'Please log in to view the Privacy Policy.';
      } else if (err.message?.includes('Access denied')) {
        errorMessage = 'This feature is only available for patients.';
      } else if (err.message?.includes('endpoint not found')) {
        errorMessage = 'Privacy Policy service is not available. Please contact support.';
      } else if (err.message?.includes('Network error')) {
        errorMessage = 'Unable to connect to server. Please check your connection and try again.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!accepted) {
      setAccepting(true);
      setError(null);
      try {
        await acceptPrivacyPolicy();
        setAccepted(true);
        onAccept();
        // Small delay to show success before closing
        setTimeout(() => {
          onClose();
        }, 500);
      } catch (err: any) {
        console.error('[PrivacyPolicyModal] Failed to accept Privacy Policy:', err);
        
        // Provide user-friendly error messages
        let errorMessage = 'Failed to accept Privacy Policy. Please try again.';
        if (err.message?.includes('not authenticated')) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (err.message?.includes('Access denied')) {
          errorMessage = 'This feature is only available for patients.';
        } else if (err.message?.includes('endpoint not found')) {
          errorMessage = 'Privacy Policy service is not available. Please contact support.';
        } else if (err.message?.includes('Network error')) {
          errorMessage = 'Unable to connect to server. Please check your connection and try again.';
        } else {
          errorMessage = err.message || errorMessage;
        }
        
        setError(errorMessage);
      } finally {
        setAccepting(false);
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={!required ? onClose : undefined}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Privacy Policy</h2>
          {!required && (
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              <CloseIcon size="md" />
            </button>
          )}
        </div>

        {loading && (
          <div className={styles.loadingState}>
            <p>Loading Privacy Policy...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorAlert}>
            <WarningIcon size="sm" />
            <span>{error}</span>
          </div>
        )}

        {status && !loading && (
          <>
            {status.needs_update && (
              <div className={styles.updateAlert}>
                <WarningIcon size="sm" />
                <div>
                  <p className={styles.alertTitle}>Privacy Policy Updated</p>
                  <p className={styles.alertText}>
                    The Privacy Policy has been updated. Please review and accept the new version to continue.
                  </p>
                </div>
              </div>
            )}

            <div className={styles.versionInfo}>
              <p className={styles.versionText}>
                <strong>Version:</strong> {status.latest_version}
                {status.accepted && status.version && (
                  <span className={styles.previousVersion}>
                    {' '}(Previously accepted: {status.version})
                  </span>
                )}
              </p>
            </div>

            <div className={styles.policyContent}>
              <iframe
                src={status.privacy_policy_url}
                className={styles.policyIframe}
                title="Privacy Policy"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>

            <div className={styles.acceptanceSection}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className={styles.checkbox}
                  disabled={accepting}
                />
                <span className={styles.checkboxText}>
                  I have read and agree to the Privacy Policy <span className={styles.required}>*</span>
                </span>
              </label>
            </div>

            <div className={styles.modalActions}>
              {!required && (
                <button
                  onClick={onClose}
                  className={styles.cancelButton}
                  disabled={accepting}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleAccept}
                disabled={!accepted || accepting}
                className={styles.acceptButton}
              >
                {accepting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon size="sm" />
                    Accept Privacy Policy
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

