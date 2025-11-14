# Video Call System - Complete Implementation Guide

## Overview

This document describes the complete video call system implementation for the psychology clinic platform, including Twilio Video integration, frontend components, routing, and user experience.

---

## Architecture

### Backend (Already Implemented)
- Twilio room creation and management
- Access token generation
- Appointment scheduling with telehealth support
- WhatsApp/Email reminders with video links (24h, 1h, 15min before)

### Frontend (Newly Implemented)
- Video call page with Twilio SDK integration
- Dashboard integration for all user roles
- Appointment page video call buttons
- Responsive video controls

---

## Components

### 1. VideoCallPage Component
**Location:** `/src/pages/video/VideoCallPage.tsx`

**Features:**
- Real-time video/audio communication
- Automatic camera/microphone setup
- Local video preview (mirrored)
- Remote participant video display
- Connection status indicator
- Participant count
- Mute/unmute audio
- Enable/disable video
- Leave call functionality
- Automatic cleanup on disconnect

**Route:** `/video-session/:appointmentId`

**Access:** Patient, Psychologist, Admin, Practice Manager

### 2. Video API Service
**Location:** `/src/services/api/videoCall.ts`

**Methods:**
- `getVideoToken(appointmentId)` - Get Twilio access token
- `getVideoRoomInfo(appointmentId)` - Get video room details
- `isVideoCallAvailable(appointment)` - Check if telehealth appointment
- `canJoinNow(appointment)` - Check if within allowed time window
- `getTimeUntilAppointment(appointment)` - Format time until appointment

**Logic:**
- Allow joining 15 minutes before appointment
- Allow joining up to 2 hours after appointment start
- Only for telehealth appointments
- Only for scheduled/in_progress status

---

## User Journeys

### Patient Journey

1. **Books Telehealth Appointment**
   - Selects "Telehealth" option during booking
   - Receives confirmation with appointment details

2. **Receives Reminders**
   - 24 hours before: WhatsApp + Email with video link
   - 1 hour before: WhatsApp reminder
   - 15 minutes before: WhatsApp reminder

3. **Joins Video Call (Two Options)**

   **Option A: Click Link from WhatsApp/Email**
   ```
   https://yourwebsite.com/video-session/123
   ```
   - Opens directly to video page
   - Auto-authenticates
   - Connects to room

   **Option B: Via Dashboard/Appointments**
   - Logs into website
   - Sees "Join Video Session" button (appears 15min before)
   - Clicks button → Opens video page

4. **In Video Call**
   - Sees own video (bottom right corner)
   - Waits for psychologist to join
   - Can mute/unmute microphone
   - Can turn camera on/off
   - Can see psychologist when they join

5. **Ends Call**
   - Clicks "Leave Call" button
   - Returns to dashboard
   - Appointment marked as completed

### Psychologist Journey

1. **Views Schedule**
   - Sees upcoming telehealth appointments
   - "Join Video Session" button appears 15min before

2. **Joins Video Call**
   - From dashboard or appointments page
   - Clicks "Join Video Session"
   - Video page opens

3. **Conducts Session**
   - Sees patient video
   - Controls audio/video
   - Professional video call interface

4. **Ends Session**
   - Clicks "Leave Call"
   - Returns to dashboard
   - Can write progress notes

---

## Dashboard Integration

### Patient Dashboard
**Location:** `/src/pages/patient/PatientDashboardPage.tsx`

**Features:**
- "Next Appointment" card shows video call button
- Only for telehealth appointments
- Shows time until appointment
- Blue gradient button design
- Appears 15min before to 2h after

### Patient Appointments Page
**Location:** `/src/pages/patient/PatientAppointmentsPage.tsx`

**Features:**
- Video call button in appointment actions
- Priority button (shown first)
- Only for eligible appointments
- Same timing rules

### Psychologist Dashboard
- Today's appointments section
- Video call buttons for telehealth appointments
- Quick access to active sessions

### Psychologist Schedule Page
- Calendar view with video call buttons
- List view with video call buttons
- Join from any appointment card

---

## Video Call Page Features

### Layout
```
┌─────────────────────────────────────┐
│  Header (Status, Participant Count) │
├─────────────────────────────────────┤
│                                     │
│     Remote Participant Video        │
│          (Full Screen)              │
│                                     │
│   ┌─────────────┐                  │
│   │ Local Video │  (Bottom Right)  │
│   │   (You)     │                  │
│   └─────────────┘                  │
├─────────────────────────────────────┤
│  Controls (Mute, Camera, Leave)    │
└─────────────────────────────────────┘
```

### Controls
1. **Mute Button** - Toggle microphone
2. **Camera Button** - Toggle video
3. **Leave Call Button** - End and exit

### States
- **Connecting** - Getting token, connecting to room
- **Waiting** - Connected, waiting for other participant
- **Active** - Both participants in call
- **Disconnected** - Call ended or error

---

## Styling

