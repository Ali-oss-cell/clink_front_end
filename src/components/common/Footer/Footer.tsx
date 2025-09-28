import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Company Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>MindWell Clinic</h3>
            <p className={styles.description}>
              Professional psychological services providing compassionate care 
              and evidence-based treatments for mental health and wellbeing.
            </p>
            <div className={styles.credentials}>
              <span className={styles.credential}>AHPRA Registered</span>
              <span className={styles.credential}>Medicare Provider</span>
              <span className={styles.credential}>APS Member</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              <li><Link to="/about" className={styles.link}>About Us</Link></li>
              <li><Link to="/services" className={styles.link}>Our Services</Link></li>
              <li><Link to="/resources" className={styles.link}>Resources</Link></li>
              <li><Link to="/faqs" className={styles.link}>FAQs</Link></li>
              <li><Link to="/contact" className={styles.link}>Contact</Link></li>
            </ul>
          </div>

          {/* Patient Resources */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Patient Resources</h4>
            <ul className={styles.linkList}>
              <li><Link to="/register" className={styles.link}>Book Appointment</Link></li>
              <li><Link to="/login" className={styles.link}>Patient Portal</Link></li>
              <li><Link to="/resources/mental-health" className={styles.link}>Mental Health Info</Link></li>
              <li><Link to="/resources/crisis" className={styles.link}>Crisis Support</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Contact Information</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <strong>Phone:</strong> 1300 MINDWELL
              </div>
              <div className={styles.contactItem}>
                <strong>Email:</strong> info@mindwellclinic.com.au
              </div>
              <div className={styles.contactItem}>
                <strong>Address:</strong> 123 Collins Street<br />
                Melbourne VIC 3000
              </div>
              <div className={styles.emergencyNotice}>
                <strong>Emergency:</strong> Call 000 or Lifeline 13 11 14
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            © {currentYear} MindWell Clinic. All rights reserved.
          </div>
          <div className={styles.legalLinks}>
            <Link to="/privacy" className={styles.legalLink}>Privacy Policy</Link>
            <Link to="/terms" className={styles.legalLink}>Terms of Service</Link>
            <Link to="/accessibility" className={styles.legalLink}>Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
