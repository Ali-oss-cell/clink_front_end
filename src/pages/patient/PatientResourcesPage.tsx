import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { resourceService, type Resource, type ResourceCategory } from '../../services/api/resources';
import styles from './PatientPages.module.scss';

export const PatientResourcesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = authService.getStoredUser();

  useEffect(() => {
    fetchCategories();
    fetchResources();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const data = await resourceService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      // Use default categories if API fails
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = activeCategory !== 'all' ? { category: activeCategory, page_size: 50 } : { page_size: 50 };
      const response = await resourceService.getResources(params);
      setResources(response.results);
    } catch (err: any) {
      console.error('Failed to load resources:', err);
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const emergencyContacts = [
    {
      name: 'Lifeline',
      phone: '13 11 14',
      description: '24/7 crisis support and suicide prevention',
      availability: '24/7'
    },
    {
      name: 'Beyond Blue',
      phone: '1300 22 4636',
      description: 'Support for anxiety, depression and suicide prevention',
      availability: '24/7'
    },
    {
      name: 'Kids Helpline',
      phone: '1800 55 1800',
      description: 'Free, private and confidential 24/7 phone and online counselling service for young people aged 5 to 25',
      availability: '24/7'
    },
    {
      name: '000 Emergency',
      phone: '000',
      description: 'Life threatening emergencies',
      availability: '24/7'
    }
  ];

  // Build categories list with "All" option
  const allCategories = [
    { id: 'all', name: 'All Resources', icon: '📚', description: 'Browse all resources', resource_count: resources.length },
    ...categories
  ];

  return (
    <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Mental Health Resources</h1>
            <p>Educational materials and support resources for your mental health journey</p>
          </div>

          {/* Emergency Contacts */}
          <div className={styles.emergencySection}>
            <h2>🚨 Need Immediate Help?</h2>
            <div className={styles.emergencyGrid}>
              {emergencyContacts.map((contact, index) => (
                <div key={index} className={styles.emergencyCard}>
                  <div className={styles.emergencyHeader}>
                    <h3>{contact.name}</h3>
                    <span className={styles.availability}>{contact.availability}</span>
                  </div>
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className={styles.phoneNumber}>
                    {contact.phone}
                  </a>
                  <p className={styles.emergencyDescription}>{contact.description}</p>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
            </div>
          )}

          {/* Category Filter */}
          <div className={styles.categoriesSection}>
            <h2>Browse by Topic</h2>
            <div className={styles.categoryGrid}>
              {allCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`${styles.categoryButton} ${activeCategory === category.id ? styles.active : ''}`}
                >
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <span className={styles.categoryName}>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          <div className={styles.resourcesSection}>
            <h2>
              {activeCategory === 'all' 
                ? 'All Resources' 
                : allCategories.find(c => c.id === activeCategory)?.name || 'Resources'}
            </h2>
            {loading ? (
              <div className={styles.loadingState}>
                <p>Loading resources...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No resources found in this category.</p>
              </div>
            ) : (
              <div className={styles.resourcesGrid}>
                {resources.map((resource) => (
                  <div key={resource.id} className={styles.resourceCard}>
                    <div className={styles.resourceIcon}>{resource.icon}</div>
                    <div className={styles.resourceContent}>
                      <div className={styles.resourceHeader}>
                        <h3>{resource.title}</h3>
                        <span className={styles.resourceType}>{resource.type.toUpperCase()}</span>
                      </div>
                      <p className={styles.resourceDescription}>{resource.description}</p>
                      <button 
                        className={styles.resourceButton}
                        onClick={() => window.location.href = `/patient/resources/${resource.id}`}
                      >
                        View Resource →
                      </button>
                    </div>
                  </div>
                ))
              }
              </div>
            )}
          </div>

          {/* Self-Help Tools */}
          <div className={styles.toolsSection}>
            <h2>🛠️ Self-Help Tools</h2>
            <div className={styles.toolsGrid}>
              <div className={styles.toolCard}>
                <h3>🎯 Mood Tracker</h3>
                <p>Track your daily mood and identify patterns over time.</p>
                <button className={styles.toolButton}>Coming Soon</button>
              </div>
              <div className={styles.toolCard}>
                <h3>📝 Thought Journal</h3>
                <p>Record and reflect on your thoughts and feelings.</p>
                <button className={styles.toolButton}>Coming Soon</button>
              </div>
              <div className={styles.toolCard}>
                <h3>🎧 Guided Exercises</h3>
                <p>Audio exercises for relaxation and mindfulness.</p>
                <button className={styles.toolButton}>Coming Soon</button>
              </div>
              <div className={styles.toolCard}>
                <h3>📊 Progress Dashboard</h3>
                <p>View your mental health journey progress.</p>
                <button className={styles.toolButton}>Coming Soon</button>
              </div>
            </div>
          </div>

          {/* Additional Support */}
          <div className={styles.supportSection}>
            <h2>💬 Additional Support</h2>
            <div className={styles.supportGrid}>
              <div className={styles.supportCard}>
                <h3>Support Groups</h3>
                <p>Connect with others who understand your experiences.</p>
              </div>
              <div className={styles.supportCard}>
                <h3>Educational Workshops</h3>
                <p>Attend workshops on various mental health topics.</p>
              </div>
              <div className={styles.supportCard}>
                <h3>Family Resources</h3>
                <p>Information and support for family members.</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className={styles.disclaimer}>
            <p>
              <strong>Disclaimer:</strong> These resources are for educational purposes only and do not replace professional medical advice. 
              If you are experiencing a mental health crisis, please contact emergency services or one of the helplines listed above.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

