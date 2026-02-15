import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Video, { Room, RemoteParticipant, RemoteVideoTrack, RemoteAudioTrack } from 'twilio-video';
import type { RemoteTrack } from 'twilio-video';
import { videoCallService } from '../../services/api/videoCall';
import { authService } from '../../services/api/auth';
import { TelehealthService, type TelehealthConsentResponse } from '../../services/api/telehealth';
import {
  ErrorCircleIcon,
  UsersIcon,
  ClockIcon,
  VideoIcon,
  CameraIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PhoneIcon,
  CircleIcon
} from '../../utils/icons';
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
  const [telehealthConsent, setTelehealthConsent] = useState<TelehealthConsentResponse | null>(null);
  const [recordingRequired, setRecordingRequired] = useState(false);
  
  const localVideoContainerRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null); // Use ref to track room for cleanup

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

        // Only check telehealth consent for patients (not psychologists)
        if (user?.role === 'patient') {
          try {
            const consentResponse = await TelehealthService.getConsent();
            setTelehealthConsent(consentResponse);

            if (!consentResponse.consent_to_telehealth) {
              throw new Error('Telehealth consent is required before joining this video session.');
            }
          } catch (consentError: any) {
            // If consent check fails (e.g., 403 for non-patients), skip it
            if (consentError.response?.status === 403) {
              console.warn('Telehealth consent check skipped (not a patient)');
            } else {
              throw consentError;
            }
          }
        }

        // Get video token from backend - always get fresh token
        console.log('🔵 Step 1: Requesting video token for appointment:', appointmentId);
        const tokenData = await videoCallService.getVideoToken(appointmentId);
        console.log('🟢 Step 2: Token received from backend:', {
          hasToken: !!tokenData.access_token,
          tokenLength: tokenData.access_token?.length,
          tokenPreview: tokenData.access_token ? `${tokenData.access_token.substring(0, 20)}...${tokenData.access_token.substring(tokenData.access_token.length - 20)}` : 'N/A',
          roomName: tokenData.room_name,
          userIdentity: tokenData.user_identity,
          expiresAt: tokenData.expires_at,
          expiresIn: tokenData.expires_in,
          appointmentId: tokenData.appointment_id,
          fullResponse: tokenData // Log full response for debugging
        });

        // Validate token data before using it
        if (!tokenData.access_token || tokenData.access_token.length < 100) {
          console.error('❌ Token validation failed:', {
            hasToken: !!tokenData.access_token,
            tokenLength: tokenData.access_token?.length
          });
          throw new Error('Invalid token received from server. Token is missing or too short.');
        }

        if (!tokenData.room_name || tokenData.room_name.trim() === '') {
          console.error('❌ Room name validation failed:', {
            roomName: tokenData.room_name
          });
          throw new Error('Invalid room name received from server.');
        }

        // Try to decode JWT token to inspect its contents (for debugging)
        try {
          const tokenParts = tokenData.access_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('🔍 Token payload (decoded):', {
              iss: payload.iss, // Issuer
              sub: payload.sub, // Subject
              aud: payload.aud, // Audience
              exp: payload.exp, // Expiration
              nbf: payload.nbf, // Not before
              jti: payload.jti, // JWT ID
              grants: payload.grants // Twilio grants
            });
          }
        } catch (e) {
          console.warn('⚠️ Could not decode token payload:', e);
        }

        // Check if token is expired (if expires_at is provided)
        if (tokenData.expires_at) {
          const expiresAt = new Date(tokenData.expires_at);
          const now = new Date();
          if (now > expiresAt) {
            console.error('❌ Token expired:', {
              expiresAt: tokenData.expires_at,
              now: now.toISOString()
            });
            throw new Error('Token has expired. Please refresh the page to get a new token.');
          }
        }

        const shouldRecord = Boolean((tokenData as any).recording_required);
        // Only check recording consent for patients
        if (shouldRecord && user?.role === 'patient' && telehealthConsent && !telehealthConsent.telehealth_recording_consent) {
          throw new Error(
            'Recording is enabled for this session but you have not opted in. Please update your telehealth consent with recording enabled or ask your clinician to disable recording.'
          );
        }
        setRecordingRequired(shouldRecord);

        // Connect to Twilio Video room immediately after getting token
        // Use the exact access_token and room_name from backend response
        console.log('🔵 Step 3: Connecting to Twilio room:', tokenData.room_name);
        console.log('🔵 Connection options:', {
          name: tokenData.room_name,
          region: 'au1', // Australia region - must match backend token
          audio: true,
          video: { width: 640, height: 480 }
        });
        
        const twilioRoom = await Video.connect(tokenData.access_token, {
          name: tokenData.room_name,
          region: 'au1', // IMPORTANT: Must match backend token region
          audio: true,
          video: { width: 640, height: 480 },
          // Add connection options for better reliability
          networkQuality: {
            local: 1, // LocalParticipant's Network Quality verbosity [1 - 3]
            remote: 2 // RemoteParticipants' Network Quality verbosity [0 - 3]
          },
          preferredVideoCodecs: ['VP8'],
          logLevel: 'info' // Enable Twilio SDK logging for debugging
        });
        
        console.log('🟢 Step 4: Successfully connected to Twilio room:', twilioRoom.name);
        console.log('🟢 Room SID:', twilioRoom.sid);
        console.log('🟢 Connected to region:', 'au1');

        setRoom(twilioRoom);
        roomRef.current = twilioRoom; // Update ref for cleanup
        setConnectionStatus('connected');
        setLoading(false);

        // Attach local video tracks
        // Clear any existing video elements first
        if (localVideoContainerRef.current) {
          localVideoContainerRef.current.innerHTML = '';
        }
        
        twilioRoom.localParticipant.videoTracks.forEach(publication => {
          if (publication.track && localVideoContainerRef.current) {
            // Type assertion for LocalVideoTrack
            const videoTrack = publication.track as any;
            if (videoTrack.attach) {
              const videoElement = videoTrack.attach();
              videoElement.setAttribute('playsinline', 'true');
              videoElement.setAttribute('autoplay', 'true');
              videoElement.setAttribute('muted', 'true');
              localVideoContainerRef.current.appendChild(videoElement);
            }
          }
        });
        
        // Also listen for new video tracks
        twilioRoom.localParticipant.on('trackPublished', (publication) => {
          if (publication.track && localVideoContainerRef.current) {
            // Type assertion for LocalVideoTrack
            const videoTrack = publication.track as any;
            if (videoTrack.attach) {
              const videoElement = videoTrack.attach();
              videoElement.setAttribute('playsinline', 'true');
              videoElement.setAttribute('autoplay', 'true');
              videoElement.setAttribute('muted', 'true');
              localVideoContainerRef.current.innerHTML = '';
              localVideoContainerRef.current.appendChild(videoElement);
            }
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
        console.error('❌ Failed to connect to video room:', err);
        console.error('❌ Error details:', {
          name: err.name,
          message: err.message,
          code: err.code,
          cause: err.cause,
          stack: err.stack,
          response: err.response?.data,
          status: err.response?.status
        });
        
        // Provide more specific error messages
        let errorMessage = 'Failed to connect to video call';
        
        // Check for WebSocket-specific errors first
        if (err.message && err.message.includes('WebSocket')) {
          errorMessage = 'Network error: Could not establish video connection. This may be due to firewall or network restrictions blocking WebSocket connections. Please check your internet connection and try again.';
          console.error('⚠️ WebSocket connection failed - this is usually a network/firewall issue');
        } else if (err.code === 53000 || (err.message && err.message.includes('SignatureValidationFailed'))) {
          errorMessage = 'Invalid video token. Please refresh the page and try again.';
        } else if (err.code === 53001 || (err.message && err.message.includes('RoomNotFound'))) {
          errorMessage = 'Video room not found. Please contact support.';
        } else if (err.code === 53002 || (err.message && err.message.includes('RoomCompleted'))) {
          errorMessage = 'This video session has ended.';
        } else if (err.code === 53405 || (err.message && err.message.includes('MediaNotAllowedError'))) {
          errorMessage = 'Camera/microphone access denied. Please allow access in your browser settings and try again.';
        } else if (err.message) {
          errorMessage = err.message;
          
          // Check for specific Twilio error patterns
          if (err.message.includes('issuer/subject') || err.message.includes('Invalid Access Token issuer/subject')) {
            errorMessage = 'Invalid access token. The token may be for a different Twilio account or malformed. Please check backend configuration.';
            console.error('❌ Token issuer/subject error - This usually means:');
            console.error('   1. Token was generated for a different Twilio Account SID');
            console.error('   2. Backend Twilio credentials don\'t match');
            console.error('   3. Token format is incorrect');
            console.error('   Please check your backend Twilio configuration (Account SID, API Key, API Secret)');
          } else if (err.message.includes('expired')) {
            errorMessage = 'Token has expired. Please refresh the page to get a new token.';
          } else if (err.message.includes('room')) {
            errorMessage = 'Unable to connect to video room. Please check your connection and try again.';
          }
        } else if (err.name === 'TwilioError') {
          // Handle Twilio-specific errors
          if (err.message?.includes('issuer/subject') || err.code === 20101) {
            errorMessage = 'Invalid access token. The token may be for a different Twilio account. Please check backend configuration.';
            console.error('❌ Twilio Error Code 20101 - Invalid Access Token issuer/subject');
          } else if (err.message?.includes('expired')) {
            errorMessage = 'Token has expired. Please refresh the page to get a new token.';
          } else if (err.message?.includes('room')) {
            errorMessage = 'Unable to connect to video room. Please check your connection and try again.';
          } else {
            errorMessage = `Video connection error: ${err.message || err.code || 'Unknown error'}`;
          }
        } else if (err.response) {
          // API error responses
          const status = err.response.status;
          if (status === 403) {
            errorMessage = 'You do not have permission to access this video call.';
          } else if (status === 404) {
            errorMessage = 'Appointment or video room not found.';
          } else if (status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }
        
        setError(errorMessage);
        setLoading(false);
        setConnectionStatus('disconnected');
      }
    };

    connectToRoom();

    // Cleanup on unmount
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
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
          <h2><ErrorCircleIcon size="lg" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Connection Failed</h2>
          <p>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                // Trigger reconnection by updating state
                window.location.reload();
              }} 
              className={styles.backButton}
              style={{ backgroundColor: '#5a8cb8', color: 'white' }}
            >
              Retry Connection
            </button>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              Go Back
            </button>
          </div>
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
            {connectionStatus === 'connected' ? (
              <>
                <CircleIcon size="xs" color="#2e7d42" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Connected
              </>
            ) : (
              <>
                <CircleIcon size="xs" color="#c0392b" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Disconnected
              </>
            )}
          </span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.participantCount}>
            <UsersIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
          </span>
        </div>
      </div>

      {telehealthConsent && (
        <div className={styles.telehealthBoard}>
          <h3>Telehealth Safety & Emergency Plan</h3>
          <div className={styles.details}>
            <p>
              <strong>Emergency contact:</strong> {telehealthConsent.telehealth_emergency_contact || 'Not provided'}
            </p>
            <p>
              <strong>Plan:</strong>{' '}
              {telehealthConsent.telehealth_emergency_plan || 'Patient has not provided an emergency plan.'}
            </p>
            <p>
              <strong>Recording:</strong> {telehealthConsent.telehealth_recording_consent ? 'Allowed' : 'Not allowed'}
            </p>
            {recordingRequired && !telehealthConsent.telehealth_recording_consent && (
              <p>
                <strong>Action required:</strong> Recording is enabled for this appointment but the patient has not
                opted in. Disable recording or collect consent before proceeding.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className={styles.videoGrid}>
        {/* Remote participants */}
        {participants.length > 0 ? (
          <div className={styles.remoteParticipants} ref={remoteVideoRef}>
            {participants.length === 0 && connectionStatus === 'connected' && (
              <div className={styles.waitingMessage}>
                <h3><ClockIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Waiting for other participant...</h3>
                <p>They will appear here when they join</p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.remoteParticipants}>
            <div className={styles.waitingMessage}>
              <h3><ClockIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Waiting for other participant...</h3>
              <p>They will appear here when they join</p>
            </div>
          </div>
        )}

        {/* Local video */}
        <div className={styles.localVideoContainer}>
          <div className={styles.localVideoWrapper}>
            <div ref={localVideoContainerRef} className={styles.localVideo}></div>
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
          {isAudioMuted ? <MicrophoneSlashIcon size="md" /> : <MicrophoneIcon size="md" />}
          <span>{isAudioMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          onClick={toggleVideo}
          className={`${styles.controlButton} ${isVideoOff ? styles.active : ''}`}
          title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
        >
          {isVideoOff ? <CameraIcon size="md" /> : <VideoIcon size="md" />}
          <span>{isVideoOff ? 'Camera Off' : 'Camera On'}</span>
        </button>

        <button
          onClick={handleLeave}
          className={`${styles.controlButton} ${styles.leaveButton}`}
          title="Leave Call"
        >
          <PhoneIcon size="md" />
          <span>Leave Call</span>
        </button>
      </div>
    </div>
  );
};

