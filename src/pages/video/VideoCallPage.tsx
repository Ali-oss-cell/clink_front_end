import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Video, { Room, RemoteParticipant, RemoteVideoTrack, RemoteAudioTrack } from 'twilio-video';
import type { RemoteTrack } from 'twilio-video';
import { videoCallService } from '../../services/api/videoCall';
import { authService } from '../../services/api/auth';
import styles from './VideoCallPage.module.scss';

export const VideoCallPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const user = authService.getStoredUser();

  // Connect to Twilio room
  useEffect(() => {
    if (!appointmentId) {
      setError('Invalid appointment ID');
      setLoading(false);
      return;
    }

    const connectToRoom = async () => {
      try {
        setLoading(true);
        setError(null);
        setConnectionStatus('connecting');

        // Get video token from backend
        const tokenData = await videoCallService.getVideoToken(appointmentId);

        // Connect to Twilio Video room
        // Backend returns 'access_token' not 'token'
        const twilioRoom = await Video.connect(tokenData.access_token, {
          name: tokenData.room_name,
          audio: true,
          video: { width: 640, height: 480 }
        });

        setRoom(twilioRoom);
        setConnectionStatus('connected');
        setLoading(false);

        // Attach local video
        twilioRoom.localParticipant.videoTracks.forEach(publication => {
          if (publication.track && localVideoRef.current) {
            const videoElement = publication.track.attach();
            localVideoRef.current.appendChild(videoElement);
          }
        });

        // Handle existing participants
        twilioRoom.participants.forEach(participantConnected);

        // Handle new participants joining
        twilioRoom.on('participantConnected', participantConnected);

        // Handle participants leaving
        twilioRoom.on('participantDisconnected', participantDisconnected);

        // Handle room disconnection
        twilioRoom.on('disconnected', () => {
          setConnectionStatus('disconnected');
          handleLeave();
        });

      } catch (err: any) {
        console.error('Failed to connect to video room:', err);
        setError(err.message || 'Failed to connect to video call');
        setLoading(false);
        setConnectionStatus('disconnected');
      }
    };

    connectToRoom();

    // Cleanup on unmount
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [appointmentId]);

  const participantConnected = (participant: RemoteParticipant) => {
    setParticipants(prevParticipants => [...prevParticipants, participant]);

    participant.tracks.forEach(publication => {
      if (publication.isSubscribed && publication.track) {
        attachTrack(publication.track);
      }
    });

    participant.on('trackSubscribed', attachTrack);
  };

  const participantDisconnected = (participant: RemoteParticipant) => {
    setParticipants(prevParticipants =>
      prevParticipants.filter(p => p.identity !== participant.identity)
    );

    // Detach tracks
    participant.tracks.forEach(publication => {
      if (publication.track) {
        detachTrack(publication.track);
      }
    });
  };

  const attachTrack = (track: RemoteTrack) => {
    // Only attach video and audio tracks (not data tracks)
    if (track.kind === 'video' && remoteVideoRef.current) {
      const videoTrack = track as RemoteVideoTrack;
      const videoElement = videoTrack.attach();
      videoElement.classList.add(styles.remoteVideo);
      remoteVideoRef.current.appendChild(videoElement);
    } else if (track.kind === 'audio') {
      const audioTrack = track as RemoteAudioTrack;
      audioTrack.attach();
    }
  };

  const detachTrack = (track: RemoteTrack) => {
    // Only detach video and audio tracks
    if (track.kind === 'video' || track.kind === 'audio') {
      const mediaTrack = track as RemoteVideoTrack | RemoteAudioTrack;
      mediaTrack.detach().forEach(element => element.remove());
    }
  };

  const toggleAudio = () => {
    if (room) {
      room.localParticipant.audioTracks.forEach(publication => {
        if (publication.track) {
          if (isAudioMuted) {
            publication.track.enable();
          } else {
            publication.track.disable();
          }
        }
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (room) {
      room.localParticipant.videoTracks.forEach(publication => {
        if (publication.track) {
          if (isVideoOff) {
            publication.track.enable();
          } else {
            publication.track.disable();
          }
        }
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleLeave = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
    }
    // Navigate based on user role
    if (user?.role === 'patient') {
      navigate('/patient/dashboard');
    } else if (user?.role === 'psychologist') {
      navigate('/psychologist/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  if (loading) {
    return (
      <div className={styles.videoCallContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <h2>Connecting to video call...</h2>
          <p>Please wait while we connect you to the session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.videoCallContainer}>
        <div className={styles.errorState}>
          <h2>❌ Connection Failed</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.videoCallContainer}>
      {/* Header */}
      <div className={styles.videoHeader}>
        <div className={styles.headerLeft}>
          <h2>Video Session</h2>
          <span className={`${styles.statusBadge} ${styles[connectionStatus]}`}>
            {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.participantCount}>
            👥 {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Video Grid */}
      <div className={styles.videoGrid}>
        {/* Remote participants */}
        {participants.length > 0 ? (
          <div className={styles.remoteParticipants} ref={remoteVideoRef}>
            {participants.length === 0 && connectionStatus === 'connected' && (
              <div className={styles.waitingMessage}>
                <h3>⏳ Waiting for other participant...</h3>
                <p>They will appear here when they join</p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.remoteParticipants}>
            <div className={styles.waitingMessage}>
              <h3>⏳ Waiting for other participant...</h3>
              <p>They will appear here when they join</p>
            </div>
          </div>
        )}

        {/* Local video */}
        <div className={styles.localVideoContainer}>
          <div className={styles.localVideoWrapper}>
            <video ref={localVideoRef} autoPlay muted className={styles.localVideo} />
            <span className={styles.localLabel}>You</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.videoControls}>
        <button
          onClick={toggleAudio}
          className={`${styles.controlButton} ${isAudioMuted ? styles.active : ''}`}
          title={isAudioMuted ? 'Unmute' : 'Mute'}
        >
          {isAudioMuted ? '🔇' : '🎤'}
          <span>{isAudioMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          onClick={toggleVideo}
          className={`${styles.controlButton} ${isVideoOff ? styles.active : ''}`}
          title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
        >
          {isVideoOff ? '📷' : '📹'}
          <span>{isVideoOff ? 'Camera Off' : 'Camera On'}</span>
        </button>

        <button
          onClick={handleLeave}
          className={`${styles.controlButton} ${styles.leaveButton}`}
          title="Leave Call"
        >
          📞
          <span>Leave Call</span>
        </button>
      </div>
    </div>
  );
};

