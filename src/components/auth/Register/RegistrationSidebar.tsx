import styles from './RegistrationSidebar.module.scss';

export const RegistrationSidebar: React.FC = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.trustSection}>
        <h3 className={styles.sectionTitle}>Why Choose MindWell?</h3>
        <div className={styles.trustItems}>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>✓</div>
            <div className={styles.trustText}>
              <strong>Licensed Professionals</strong>
              <span>All therapists are fully qualified and registered</span>
            </div>
          </div>
          
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>✓</div>
            <div className={styles.trustText}>
              <strong>Secure & Private</strong>
              <span>HIPAA compliant with end-to-end encryption</span>
            </div>
          </div>
          
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>✓</div>
            <div className={styles.trustText}>
              <strong>Proven Results</strong>
              <span>95% of patients report improved wellbeing</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.helpSection}>
        <h3 className={styles.sectionTitle}>Need Assistance?</h3>
        <div className={styles.helpItems}>
          <div className={styles.helpItem}>
            <div className={styles.helpIcon}>📞</div>
            <div className={styles.helpText}>
              <strong>Call 1800 MINDWELL</strong>
              <span>Mon-Fri 9am-5pm AEST</span>
            </div>
          </div>
          
          <div className={styles.helpItem}>
            <div className={styles.helpIcon}>✉️</div>
            <div className={styles.helpText}>
              <strong>Email Support</strong>
              <span>support@mindwellclinic.com.au</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.testimonialSection}>
        <div className={styles.testimonial}>
          <div className={styles.quote}>
            "The registration was simple and I felt confident about my privacy from day one."
          </div>
          <div className={styles.author}>- Sarah M., Patient</div>
        </div>
      </div>
    </div>
  );
};
