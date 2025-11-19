import { useEffect, useState } from 'react';
import { PrivacyService } from '../../../services/api/privacy';
import type { ThirdPartyDataSharingResponse, ThirdPartyService } from '../../../services/api/privacy';
import styles from './ThirdPartyDataSharing.module.scss';

interface ThirdPartyDataSharingProps {
  preloadData?: ThirdPartyDataSharingResponse | null;
}

export const ThirdPartyDataSharing: React.FC<ThirdPartyDataSharingProps> = ({ preloadData = null }) => {
  const [data, setData] = useState<ThirdPartyDataSharingResponse | null>(preloadData);
  const [loading, setLoading] = useState(!preloadData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!preloadData) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PrivacyService.getThirdPartyDataSharing();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load third-party disclosures');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.note}>Loading third-party disclosures…</div>;
  }

  if (error) {
    return <div className={styles.note}>{error}</div>;
  }

  if (!data) return null;

  return (
    <section className={styles.disclosureSection}>
      <div className={styles.sectionHeader}>
        <h2>Third-Party Data Sharing Disclosure</h2>
        <p>
          We partner with a limited number of trusted providers to deliver secure telehealth experiences. Review the
          services below to understand how your data is protected.
        </p>
      </div>

      <p className={styles.note}>{data.note}</p>
      <p>Total Active Services: {data.total_active_services}</p>

      <div className={styles.servicesList}>
        {Object.entries<ThirdPartyService>(data.third_parties).map(([key, service]) => (
          <article key={key} className={styles.serviceCard}>
            <h3>{service.name}</h3>
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
              {service.data_shared.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
            <p>
              <strong>Security Safeguards:</strong>
            </p>
            <ul className={styles.safeguardList}>
              {service.safeguards.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a
              href={service.privacy_policy_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkButton}
            >
              View {service.name} Privacy Policy →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};

