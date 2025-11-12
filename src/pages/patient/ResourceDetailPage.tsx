import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { resourceService, type ResourceDetail } from '../../services/api/resources';
import styles from './PatientPages.module.scss';

export const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const user = authService.getStoredUser();

  useEffect(() => {
    if (id) {
      fetchResource();
    }
  }, [id]);

  const fetchResource = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch resource from API
      const data = await resourceService.getResource(parseInt(id));
      setResource(data);
      setIsBookmarked(data.is_bookmarked);
      
      // Track view
      await resourceService.trackView(parseInt(id));
    } catch (err: any) {
      console.error('Failed to load resource:', err);
      setError(err.message || 'Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const fetchResourceFallback = async () => {
    try {
      setLoading(true);
      // Fallback mock data if API not ready
      const mockResource: ResourceDetail = {
        id: parseInt(id || '1'),
        title: 'Understanding Anxiety: A Comprehensive Guide',
        description: 'Learn about anxiety disorders, symptoms, and evidence-based coping strategies.',
        category: 'anxiety',
        type: 'article',
        icon: '😰',
        content: `
          <h2>What is Anxiety?</h2>
          <p>Anxiety is a normal and often healthy emotion. However, when a person regularly feels disproportionate levels of anxiety, it might become a medical disorder.</p>
          
          <h3>Common Symptoms</h3>
          <ul>
            <li>Feeling nervous, restless or tense</li>
            <li>Having a sense of impending danger, panic or doom</li>
            <li>Increased heart rate</li>
            <li>Breathing rapidly (hyperventilation)</li>
            <li>Sweating and trembling</li>
            <li>Feeling weak or tired</li>
            <li>Trouble concentrating</li>
            <li>Having difficulty sleeping</li>
          </ul>
          
          <h3>Types of Anxiety Disorders</h3>
          <p><strong>Generalized Anxiety Disorder (GAD):</strong> Persistent and excessive worry about various aspects of life.</p>
          <p><strong>Social Anxiety Disorder:</strong> Intense fear of social situations and being judged by others.</p>
          <p><strong>Panic Disorder:</strong> Recurring panic attacks and fear of future attacks.</p>
          <p><strong>Specific Phobias:</strong> Intense fear of specific objects or situations.</p>
          
          <h3>Coping Strategies</h3>
          <ol>
            <li><strong>Deep Breathing:</strong> Practice slow, deep breaths to calm your nervous system.</li>
            <li><strong>Progressive Muscle Relaxation:</strong> Systematically tense and relax muscle groups.</li>
            <li><strong>Mindfulness Meditation:</strong> Focus on the present moment without judgment.</li>
            <li><strong>Regular Exercise:</strong> Physical activity helps reduce anxiety symptoms.</li>
            <li><strong>Healthy Sleep Habits:</strong> Maintain a consistent sleep schedule.</li>
            <li><strong>Limit Caffeine and Alcohol:</strong> These can worsen anxiety symptoms.</li>
          </ol>
          
          <h3>When to Seek Professional Help</h3>
          <p>Consider seeking help from a mental health professional if:</p>
          <ul>
            <li>Your anxiety is interfering with work, relationships, or daily activities</li>
            <li>You're experiencing panic attacks</li>
            <li>You're avoiding situations due to anxiety</li>
            <li>Your anxiety feels uncontrollable</li>
            <li>You're experiencing depression alongside anxiety</li>
          </ul>
          
          <h3>Treatment Options</h3>
          <p><strong>Cognitive Behavioral Therapy (CBT):</strong> Helps identify and change negative thought patterns.</p>
          <p><strong>Exposure Therapy:</strong> Gradually facing feared situations in a safe environment.</p>
          <p><strong>Medication:</strong> May include anti-anxiety medications or antidepressants.</p>
          <p><strong>Support Groups:</strong> Connect with others experiencing similar challenges.</p>
        `,
        content_type: 'html',
        author: 'Dr. Sarah Johnson, Clinical Psychologist',
        reviewer: 'Dr. Michael Chen, Psychiatrist',
        last_reviewed_date: '2024-01-20',
        duration_minutes: 15,
        difficulty_level: 'beginner',
        tags: ['anxiety', 'mental-health', 'coping-strategies', 'beginners', 'CBT'],
        view_count: 1520,
        average_rating: 4.7,
        total_ratings: 234,
        is_bookmarked: false,
        user_progress: 0,
        estimated_reading_time: '15 minutes',
        references: [
          {
            title: 'American Psychological Association - Anxiety',
            url: 'https://www.apa.org/topics/anxiety'
          },
          {
            title: 'Beyond Blue - Anxiety Fact Sheet',
            url: 'https://www.beyondblue.org.au/mental-health/anxiety'
          }
        ],
        related_resources: [
          {
            id: 5,
            title: 'Breathing Exercises for Anxiety Relief',
            type: 'video',
            thumbnail_url: undefined
          },
          {
            id: 8,
            title: 'Mindfulness Meditation Guide',
            type: 'audio',
            thumbnail_url: undefined
          },
          {
            id: 12,
            title: 'Anxiety Tracking Worksheet',
            type: 'worksheet',
            thumbnail_url: undefined
          }
        ]
      };
      
      setResource(mockResource);
      setIsBookmarked(mockResource.is_bookmarked);
    } catch (err: any) {
      console.error('Failed to load resource:', err);
      setError(err.message || 'Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!id) return;
    
    try {
      const action = isBookmarked ? 'remove' : 'add';
      const result = await resourceService.toggleBookmark(parseInt(id), action);
      setIsBookmarked(result.is_bookmarked);
      alert(result.is_bookmarked ? '✅ Added to bookmarks' : '❌ Removed from bookmarks');
    } catch (err: any) {
      console.error('Failed to bookmark:', err);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  const handleRate = async (rating: number) => {
    if (!id) return;
    
    try {
      setUserRating(rating);
      const result = await resourceService.rateResource(parseInt(id), rating);
      alert(`✅ Rated ${rating} stars. Thank you for your feedback!`);
      setShowRatingForm(false);
      
      // Update resource with new rating
      if (resource) {
        setResource({
          ...resource,
          average_rating: result.average_rating,
          total_ratings: result.total_ratings
        });
      }
    } catch (err: any) {
      console.error('Failed to rate:', err);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource?.title,
        text: resource?.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.loadingState}>
              <p>Loading resource...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !resource) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.errorState}>
              <h3>Error Loading Resource</h3>
              <p>{error || 'Resource not found'}</p>
              <button onClick={() => navigate('/patient/resources')} className={styles.backButton}>
                ← Back to Resources
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          {/* Back Button */}
          <button onClick={() => navigate('/patient/resources')} className={styles.backButton}>
            ← Back to Resources
          </button>

          {/* Resource Header */}
          <div className={styles.resourceDetailHeader}>
            <div className={styles.resourceMeta}>
              <span className={styles.resourceIcon}>{resource.icon}</span>
              <span className={styles.resourceCategory}>{resource.category_display}</span>
              <span className={styles.resourceType}>{resource.type_display}</span>
              <span className={styles.resourceDifficulty}>{resource.difficulty_display}</span>
            </div>
            
            <h1>{resource.title}</h1>
            <p className={styles.resourceDescription}>{resource.description}</p>
            
            <div className={styles.resourceInfo}>
              <div className={styles.infoItem}>
                <span>📖 {resource.estimated_time || resource.estimated_reading_time || `${resource.duration_minutes || 0} min`}</span>
              </div>
              <div className={styles.infoItem}>
                <span>👁️ {resource.view_count.toLocaleString()} views</span>
              </div>
              <div className={styles.infoItem}>
                <span>⭐ {resource.average_rating.toFixed(1)} ({resource.total_ratings} ratings)</span>
              </div>
            </div>

            <div className={styles.resourceActions}>
              <button onClick={handleBookmark} className={styles.actionButton}>
                {isBookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
              </button>
              <button onClick={handlePrint} className={styles.actionButton}>
                🖨️ Print
              </button>
              <button onClick={handleShare} className={styles.actionButton}>
                📤 Share
              </button>
              {(resource.has_download && (resource.download_file_url || resource.download_url)) && (
                <a 
                  href={resource.download_file_url || resource.download_url || ''} 
                  download 
                  className={styles.actionButton}
                >
                  📥 Download
                </a>
              )}
            </div>
          </div>

          {/* Resource Header Image */}
          {resource.has_image && resource.thumbnail_image_url && (
            <div className={styles.resourceHeaderImage}>
              <img 
                src={resource.thumbnail_image_url} 
                alt={resource.title}
              />
            </div>
          )}

          {/* Resource Content */}
          <div className={styles.resourceContent}>
            <div className={styles.contentMain}>
              {resource.content_type === 'html' && (
                <div 
                  className={styles.articleContent}
                  dangerouslySetInnerHTML={{ __html: resource.content }}
                />
              )}
              
              {resource.has_media && resource.media_url && (
                <>
                  {resource.content_type === 'video_url' && (
                    <div className={styles.videoContainer}>
                      <iframe
                        src={resource.media_url}
                        title={resource.title}
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                  )}
                  
                  {resource.content_type === 'audio_url' && (
                    <div className={styles.audioContainer}>
                      <audio controls src={resource.media_url}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className={styles.contentSidebar}>
              {/* Author Info */}
              <div className={styles.sidebarCard}>
                <h3>Author</h3>
                <p>{resource.author}</p>
                {resource.reviewer && (
                  <>
                    <h4>Reviewed by</h4>
                    <p>{resource.reviewer}</p>
                  </>
                )}
                {resource.last_reviewed_date && (
                  <p className={styles.reviewDate}>
                    Last reviewed: {new Date(resource.last_reviewed_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className={styles.sidebarCard}>
                <h3>Topics</h3>
                <div className={styles.tagsList}>
                  {resource.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className={styles.sidebarCard}>
                <h3>Rate this Resource</h3>
                {resource.user_rating ? (
                  <div className={styles.userRating}>
                    <p>Your rating: {'⭐'.repeat(resource.user_rating.rating)}</p>
                    {resource.user_rating.review && (
                      <p className={styles.userReview}>{resource.user_rating.review}</p>
                    )}
                    <button 
                      onClick={() => setShowRatingForm(true)}
                      className={styles.rateButton}
                    >
                      Update Rating
                    </button>
                  </div>
                ) : !showRatingForm ? (
                  <button 
                    onClick={() => setShowRatingForm(true)}
                    className={styles.rateButton}
                  >
                    Leave a Rating
                  </button>
                ) : (
                  <div className={styles.ratingForm}>
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(star)}
                          className={styles.starButton}
                        >
                          {star <= userRating ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setShowRatingForm(false)}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* References */}
          {resource.references && resource.references.length > 0 && (
            <div className={styles.referencesSection}>
              <h2>References & Further Reading</h2>
              <ul className={styles.referencesList}>
                {resource.references.map((ref, index) => (
                  <li key={index}>
                    <a href={ref.url} target="_blank" rel="noopener noreferrer">
                      {ref.title} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Resources */}
          {resource.related_resources && resource.related_resources.length > 0 && (
            <div className={styles.relatedSection}>
              <h2>Related Resources</h2>
              <div className={styles.relatedGrid}>
                {resource.related_resources.map((related) => (
                  <div 
                    key={related.id}
                    className={styles.relatedCard}
                    onClick={() => navigate(`/patient/resources/${related.id}`)}
                  >
                    {related.thumbnail_image_url && (
                      <img 
                        src={related.thumbnail_image_url} 
                        alt={related.title}
                        className={styles.relatedThumbnail}
                      />
                    )}
                    <h3>{related.title}</h3>
                    <span className={styles.relatedType}>{related.type_display || related.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

