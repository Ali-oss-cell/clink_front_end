import { Link } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import styles from './MedicareRebatesPage.module.scss';

export const MedicareRebatesPage: React.FC = () => {
  return (
    <Layout>
      <section className={styles.hero}>
        <div className="container">
          <p className="tp-brand-kicker tp-brand-kicker--inverse">Medicare support</p>
          <h1 className={styles.heroTitle}>Medicare rebates for psychology sessions</h1>
          <p className={styles.heroSubtitle}>
            If you have a valid Mental Health Treatment Plan from your GP, you may be eligible for Medicare rebates
            for a limited number of sessions each calendar year.
          </p>
        </div>
      </section>

      <section className={`${styles.contentSection} tp-brand-softBg`}>
        <div className="container">
          <div className="tp-brand-card">
            <div className={styles.contentGrid}>
              <article className={styles.infoBlock}>
                <h2>Who may be eligible</h2>
                <p>
                  Medicare eligibility is generally based on GP assessment and referral documentation. Your GP can
                  advise if a Mental Health Treatment Plan is appropriate for your situation.
                </p>
              </article>

              <article className={styles.infoBlock}>
                <h2>How claiming usually works</h2>
                <p>
                  Once your session is complete, eligible rebates are claimed through Medicare according to current
                  rules. We can explain practical steps when you book.
                </p>
              </article>

              <article className={styles.infoBlock}>
                <h2>Need help deciding your next step?</h2>
                <p>
                  If you are unsure about eligibility, contact us and we can guide you on what to prepare before your
                  first appointment.
                </p>
              </article>
            </div>

            <div className={styles.actions}>
              <Link to="/contact" className={styles.secondaryButton}>
                Ask a question
              </Link>
              <Link to="/register" className={styles.primaryButton}>
                Book appointment
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
