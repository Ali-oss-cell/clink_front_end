import React, { useState, useEffect } from 'react';
// @ts-ignore - react-player types will be available after npm install
import ReactPlayer from 'react-player';
import styles from './RecordingVideoPlayer.module.scss';

interface RecordingVideoPlayerProps {
  videoUrl: string;
  title?: string;
  onError?: (error: Error) => void;
}

export const RecordingVideoPlayer: React.FC<RecordingVideoPlayerProps> = ({
  videoUrl,
  title,
  onError,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    // Reset states when URL changes
    setIsReady(false);
    setHasError(false);
    setErrorMessage(null);
    setIsPlaying(false);
    setDuration(null);
    setPlayed(0);
  }, [videoUrl]);

  const handleReady = () => {
    setIsReady(true);
    setHasError(false);
  };

  const handleError = (error: any) => {
    console.error('Video player error:', error);
    setHasError(true);
    setErrorMessage('Failed to load video. The recording may not be available or requires authentication.');
    if (onError) {
      onError(error instanceof Error ? error : new Error('Video playback error'));
    }
  };

  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setSeeking(false);
    // The player will handle the seek automatically
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoUrl) {
    return (
      <div className={styles.playerContainer}>
        <div className={styles.errorState}>
          <p>No video URL available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.playerContainer}>
      {title && <h3 className={styles.playerTitle}>{title}</h3>}
      
      <div className={styles.playerWrapper}>
        {hasError ? (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>⚠️</div>
            <p className={styles.errorMessage}>{errorMessage || 'Failed to load video'}</p>
            <p className={styles.errorHint}>
              The video may require authentication or may not be available yet.
              Try downloading the recording instead.
            </p>
          </div>
        ) : (
          <>
            <ReactPlayer
              url={videoUrl}
              controls
              playing={isPlaying}
              width="100%"
              height="100%"
              onReady={handleReady}
              onError={handleError}
              onProgress={handleProgress}
              onDuration={handleDuration}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                  },
                },
              }}
            />
            
            {!isReady && (
              <div className={styles.loadingOverlay}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading video...</p>
              </div>
            )}

            {isReady && duration && (
              <div className={styles.playerControls}>
                <div className={styles.timeDisplay}>
                  <span>{formatTime(played * duration)}</span>
                  <span> / </span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={played}
                  onChange={handleSeekChange}
                  onMouseDown={handleSeekMouseDown}
                  onMouseUp={handleSeekMouseUp}
                  className={styles.seekBar}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
