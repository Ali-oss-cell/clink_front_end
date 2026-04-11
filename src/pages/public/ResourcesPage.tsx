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
      <div className={`resourcesShell ${styles.resourcesPage}`}>
        <header className={styles.resourcesHero} aria-labelledby="resources-page-title">
          <div className="container">
            <p className={styles.resourcesKicker}>Resource library</p>
            <h1 id="resources-page-title" className={styles.resourcesTitle}>
              Mental health resources
            </h1>
            <p className={styles.resourcesLead}>
              Evidence-informed tools, emergency contacts and practical guides curated by the Tailored Psychology team.
            </p>
          </div>
        </header>

        <div className={styles.resourcesBody}>
          <div className="container">
            <section className={styles.highlightSection} aria-label="Featured topics">
              {resourceHighlights.map((highlight) => (
                <article key={highlight.title} className={styles.highlightCard}>
                  <h2 className={styles.cardTitle}>{highlight.title}</h2>
                  <p className={styles.cardIntro}>{highlight.description}</p>
                  <ul className={styles.detailList}>
                    {highlight.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>

            <section className={styles.resourceSection}>
              <div className={styles.sectionIntro}>
                <h2 className={styles.sectionHeading}>Immediate support</h2>
                <p className={styles.sectionDescription}>
                  If you or someone you care about is in crisis, please reach out to the services below.
                </p>
              </div>
              <div className={styles.cardGrid}>
                {crisisSupports.map((support) => (
                  <article key={support.name} className={`${styles.resourceCard} ${styles.crisisCard}`}>
                    <div className={styles.cardHeader}>
                      <h3>{support.name}</h3>
                      <span className={styles.badge}>{support.availability}</span>
                    </div>
                    <p className={styles.cardBody}>{support.description}</p>
                    <a
                      className={styles.phoneLink}
                      href={`tel:${support.phone.replace(/\s/g, '')}`}
                    >
                      {support.phone}
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.resourceSection}>
              <div className={styles.sectionIntro}>
                <h2 className={styles.sectionHeading}>Guides & fact sheets</h2>
                <p className={styles.sectionDescription}>
                  Short reads to help you understand therapy options, prepare for appointments and keep wellbeing plans on track.
                </p>
              </div>
              <div className={styles.cardGrid}>
                <article className={styles.resourceCard}>
                  <h3>Preparing for your first appointment</h3>
                  <p className={styles.cardBody}>Turn uncertainty into clarity with a practical checklist.</p>
                  <ul className={styles.detailList}>
                    <li>What your psychologist will ask in session one</li>
                    <li>How to summarise your goals and history</li>
                    <li>Questions to note down beforehand</li>
                  </ul>
                </article>
                <article className={styles.resourceCard}>
                  <h3>Goal setting workbook</h3>
                  <p className={styles.cardBody}>Break mental health goals into manageable, measurable steps.</p>
                  <ul className={styles.detailList}>
                    <li>Identify values and motivation drivers</li>
                    <li>Translate goals into micro-habits</li>
                    <li>Review progress with your clinician</li>
                  </ul>
                </article>
                <article className={styles.resourceCard}>
                  <h3>After session reflection sheet</h3>
                  <p className={styles.cardBody}>Capture insights, coping tools and follow-up actions.</p>
                  <ul className={styles.detailList}>
                    <li>Prompts for what resonated or felt challenging</li>
                    <li>Space to note homework or journaling tasks</li>
                    <li>Ideas for practising skills between sessions</li>
                  </ul>
                </article>
              </div>
            </section>

            <section className={styles.resourceSection}>
              <div className={styles.sectionIntro}>
                <h2 className={styles.sectionHeading}>Digital tools we recommend</h2>
                <p className={styles.sectionDescription}>
                  Trusted apps and programs you can use between sessions. Always discuss suitability with your clinician.
                </p>
              </div>
              <div className={styles.cardGrid}>
                {digitalTools.map((tool) => (
                  <article key={tool.name} className={styles.resourceCard}>
                    <div className={styles.cardHeader}>
                      <h3>{tool.name}</h3>
                      <span className={styles.badge}>{tool.cost}</span>
                    </div>
                    <p className={styles.cardBody}>{tool.summary}</p>
                    <a
                      className={styles.externalLink}
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit website
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.calloutSection}>
              <div className={styles.calloutCard}>
                <h2 className={styles.calloutTitle}>Ready to work with Tailored Psychology?</h2>
                <p className={styles.calloutLead}>
                  We blend telehealth and in-clinic appointments so you can access care anywhere in Australia.
                  Bookings are available Monday to Saturday, with daytime and evening options.
                </p>
                <ul className={styles.calloutList}>
                  <li>AHPRA registered psychologists with diverse specialties</li>
                  <li>Secure telehealth platform and encrypted session notes</li>
                  <li>Integrated Medicare and private health claiming</li>
                </ul>
                <p className={styles.calloutNote}>
                  Call our client team on <a href="tel:1300646393">1300 646 393</a> or email{' '}
                  <a href="mailto:info@tailoredpsychology.com.au">info@tailoredpsychology.com.au</a>.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};


