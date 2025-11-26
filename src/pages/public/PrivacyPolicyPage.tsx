import { Layout } from '../../components/common/Layout/Layout';
import styles from './PublicPages.module.scss';

const clinicName = 'Tailored Psychology';
const effectiveDate = '2025-11-24';
const lastUpdated = '2025-11-24';
const version = '1.0';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <Layout className={styles.publicLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Privacy Policy</h1>
            <p className={styles.pageSubtitle}>
              How we collect, use, disclose, and protect your personal information
            </p>
          </div>
          <div className={styles.contentSection}>
              <section>
                <h2>1. Introduction</h2>
                <p>
                  {clinicName} (“we”, “us”, “our”) is committed to protecting your privacy and personal
                  information in accordance with the Australian Privacy Act 1988 (Cth) and the
                  Australian Privacy Principles (APPs). By using our website, patient portal, mobile
                  application, or telehealth services you consent to the collection, use, disclosure, and
                  protection of your information as outlined in this Privacy Policy.
                </p>
              </section>

              <section>
                <h2>2. Information We Collect</h2>
                <h3>2.1 Personal Information</h3>
                <p>We collect the following types of personal information to provide clinical services:</p>
                <ul>
                  <li>
                    <strong>Identity Information:</strong> Full name, date of birth, gender, contact details,
                    Medicare number, emergency contacts.
                  </li>
                  <li>
                    <strong>Health Information:</strong> Medical and mental health history, current
                    medications, presenting concerns, therapy goals, progress notes, treatment plans.
                  </li>
                  <li>
                    <strong>Financial Information:</strong> Payment details (processed via Stripe),
                    Medicare claim data, insurance information, billing history.
                  </li>
                  <li>
                    <strong>Technical Information:</strong> IP address, device and browser details, usage
                    data, cookies, and similar tracking technologies.
                  </li>
                </ul>

                <h3>2.2 Sensitive Information</h3>
                <p>
                  We collect sensitive information (as defined under the Privacy Act 1988) only when it is
                  necessary for treatment or required by law. This may include health information,
                  mental health information, and cultural background when relevant to care.
                </p>
              </section>

              <section>
                <h2>3. How We Collect Information</h2>
                <ol>
                  <li>
                    <strong>Directly from you:</strong> During registration, intake forms, consultations,
                    telehealth sessions, surveys, secure messaging, and payment processing.
                  </li>
                  <li>
                    <strong>From third parties:</strong> Referring GPs, other healthcare providers, Medicare,
                    and health insurers (with consent).
                  </li>
                  <li>
                    <strong>Automatically:</strong> Through our website, apps, cookies, analytics, and—where
                    you provide consent—video call recordings.
                  </li>
                </ol>
              </section>

              <section>
                <h2>4. How We Use Your Information</h2>
                <h3>4.1 Primary Purposes</h3>
                <ul>
                  <li>Delivering psychological assessments, therapy, and care coordination.</li>
                  <li>Scheduling, reminding, and managing appointments.</li>
                  <li>Maintaining clinical records and treatment plans.</li>
                  <li>Processing payments, Medicare claims, and issuing invoices.</li>
                  <li>Communicating with you, your GP, or nominated supports (with consent).</li>
                  <li>Meeting legal, regulatory, and mandatory reporting obligations.</li>
                </ul>

                <h3>4.2 Secondary Purposes</h3>
                <ul>
                  <li>Improving our services, platform, and support experience.</li>
                  <li>Training and supervision (using de-identified information).</li>
                  <li>
                    Sending newsletters or service updates when you have opted in (you can opt out at any
                    time).
                  </li>
                </ul>
              </section>

              <section>
                <h2>5. Disclosure of Information</h2>
                <h3>5.1 Who We Share Information With</h3>
                <ul>
                  <li>Your treating psychologist and clinical team.</li>
                  <li>Referring GPs or other health professionals (with your consent).</li>
                  <li>Medicare Australia and health insurers for claims processing.</li>
                  <li>Regulatory authorities (e.g., AHPRA) and courts where legally required.</li>
                  <li>Emergency services or your nominated emergency contact if there is a risk of harm.</li>
                </ul>

                <h3>5.2 Third-Party Service Providers</h3>
                <ul>
                  <li>
                    <strong>Twilio (USA):</strong> Video calls, SMS, WhatsApp notifications. Safeguards include
                    TLS encryption, SOC 2 compliance, and GDPR alignment.
                  </li>
                  <li>
                    <strong>Stripe (USA):</strong> Payment processing. Safeguards include PCI DSS Level 1
                    compliance and encrypted transmission.
                  </li>
                  <li>
                    <strong>SendGrid via Twilio (USA):</strong> Email delivery for reminders and notifications.
                  </li>
                </ul>
                <p>
                  We require all service providers to use your information only for the contracted purpose
                  and to implement equivalent privacy safeguards.
                </p>
              </section>

              <section>
                <h2>6. Cross-Border Disclosure</h2>
                <p>
                  Some providers (Twilio, Stripe, SendGrid) store data in the United States. We take
                  reasonable steps to ensure overseas recipients comply with privacy obligations,
                  including contractual safeguards, encryption, and adherence to international standards.
                </p>
              </section>

              <section>
                <h2>7. Data Security</h2>
                <p>
                  We implement technical, organisational, and physical safeguards such as HTTPS/TLS
                  encryption, role-based access controls, secure hosting, penetration testing, audit
                  logging, staff training, and secure disposal of paper and electronic records. While no
                  system is 100% secure, we continuously review our security posture.
                </p>
              </section>

              <section>
                <h2>8. Data Retention</h2>
                <ul>
                  <li>
                    <strong>Clinical Records:</strong> Adults – 7 years after the last consultation; Children –
                    until age 25 (or longer if required by law).
                  </li>
                  <li>
                    <strong>Financial Records:</strong> 7 years to meet taxation obligations.
                  </li>
                  <li>
                    <strong>Account Information:</strong> While your account is active and up to 7 years after
                    closure for compliance purposes.
                  </li>
                </ul>
                <p>Data is securely deleted or de-identified when no longer required.</p>
              </section>

              <section>
                <h2>9. Your Rights</h2>
                <p>Under the Privacy Act 1988 you may:</p>
                <ul>
                  <li>Request access to your personal information (response within 30 days).</li>
                  <li>Correct inaccurate, incomplete, or outdated information.</li>
                  <li>Request deletion (subject to clinical record retention laws).</li>
                  <li>Withdraw consent for marketing, telehealth recordings, or data sharing.</li>
                  <li>
                    Lodge a complaint with us or the Office of the Australian Information Commissioner
                    (OAIC).
                  </li>
                </ul>
              </section>

              <section>
                <h2>10. Cookies and Tracking</h2>
                <p>
                  We use essential cookies for authentication and security, analytics cookies to improve
                  our services, and marketing cookies (only with consent). You can adjust cookie settings
                  in your browser, though essential features may not function without them.
                </p>
              </section>

              <section>
                <h2>11. Children’s Privacy</h2>
                <p>
                  Services for individuals under 18 require parent/guardian consent. Parents or guardians
                  can request access to their child’s information, and children’s records are retained
                  until they turn 25. We apply heightened privacy safeguards to all minors.
                </p>
              </section>

              <section>
                <h2>12. Telehealth Services</h2>
                <p>
                  Telehealth appointments are delivered via Twilio with end-to-end encryption. Separate
                  telehealth consent is required and can be withdrawn at any time. We recommend choosing a
                  private location and secure network for each session. Recordings only occur with explicit
                  consent.
                </p>
              </section>

              <section>
                <h2>13. Changes to This Policy</h2>
                <p>
                  We may update this policy to reflect legal, technical, or operational changes. We will
                  notify you via email, in-app alerts, or during login, specify the effective date, and
                  request renewed acceptance where required. Previous versions are archived.
                </p>
              </section>

              <section>
                <h2>14. Contact Us</h2>
                <p>If you have questions or wish to exercise your rights, contact:</p>
                <ul>
                  <li>
                    <strong>Privacy Officer:</strong> privacy@tailoredpsychology.com.au | 1300 646 393 |
                    Level 12, 123 Collins Street, Melbourne VIC 3000
                  </li>
                  <li>
                    <strong>Data Protection Officer:</strong> dpo@tailoredpsychology.com.au
                  </li>
                </ul>
              </section>

              <section>
                <h2>15. Third-Party Services</h2>
                <ul>
                  <li>
                    <strong>Twilio:</strong> Video conferencing, SMS, WhatsApp notifications – SOC 2 & GDPR
                    compliant. Privacy Policy:{' '}
                    <a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noreferrer">
                      https://www.twilio.com/legal/privacy
                    </a>
                  </li>
                  <li>
                    <strong>Stripe:</strong> Secure payment processing (PCI DSS Level 1). Privacy Policy:{' '}
                    <a href="https://stripe.com/au/privacy" target="_blank" rel="noreferrer">
                      https://stripe.com/au/privacy
                    </a>
                  </li>
                  <li>
                    <strong>SendGrid:</strong> Transactional email delivery (encrypted, GDPR aligned). Privacy
                    Policy:{' '}
                    <a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noreferrer">
                      https://www.twilio.com/legal/privacy
                    </a>
                  </li>
                </ul>
              </section>

              <section>
                <h2>16. Australian Privacy Principles Compliance</h2>
                <p>
                  This policy is aligned with APP 1–13, covering open management of personal information,
                  anonymity options, lawful collection, notification, use/disclosure limits, direct
                  marketing controls, cross-border safeguards, identifiers, data quality, security,
                  access, and correction rights.
                </p>
              </section>

              <section>
                <h2>17. Consent</h2>
                <p>
                  By using our services you consent to the collection, use, disclosure, and international
                  transfer of your information as described. You may withdraw consent at any time by
                  contacting us; however, this may affect our ability to deliver certain services.
                </p>
              </section>

              <section>
                <h2>Appendix – Quick Reference</h2>
                <ul>
                  <li>
                    <strong>Request Your Data:</strong>{' '}
                    <a href="/patient/account?tab=privacy">/patient/account?tab=privacy</a>
                  </li>
                  <li>
                    <strong>Update Information:</strong>{' '}
                    <a href="/patient/account">/patient/account</a>
                  </li>
                  <li>
                    <strong>Delete Account:</strong>{' '}
                    <a href="/patient/account?tab=privacy">Use the “Delete My Account” option</a>
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong>{' '}
                    <a href="/patient/account?tab=preferences">/patient/account?tab=preferences</a>
                  </li>
                  <li>
                    <strong>Make a Complaint:</strong>{' '}
                    <a href="/contact">Contact form</a> or{' '}
                    <a href="mailto:privacy@tailoredpsychology.com.au">privacy@tailoredpsychology.com.au</a>
                  </li>
                </ul>
              </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