### Color Scheme
- Primary Blue: `#3b82f6` (Video call theme)
- Dark Blue: `#2563eb`
- Light Blue Background: `#dbeafe`, `#bfdbfe`
- Red: `#ef4444` (Leave button)
- Black Background: `#1a1a1a` (Video page)

### Button Styles
```scss
.videoCallButton {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }
}
```

### Responsive Design
- Desktop: Full-featured layout
- Mobile: Optimized controls and video sizing
- Local video: 280x210px (desktop), 160x120px (mobile)

---

## API Integration

### Get Video Token
```typescript
GET /appointments/video-token/{appointment_id}/

Response:
{
  "token": "eyJ...twilio.jwt",
  "room_name": "appointment-123-abc",
  "identity": "John Smith"
}
```

### Connect to Twilio
```typescript
import Video from 'twilio-video';

const room = await Video.connect(token, {
  name: roomName,
  audio: true,
  video: { width: 640, height: 480 }
});
```

### Handle Participants
```typescript
// Existing participants
room.participants.forEach(participantConnected);

// New participants
room.on('participantConnected', participantConnected);

// Participants leaving
room.on('participantDisconnected', participantDisconnected);
```

---

## Security & Access Control

### Authentication
- All video routes require authentication
- Token validation before room access
- User identity sent to Twilio

### Authorization
- Only appointment participants can join
- Patient can only join their own appointments
- Psychologist can only join assigned appointments
- Admins can join any appointment (for support)

### Time-Based Access
- Cannot join more than 15min early
- Cannot join more than 2h late
- Prevents unauthorized access to old/future appointments

---

## Error Handling

### Common Errors
1. **"Failed to connect"** - Token expired or network issue
2. **"Invalid appointment"** - Appointment not found
3. **"Not authorized"** - User not part of appointment
4. **"Too early/late"** - Outside allowed time window

### User Feedback
- Clear error messages
- "Go Back" button on errors
- Loading states during connection
- Connection status indicators

---

## Testing Checklist

### Functional Tests
- [ ] Patient can join from dashboard
- [ ] Patient can join from appointments page
- [ ] Psychologist can join from schedule
- [ ] Video/audio streams work
- [ ] Mute/unmute works
- [ ] Camera on/off works
- [ ] Leave call works
- [ ] Reconnection after disconnect
- [ ] Multiple participants display correctly

### UI/UX Tests
- [ ] Video call button appears at correct time
- [ ] Button hidden for in-person appointments
- [ ] Loading states display properly
- [ ] Error messages are clear
- [ ] Mobile responsive design works
- [ ] Video layout is correct
- [ ] Controls are accessible

### Edge Cases
- [ ] Appointment cancelled - button hidden
- [ ] Appointment completed - button hidden
- [ ] Token expired - shows error
- [ ] Network issues - handles gracefully
- [ ] Browser permissions denied - shows message

---

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 74+
- Firefox 66+
- Safari 12.1+
- Opera 62+

### Required Permissions
- Camera access
- Microphone access

### Fallbacks
- If camera denied: audio-only call
- If microphone denied: receive-only mode
- If both denied: error message with instructions

---

## Performance Optimization

### Video Quality
- Default: 640x480 @ 30fps
- Adjusts automatically based on bandwidth
- Twilio handles adaptive bitrate

### Resource Management
- Cleanup on unmount
- Disconnect on browser close
- Stop tracks when leaving
- Remove event listeners

---

## Future Enhancements

### Potential Features
- [ ] Screen sharing
- [ ] Recording (with consent)
- [ ] Chat during call
- [ ] Virtual waiting room
- [ ] Call quality indicators
- [ ] Network status display
- [ ] Participant list
- [ ] Picture-in-picture mode
- [ ] Call duration timer
- [ ] Automatic recording for notes

---

## Support & Troubleshooting

### Common Issues

**"Can't see video"**
- Check camera permissions
- Check if camera is being used by another app
- Try refreshing the page

**"Can't hear audio"**
- Check microphone/speaker permissions
- Check system volume
- Check if using correct audio device

**"Connection keeps dropping"**
- Check internet connection
- Try closing other bandwidth-intensive apps
- Check Twilio service status

### Debug Mode
Enable debug logging:
```typescript
Video.Logger.setLevel('debug');
```

---

## Deployment Notes

### Environment Variables
```env
VITE_API_BASE_URL=https://api.yourwebsite.com
VITE_TWILIO_ACCOUNT_SID=(handled by backend)
```

### Dependencies
```json
{
  "twilio-video": "^2.32.1"
}
```

### Build
```bash
npm install
npm run build
```

---

## Summary

The video call system provides a complete telehealth solution with:
- ✅ Twilio Video integration
- ✅ Full-featured video call page
- ✅ Dashboard integration for all roles
- ✅ Appointment page integration
- ✅ Time-based access control
- ✅ Responsive design
- ✅ Professional UI/UX
- ✅ Error handling
- ✅ Security & authorization

Users receive automated reminders with video links and can join from multiple entry points (dashboard, appointments page, or direct link).

