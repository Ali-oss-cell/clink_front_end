import { Layout } from '../../components/common/Layout/Layout';
import styles from './PublicPages.module.scss';

type CrisisSupport = {
  name: string;
  phone: string;
  description: string;
  availability: string;
};

type ResourceHighlight = {
  title: string;
  description: string;
  details: string[];
};

type DigitalTool = {
  name: string;
  summary: string;
  link: string;
  cost: string;
};

const crisisSupports: CrisisSupport[] = [
  {
    name: 'Lifeline',
    phone: '13 11 14',
    description: '24/7 crisis support, suicide prevention and confidential counselling.',
    availability: '24/7'
  },
  {
    name: 'Beyond Blue',
    phone: '1300 22 4636',
    description: 'Support for anxiety, depression and suicidal thoughts with phone and webchat options.',
    availability: '24/7'
  },
  {
    name: 'Kids Helpline',
    phone: '1800 55 1800',
    description: 'Private counselling for young people aged 5–25 via phone, chat and email.',
    availability: '24/7'
  },
  {
    name: 'Emergency Services',
    phone: '000',
    description: 'Call if you or someone else is in immediate danger or at risk of harm.',
    availability: 'Immediate'
  }
];

const resourceHighlights: ResourceHighlight[] = [
  {
    title: 'Understanding Therapy',
    description: 'Learn what to expect in your first sessions and how evidence-based care is structured.',
    details: [
      'How we match you with a registered psychologist',
      'What a mental health treatment plan covers',
      'Questions to ask during your first appointment'
    ]
  },
  {
    title: 'Medicare & Rebates',
    description: 'A quick explainer on referrals, care plans and claiming rebates after each session.',
    details: [
      'Steps to obtain a GP referral',
      'How many rebated sessions you can access',
      'What to bring to your appointment'
    ]
  },
  {
    title: 'Family & Carer Support',
    description: 'Practical strategies to help you support someone who is attending therapy.',
    details: [
      'Having supportive conversations at home',
      'Recognising signs of burnout or relapse',
      'Setting up shared wellbeing check-ins'
    ]
  }
];

const digitalTools: DigitalTool[] = [
  {
    name: 'Smiling Mind',
    summary: 'Guided mindfulness meditations created by psychologists for different age groups.',
    link: 'https://www.smilingmind.com.au/smiling-mind-app',
    cost: 'Free'
  },
  {
    name: 'This Way Up',
    summary: 'Clinician-designed online CBT programs for anxiety, depression and stress.',
    link: 'https://thiswayup.org.au/',
    cost: 'Low-cost or rebate eligible'
  },
  {
    name: 'Black Dog Snapshot',
    summary: 'Five-minute wellbeing check that offers tailored recommendations.',
    link: 'https://www.blackdoginstitute.org.au/resources-support/digital-tools-apps/',
    cost: 'Free'
  }
];

export const ResourcesPage: React.FC = () => {
  return (
    <Layout className={styles.publicLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Mental Health Resources</h1>
            <p className={styles.pageSubtitle}>
              Evidence-informed tools, emergency contacts and practical guides curated by the MindWell team.
            </p>
          </div>

          <section className={styles.highlightSection}>
            {resourceHighlights.map((highlight) => (
              <article key={highlight.title} className={styles.highlightCard}>
                <h2>{highlight.title}</h2>
                <p>{highlight.description}</p>
                <ul>
                  {highlight.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </section>

          <section className={styles.resourceSection}>
            <h2>Immediate Support</h2>
            <p>If you or someone you care about is in crisis, please reach out to the services below.</p>
            <div className={styles.cardGrid}>
              {crisisSupports.map((support) => (
                <article key={support.name} className={styles.resourceCard}>
                  <div className={styles.cardHeader}>
                    <h3>{support.name}</h3>
                    <span className={styles.badge}>{support.availability}</span>
                  </div>
                  <p>{support.description}</p>
                  <a
                    className={styles.cardLink}
                    href={`tel:${support.phone.replace(/\s/g, '')}`}
                  >
                    {support.phone}
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.resourceSection}>
            <h2>Guides & Fact Sheets</h2>
            <p>
              Short reads to help you understand therapy options, prepare for appointments and keep wellbeing plans on track.
            </p>
            <div className={styles.cardGrid}>
              <article className={styles.resourceCard}>
                <h3>Preparing for Your First Appointment</h3>
                <p>Turn uncertainty into clarity with a practical checklist.</p>
                <ul>
                  <li>What your psychologist will ask in session one</li>
                  <li>How to summarise your goals and history</li>
                  <li>Questions to note down beforehand</li>
                </ul>
              </article>
              <article className={styles.resourceCard}>
                <h3>Goal Setting Workbook</h3>
                <p>Break mental health goals into manageable, measurable steps.</p>
                <ul>
                  <li>Identify values and motivation drivers</li>
                  <li>Translate goals into micro-habits</li>
                  <li>Review progress with your clinician</li>
                </ul>
              </article>
              <article className={styles.resourceCard}>
                <h3>After Session Reflection Sheet</h3>
                <p>Capture insights, coping tools and follow-up actions.</p>
                <ul>
                  <li>Prompts for what resonated or felt challenging</li>
                  <li>Space to note homework or journaling tasks</li>
                  <li>Ideas for practising skills between sessions</li>
                </ul>
              </article>
            </div>
          </section>

          <section className={styles.resourceSection}>
            <h2>Digital Tools We Recommend</h2>
            <div className={styles.cardGrid}>
              {digitalTools.map((tool) => (
                <article key={tool.name} className={styles.resourceCard}>
                  <div className={styles.cardHeader}>
                    <h3>{tool.name}</h3>
                    <span className={styles.badge}>{tool.cost}</span>
                  </div>
                  <p>{tool.summary}</p>
                  <a
                    className={styles.cardLink}
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit website →
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.calloutSection}>
            <div className={styles.calloutCard}>
              <h2>Ready to work with MindWell?</h2>
              <p>
                We blend telehealth and in-clinic appointments so you can access care anywhere in Australia. 
                Bookings are available Monday to Saturday, with daytime and evening options.
              </p>
              <ul>
                <li>AHPRA registered psychologists with diverse specialties</li>
                <li>Secure telehealth platform and encrypted session notes</li>
                <li>Integrated Medicare and private health claiming</li>
              </ul>
              <p className={styles.cardNote}>
                Call our client team on <a href="tel:1300646393">1300 MINDWELL</a> or email <a href="mailto:info@mindwellclinic.com.au">info@mindwellclinic.com.au</a>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};


