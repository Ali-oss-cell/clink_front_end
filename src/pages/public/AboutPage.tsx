import { Layout } from '../../components/common/Layout/Layout';
import styles from './PublicPages.module.scss';

export const AboutPage: React.FC = () => {
  return (
    <Layout className={styles.publicLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>About Tailored Psychology</h1>
            <p className={styles.pageSubtitle}>
              Professional, compassionate psychology services across Australia
            </p>
          </div>

          <div className={styles.contentSection}>
            <h2>Our Mission</h2>
            <p>
              At Tailored Psychology, we're committed to providing accessible, evidence-based 
              psychological services to help Australians achieve better mental health and wellbeing. 
              Our team of qualified psychologists work with you to develop personalized treatment 
              plans that address your unique needs and goals.
            </p>

            <h2>Our Team</h2>
            <p>
              All our psychologists are fully registered with AHPRA (Australian Health 
              Practitioner Regulation Agency) and are members of the Australian Psychological 
              Society (APS). We specialize in a range of therapeutic approaches including 
              Cognitive Behavioral Therapy (CBT), Acceptance and Commitment Therapy (ACT), 
              and mindfulness-based interventions.
            </p>

            <h2>Why Choose Us?</h2>
            <ul>
              <li>AHPRA registered and APS member psychologists</li>
              <li>Medicare rebates available with GP referral</li>
              <li>Secure telehealth sessions available</li>
              <li>Evidence-based therapeutic approaches</li>
              <li>Flexible appointment scheduling</li>
              <li>Confidential and professional service</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};
