import { useEffect, useState } from 'react';
import { PrivacyService } from '../../../services/api/privacy';
import type { PrivacyPolicyStatus, ThirdPartyService } from '../../../services/api/privacy';
import styles from './PrivacyPolicyStatus.module.scss';

interface PrivacyPolicyStatusProps {
  showActions?: boolean;
  onAccepted?: () => void;
}

export const PrivacyPolicyStatusCard: React.FC<PrivacyPolicyStatusProps> = ({
  showActions = true,
  onAccepted,
}) => {
  const [status, setStatus] = useState<PrivacyPolicyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PrivacyService.getPrivacyPolicyStatus();
      setStatus(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load Privacy Policy status');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setAccepting(true);
      await PrivacyService.acceptPrivacyPolicy();
      await loadStatus();
      onAccepted?.();
    } catch (err: any) {
      setError(err.message || 'Failed to accept Privacy Policy');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <span className={styles.spinner}></span>
        <span>Loading Privacy Policy status...</span>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorAlert}>{error}</div>;
  }

  if (!status) return null;

  const thirdPartyEntries = status.third_party_data_sharing
    ? Object.entries(status.third_party_data_sharing)
    : [];

  return (
    <section className={styles.privacySection}>
      <div className={styles.sectionHeader}>
        <h2>Privacy Policy</h2>
        <p>Review your Privacy Policy acceptance status and current version.</p>
      </div>

      <div className={styles.statusCard}>
        <div className={styles.statusItem}>
          <span>Status</span>
          <strong className={`${styles.statusBadge} ${status.accepted ? styles.accepted : styles.pending}`}>
            {status.accepted ? 'Accepted' : 'Not Accepted'}
          </strong>
        </div>
        <div className={styles.statusItem}>
          <span>Accepted On</span>
          <strong>{status.accepted_date ? new Date(status.accepted_date).toLocaleDateString() : 'N/A'}</strong>
        </div>
        <div className={styles.statusItem}>
          <span>Current Version</span>
          <strong>{status.version || 'N/A'}</strong>
        </div>
        <div className={styles.statusItem}>
          <span>Latest Version</span>
          <strong>{status.latest_version}</strong>
        </div>
      </div>

      {status.needs_update && (
        <div className={styles.warning}>
          ⚠️ Our Privacy Policy has been updated. Please review and accept the latest version.
        </div>
      )}

      {showActions && (
        <div className={styles.actions}>
          <a
            className={`${styles.button} ${styles.secondaryButton}`}
            href={status.privacy_policy_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 Read Privacy Policy
          </a>
          {(!status.accepted || status.needs_update) && (
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? 'Accepting...' : '✅ Accept Privacy Policy'}
            </button>
          )}
        </div>
      )}

      {thirdPartyEntries.length > 0 && (
        <div className={styles.thirdPartySection}>
          <h3>Third-Party Data Sharing</h3>
          <p className={styles.thirdPartyIntro}>
            We collaborate with trusted third-party services to deliver secure telehealth experiences. Learn how your
            data is handled below.
          </p>

          <div className={styles.thirdPartyGrid}>
            {thirdPartyEntries.map(([key, service]) => (
              <ThirdPartyCard key={key} service={service} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

const ThirdPartyCard = ({ service }: { service: ThirdPartyService }) => (
  <article className={styles.thirdPartyCard}>
    <h4>{service.name}</h4>
    <p>
      <strong>Purpose:</strong> {service.purpose}
    </p>
    <p>
      <strong>Location:</strong> {service.location}
    </p>
    <p>
      <strong>Data Shared:</strong>
    </p>
    <ul className={styles.dataList}>
      {service.data_shared.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
    <p>
      <strong>Safeguards:</strong>
    </p>
    <ul className={styles.safeguardList}>
      {service.safeguards.map((safeguard) => (
        <li key={safeguard}>{safeguard}</li>
      ))}
    </ul>
    <a href={service.privacy_policy_url} target="_blank" rel="noopener noreferrer" className={styles.link}>
      View Privacy Policy →
    </a>
  </article>
);

