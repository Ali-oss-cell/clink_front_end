import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import styles from './DateTimeSelection.module.scss';

interface TimeSlot {
  time: string;
  available: boolean;
  sessionType: 'in-person' | 'telehealth' | 'both';
}

interface DayAvailability {
  date: string;
  dayName: string;
  dayNumber: number;
  available: boolean;
  timeSlots: TimeSlot[];
}

export const DateTimeSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedService = searchParams.get('service');
  const selectedPsychologist = searchParams.get('psychologist');
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<'in-person' | 'telehealth'>('telehealth');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // TODO: Get user data from Redux store
  const mockUser = {
    id: 1,
    first_name: 'John',
    full_name: 'John Smith',
    role: 'patient' as const,
    email: 'john@example.com',
    last_name: 'Smith',
    is_verified: true,
    created_at: '2024-01-01'
  };

  // TODO: Fetch available time slots from Django backend API
  // TODO: Implement real-time availability checking
  // TODO: Add timezone handling for different locations
  // TODO: Implement session type availability (in-person vs telehealth)
  // TODO: Add psychologist-specific availability checking

  // Mock data for demonstration
  const getPsychologistName = (id: string) => {
    const names: { [key: string]: string } = {
      'dr-sarah-johnson': 'Dr. Sarah Johnson',
      'dr-michael-chen': 'Dr. Michael Chen',
      'dr-emma-wilson': 'Dr. Emma Wilson',
      'dr-james-martinez': 'Dr. James Martinez'
    };
    return names[id] || 'Selected Psychologist';
  };

  const getServiceName = (id: string) => {
    const services: { [key: string]: string } = {
      'individual-therapy': 'Individual Therapy Session (50 min)',
      'couples-therapy': 'Couples Therapy Session (60 min)',
      'psychological-assessment': 'Psychological Assessment (90 min)'
    };
    return services[id] || 'Selected Service';
  };

  // Generate calendar data for the next 3 months
  const generateCalendarData = (): DayAvailability[] => {
    const days: DayAvailability[] = [];
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + 3);

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPast = d < today;
      
      // Mock availability - available on weekdays, some weekends
      const available = !isPast && (!isWeekend || Math.random() > 0.7);
      
      const timeSlots: TimeSlot[] = available ? [
        { time: '9:00 AM', available: Math.random() > 0.3, sessionType: 'both' },
        { time: '10:00 AM', available: Math.random() > 0.2, sessionType: 'both' },
        { time: '11:00 AM', available: Math.random() > 0.4, sessionType: 'both' },
        { time: '1:00 PM', available: Math.random() > 0.1, sessionType: 'both' },
        { time: '2:00 PM', available: Math.random() > 0.2, sessionType: 'both' },
        { time: '3:00 PM', available: Math.random() > 0.3, sessionType: 'both' },
        { time: '4:00 PM', available: Math.random() > 0.4, sessionType: 'both' },
        { time: '5:00 PM', available: Math.random() > 0.5, sessionType: 'both' },
        { time: '6:00 PM', available: Math.random() > 0.6, sessionType: 'telehealth' }
      ] : [];

      days.push({
        date: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        available,
        timeSlots
      });
    }

    return days;
  };

  const calendarData = generateCalendarData();
  const currentMonthDays = calendarData.filter(day => {
    const dayDate = new Date(day.date);
    return dayDate.getMonth() === currentMonth.getMonth() && 
           dayDate.getFullYear() === currentMonth.getFullYear();
  });

  const selectedDayData = calendarData.find(day => day.date === selectedDate);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSessionTypeChange = (type: 'in-person' | 'telehealth') => {
    setSelectedSessionType(type);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time to continue.');
      return;
    }
    
    // TODO: Validate date and time selection with backend
    // TODO: Check if selected time slot is still available
    // TODO: Validate session type availability for selected psychologist
    // TODO: Store date/time selection in Redux store
    // TODO: Log appointment scheduling for analytics
    // TODO: Check for conflicts with existing appointments
    
    navigate(`/appointments/details?service=${selectedService}&psychologist=${selectedPsychologist}&date=${selectedDate}&time=${selectedTime}&sessionType=${selectedSessionType}`);
  };

  const handleBack = () => {
    navigate(`/appointments/psychologist-selection?service=${selectedService}`);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Layout 
      user={mockUser} 
      isAuthenticated={true}
      className={styles.patientLayout}
    >
      <div className={styles.dateTimeSelectionContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <button 
              className={styles.backButton}
              onClick={handleBack}
            >
              ← Back to Psychologist Selection
            </button>
            <h1 className={styles.pageTitle}>Choose Date & Time</h1>
            <p className={styles.pageSubtitle}>
              Select your preferred appointment date and time
            </p>
          </div>

          <div className={styles.selectionSummary}>
            <div className={styles.summaryCard}>
              <h3>Your Selection:</h3>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Service:</span>
                <span className={styles.summaryValue}>{getServiceName(selectedService || '')}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Psychologist:</span>
                <span className={styles.summaryValue}>{getPsychologistName(selectedPsychologist || '')}</span>
              </div>
            </div>
          </div>

          <div className={styles.calendarSection}>
            <div className={styles.calendarHeader}>
              <button 
                className={styles.monthNavButton}
                onClick={() => navigateMonth('prev')}
              >
                ← Previous
              </button>
              <h2 className={styles.monthTitle}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                className={styles.monthNavButton}
                onClick={() => navigateMonth('next')}
              >
                Next →
              </button>
            </div>

            <div className={styles.calendarGrid}>
              <div className={styles.dayHeaders}>
                <div className={styles.dayHeader}>Sun</div>
                <div className={styles.dayHeader}>Mon</div>
                <div className={styles.dayHeader}>Tue</div>
                <div className={styles.dayHeader}>Wed</div>
                <div className={styles.dayHeader}>Thu</div>
                <div className={styles.dayHeader}>Fri</div>
                <div className={styles.dayHeader}>Sat</div>
              </div>
              
              <div className={styles.calendarDays}>
                {currentMonthDays.map((day) => (
                  <div 
                    key={day.date}
                    className={`${styles.calendarDay} ${
                      day.available ? styles.available : styles.unavailable
                    } ${selectedDate === day.date ? styles.selected : ''}`}
                    onClick={() => day.available && handleDateSelect(day.date)}
                  >
                    <div className={styles.dayNumber}>{day.dayNumber}</div>
                    <div className={styles.dayName}>{day.dayName}</div>
                    {day.available && (
                      <div className={styles.availabilityIndicator}>🟢</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.calendarLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendIndicator}>🟢</span>
                <span>Available</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendIndicator}>🟡</span>
                <span>Limited</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendIndicator}>🔴</span>
                <span>Unavailable</span>
              </div>
            </div>
          </div>

          {selectedDate && selectedDayData && (
            <div className={styles.timeSelectionSection}>
              <h3 className={styles.timeSectionTitle}>
                Available Times for {formatDate(selectedDate)}:
              </h3>
              
              <div className={styles.timeSlotsGrid}>
                {selectedDayData.timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    className={`${styles.timeSlot} ${
                      slot.available ? styles.available : styles.unavailable
                    } ${selectedTime === slot.time ? styles.selected : ''}`}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.sessionTypeSection}>
            <h3 className={styles.sessionTypeTitle}>How would you like to attend your session?</h3>
            
            <div className={styles.sessionTypeOptions}>
              <div 
                className={`${styles.sessionTypeCard} ${selectedSessionType === 'in-person' ? styles.selected : ''}`}
                onClick={() => handleSessionTypeChange('in-person')}
              >
                <div className={styles.sessionTypeIcon}>🏢</div>
                <div className={styles.sessionTypeContent}>
                  <h4>In-Person Session</h4>
                  <p>📍 Suite 5, 123 Collins Street, Melbourne VIC 3000</p>
                  <p>🚗 Parking available</p>
                  <p>♿ Wheelchair accessible</p>
                </div>
                <div className={styles.sessionTypeRadio}>
                  <input 
                    type="radio" 
                    name="sessionType" 
                    value="in-person"
                    checked={selectedSessionType === 'in-person'}
                    onChange={() => handleSessionTypeChange('in-person')}
                  />
                </div>
              </div>

              <div 
                className={`${styles.sessionTypeCard} ${selectedSessionType === 'telehealth' ? styles.selected : ''}`}
                onClick={() => handleSessionTypeChange('telehealth')}
              >
                <div className={styles.sessionTypeIcon}>🎥</div>
                <div className={styles.sessionTypeContent}>
                  <h4>Telehealth (Video Call)</h4>
                  <p>💻 Attend from anywhere with internet</p>
                  <p>🔒 Secure, encrypted video platform</p>
                  <p>📱 Works on computer, tablet, or phone</p>
                </div>
                <div className={styles.sessionTypeRadio}>
                  <input 
                    type="radio" 
                    name="sessionType" 
                    value="telehealth"
                    checked={selectedSessionType === 'telehealth'}
                    onChange={() => handleSessionTypeChange('telehealth')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleBack}
            >
              Back to Psychologist Selection
            </button>
            <button
              type="button"
              className={styles.continueButton}
              onClick={handleContinue}
              disabled={!selectedDate || !selectedTime}
            >
              Continue to Appointment Details
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
