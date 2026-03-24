import { Link } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import styles from './AboutPage.module.scss';

export const AboutPage: React.FC = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className="tp-brand-kicker tp-brand-kicker--inverse">About us</p>
          <h1 className={styles.heroTitle}>Psychology with intention</h1>
          <p className={styles.heroSubtitle}>
            Clinical rigour in a calm, respectful space—so getting help feels clear, not overwhelming.
          </p>
        </div>
      </section>

      <section className={`${styles.content} tp-brand-softBg`}>
        <div className="container">
          <div className={`${styles.contentInner} tp-brand-card`}>
            <div className={styles.section}>
              <p className="tp-brand-kicker">Our approach</p>
              <h2>Our mission</h2>
              <p>
                We offer accessible, evidence-based psychological care to support mental health and wellbeing across
                Australia. Our psychologists work with you on clear, personalised plans that reflect your goals—not a
                one-size template.
              </p>
            </div>

            <div className={styles.section}>
              <p className="tp-brand-kicker">Who you will see</p>
              <h2>Our team</h2>
              <p>
                Our psychologists are registered with AHPRA and align with professional standards including APS
                membership where applicable. We draw on approaches such as CBT, ACT, and mindfulness-based therapies,
                matched to what suits you.
              </p>
            </div>

            <div className={styles.section}>
              <p className="tp-brand-kicker">What you can expect</p>
              <h2>Why choose us</h2>
              <div className={styles.featureGrid}>
                {[
                  'AHPRA registered and APS member psychologists',
                  'Medicare rebates available with GP referral',
                  'Secure telehealth sessions available',
                  'Evidence-based therapeutic approaches',
                  'Flexible appointment scheduling',
                  'Confidential and professional service',
                ].map((item, i) => (
                  <div key={i} className={styles.featureItem}>
                    <span className={styles.featureCheck}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${styles.ctaBlock} tp-brand-card tp-brand-card--accent`}>
              <h2>Ready when you are</h2>
              <p>Book online in minutes, or browse services first—no pressure, just a clear next step.</p>
              <div className={styles.ctaButtons}>
                <Link to="/register" className={styles.primaryCTA}>Book Appointment</Link>
                <Link to="/services" className={styles.secondaryCTA}>View Our Services</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
