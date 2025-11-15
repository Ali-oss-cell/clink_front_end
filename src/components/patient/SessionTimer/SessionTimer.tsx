import React, { useState, useEffect } from 'react';
import type { PatientAppointment } from '../../../services/api/appointments';
import styles from './SessionTimer.module.scss';

interface SessionTimerProps {
  appointment: PatientAppointment;
  onJoinSession?: () => void;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ appointment, onJoinSession }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTimeCompact = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  };

  // Calculate time values
  const calculateTimeUntilStart = (): number => {
    if (appointment.session_start_time) {
      const startTime = new Date(appointment.session_start_time).getTime();
      return Math.max(0, Math.floor((startTime - currentTime) / 1000));
    }
    if (appointment.time_until_start_seconds !== null && appointment.time_until_start_seconds !== undefined) {
      return Math.max(0, appointment.time_until_start_seconds);
    }
    return 0;
  };

  const calculateTimeRemaining = (): number | null => {
    if (appointment.time_remaining_seconds !== null && appointment.time_remaining_seconds !== undefined) {
      return Math.max(0, appointment.time_remaining_seconds);
    }
    if (appointment.session_end_time && appointment.session_status === 'in_progress') {
      const endTime = new Date(appointment.session_end_time).getTime();
      return Math.max(0, Math.floor((endTime - currentTime) / 1000));
    }
    return null;
  };

  const timeUntilStart = calculateTimeUntilStart();
  const timeRemaining = calculateTimeRemaining();
  const sessionStatus = appointment.session_status || 'unknown';

  // Calculate progress for in-progress sessions
  const getProgress = (): number => {
    if (sessionStatus !== 'in_progress' || !appointment.session_start_time || !appointment.session_end_time) {
      return 0;
    }
    const startTime = new Date(appointment.session_start_time).getTime();
    const endTime = new Date(appointment.session_end_time).getTime();
    const totalDuration = endTime - startTime;
    const elapsed = Math.max(0, currentTime - startTime);
    return Math.min(100, (elapsed / totalDuration) * 100);
  };

  // Render based on session status
  const renderTimer = () => {
    switch (sessionStatus) {
      case 'upcoming':
        return (
          <div className={`${styles.timerContainer} ${styles.timerUpcoming}`}>
            <p className={styles.timerLabel}>Session starts in:</p>
            <p className={styles.timerValue}>{formatTime(timeUntilStart)}</p>
            {appointment.session_start_time && (
              <p className={styles.timerSubtitle}>
                {new Date(appointment.session_start_time).toLocaleString('en-AU', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        );

      case 'starting_soon':
        return (
          <div className={`${styles.timerContainer} ${styles.timerStartingSoon}`}>
            <p className={styles.timerLabel}>⚠️ Session starting soon!</p>
            <p className={styles.timerValue}>{formatTime(timeUntilStart)}</p>
            {appointment.can_join_session && onJoinSession && (
              <button className={styles.btnJoin} onClick={onJoinSession}>
                Join Session Now
              </button>
            )}
          </div>
        );

      case 'in_progress':
        const progress = getProgress();
        return (
          <div className={`${styles.timerContainer} ${styles.timerInProgress}`}>
            {progress > 0 && (
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <p className={styles.timerLabel}>Session in progress</p>
            <p className={styles.timerValue}>{formatTimeCompact(timeRemaining || 0)}</p>
            <p className={styles.timerSubtitle}>Time remaining</p>
            {appointment.can_join_session && onJoinSession && (
              <button className={styles.btnJoin} onClick={onJoinSession}>
                Join Session
              </button>
            )}
          </div>
        );

      case 'ended':
        return (
          <div className={`${styles.timerContainer} ${styles.timerEnded}`}>
            <p className={styles.timerLabel}>Session ended</p>
            <p className={styles.timerSubtitle}>
              Duration: {appointment.duration_minutes} minutes
            </p>
          </div>
        );

      default:
        return (
          <div className={`${styles.timerContainer} ${styles.timerUnknown}`}>
            <p className={styles.timerLabel}>Unable to load timer</p>
          </div>
        );
    }
  };

  // Don't render if no timer data available
  if (!appointment.session_start_time && appointment.time_until_start_seconds === null && appointment.time_remaining_seconds === null) {
    return null;
  }

  return (
    <div className={styles.sessionTimer}>
      {renderTimer()}
    </div>
  );
};

