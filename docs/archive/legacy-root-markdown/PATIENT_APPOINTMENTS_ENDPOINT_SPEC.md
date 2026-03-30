# Patient Appointments Endpoint Specification

## Endpoint
**GET** `/api/appointments/patient/appointments/` ✅ **UPDATED**

## Query Parameters
- `status` (optional): `'all' | 'upcoming' | 'completed' | 'cancelled' | 'past'`
- `page` (optional): number (default: 1)
- `page_size` (optional): number (default: 50)

## Expected Response Structure

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "string",
      "appointment_date": "2025-11-15T11:00:00Z",
      "formatted_date": "Sat, 15 Nov 2025",
      "formatted_time": "11:00 AM",
      "duration_minutes": 60,
      "session_type": "telehealth" | "in_person",
      "status": "upcoming" | "completed" | "cancelled" | "past" | "no_show",
      "psychologist": {
        "name": "Dr. Jane Smith",
        "title": "Clinical Psychologist",
        "profile_image_url": "https://example.com/image.jpg"
      },
      "location": "123 Main St, Sydney" | null,
      "meeting_link": "https://meet.example.com/room-123" | null,
      "notes": "Patient notes here" | null,
      "can_reschedule": true,
      "can_cancel": true,
      "reschedule_deadline": "2025-11-14T11:00:00Z",
      "cancellation_deadline": "2025-11-14T11:00:00Z",
      "session_start_time": "2025-11-15T11:00:00Z",
      "session_end_time": "2025-11-15T12:00:00Z",
      "time_until_start_seconds": 3600,
      "time_remaining_seconds": 3600,
      "session_status": "upcoming" | "starting_soon" | "in_progress" | "ended" | "unknown",
      "can_join_session": true
    }
  ]
}
```

## Required Fields for Card Display

### Critical Fields (Must Have):
1. **`id`** - Appointment ID (string)
2. **`psychologist.name`** - Psychologist full name (string) ⚠️ **Currently missing/not showing**
3. **`psychologist.title`** - Psychologist title/qualification (string) ⚠️ **Currently missing/not showing**
4. **`psychologist.profile_image_url`** - Profile image URL (string | null)
5. **`formatted_date`** or **`appointment_date`** - Date display
6. **`formatted_time`** or **`appointment_date`** - Time display
7. **`session_type`** - "telehealth" or "in_person"
8. **`duration_minutes`** - Session duration
9. **`status`** - Appointment status

### Optional Fields (Nice to Have):
- `location` - For in-person appointments
- `meeting_link` - For telehealth appointments
- `notes` - Additional notes
- `can_reschedule` - Boolean for reschedule button
- `can_cancel` - Boolean for cancel button
- Timer fields (`session_start_time`, `time_until_start_seconds`, etc.)

## ✅ Status: FIXED

All issues have been resolved:

1. ✅ **Endpoint URL Updated**: Changed from `/api/appointments/appointments/` to `/api/appointments/patient/appointments/`
2. ✅ **Psychologist Data**: Backend now returns `psychologist` as a nested object with `name`, `title`, and `profile_image_url`
3. ✅ **Timer Fields**: All timer fields are included in the response
4. ✅ **Date Format**: Date format matches frontend expectation ("Sat, 16 Nov 2025")

## What the Frontend Expects

The frontend code at `src/pages/patient/PatientAppointmentsPage.tsx` line 312-313 expects:
```typescript
<h3 className={styles.psychologistName}>{appointment.psychologist.name}</h3>
<p className={styles.psychologistTitle}>{appointment.psychologist.title}</p>
```

## ✅ Backend Response Structure

The backend now returns the `psychologist` field as a nested object:
```json
{
  "psychologist": {
    "name": "Dr. Sarah Johnson",
    "title": "Clinical Psychologist",
    "profile_image_url": "https://example.com/image.jpg" // or null
  }
}
```

All required fields are now present and the appointment cards should display correctly!

