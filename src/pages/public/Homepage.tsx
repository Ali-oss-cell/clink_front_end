import { Link } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import styles from './Homepage.module.scss';

export const Homepage: React.FC = () => {
  return (
    <Layout className={styles.homepage}>
      <section className={styles.hero}>
        {/* Floating decorative elements */}
        <div className={styles.floatingElements}>
          <div className={`${styles.floatingShape} ${styles.shape1}`}></div>
          <div className={`${styles.floatingShape} ${styles.shape2}`}></div>
          <div className={`${styles.floatingShape} ${styles.shape3}`}></div>
          <div className={`${styles.floatingShape} ${styles.shape4}`}></div>
          <div className={`${styles.floatingShape} ${styles.shape5}`}></div>
        </div>

        {/* Drifting particles */}
        <div className={styles.driftingParticles}>
          <div className={`${styles.particle} ${styles.particle1}`}></div>
          <div className={`${styles.particle} ${styles.particle2}`}></div>
          <div className={`${styles.particle} ${styles.particle3}`}></div>
        </div>

        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Professional Psychology Services in Australia
            </h1>
            <p className={styles.heroSubtitle}>
              Compassionate care and evidence-based treatments for mental health and wellbeing. 
              Our AHPRA-registered psychologists are here to support your journey.
            </p>
            <div className={styles.heroActions}>
              <Link to="/register" className={styles.primaryButton}>
                Book Your Appointment
              </Link>
              <Link to="/about" className={styles.secondaryButton}>
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Choose MindWell Clinic?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h3>AHPRA Registered</h3>
              <p>All our psychologists are fully registered with the Australian Health Practitioner Regulation Agency.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Medicare Rebates</h3>
              <p>We're approved Medicare providers, making psychology services more affordable for you.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Telehealth Available</h3>
              <p>Access professional psychology services from the comfort of your home via secure video sessions.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Evidence-Based Care</h3>
              <p>We use proven therapeutic approaches tailored to your individual needs and goals.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
