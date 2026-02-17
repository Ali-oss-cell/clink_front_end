import { Link } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import styles from './AboutPage.module.scss';

export const AboutPage: React.FC = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>About Tailored Psychology</h1>
          <p className={styles.heroSubtitle}>
            Professional, compassionate psychology services across Australia
          </p>
        </div>
      </section>

      <section className={styles.content}>
        <div className="container">
          <div className={styles.contentInner}>
            <div className={styles.section}>
              <h2>Our Mission</h2>
              <p>
                At Tailored Psychology, we're committed to providing accessible, evidence-based 
                psychological services to help Australians achieve better mental health and wellbeing. 
                Our team of qualified psychologists work with you to develop personalized treatment 
                plans that address your unique needs and goals.
              </p>
            </div>

            <div className={styles.section}>
              <h2>Our Team</h2>
              <p>
                All our psychologists are fully registered with AHPRA (Australian Health 
                Practitioner Regulation Agency) and are members of the Australian Psychological 
                Society (APS). We specialize in a range of therapeutic approaches including 
                Cognitive Behavioral Therapy (CBT), Acceptance and Commitment Therapy (ACT), 
                and mindfulness-based interventions.
              </p>
            </div>

            <div className={styles.section}>
              <h2>Why Choose Us?</h2>
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

            <div className={styles.ctaBlock}>
              <h2>Ready to Get Started?</h2>
              <p>Book your first appointment today and take the first step towards better mental health.</p>
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
