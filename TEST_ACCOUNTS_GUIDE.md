# Test Accounts for Video Call Testing

## Overview
To test video calls, you need **two accounts**:
1. **Patient account** - to join as a patient
2. **Psychologist account** - to join as a psychologist

## Option 1: Create Accounts via Registration (Recommended)

### Step 1: Create Patient Account
1. Go to: `https://tailoredpsychology.com.au/register`
2. Select "Patient" registration
3. Fill in the form with test data:
   - **Email**: `patient.test@example.com`
   - **Password**: `TestPassword123!`
   - **First Name**: `Test`
   - **Last Name**: `Patient`
   - **Phone**: `0412345678`
   - **Date of Birth**: `1990-01-01`
   - Complete all required fields

### Step 2: Create Psychologist Account
1. Go to: `https://tailoredpsychology.com.au/register`
2. Select "Psychologist" registration (if available) OR use admin panel
3. Fill in the form:
   - **Email**: `psychologist.test@example.com`
   - **Password**: `TestPassword123!`
   - **First Name**: `Test`
   - **Last Name**: `Psychologist`
   - Complete all required fields

### Step 3: Complete Patient Setup
After patient registration:
1. Log in as patient
2. Complete intake form (if required)
3. Accept Privacy Policy
4. Accept Telehealth Consent (required for video calls)

## Option 2: Create Accounts via Backend/Django Admin

If you have backend access, you can create test accounts directly:

### Via Django Admin
1. Go to Django admin panel
2. Navigate to Users
3. Create two users:
   - Patient user with `role='patient'`
   - Psychologist user with `role='psychologist'`

### Via Django Shell
```python
from django.contrib.auth import get_user_model
User = get_user_model()

# Create patient
patient = User.objects.create_user(
    email='patient.test@example.com',
    password='TestPassword123!',
    first_name='Test',
    last_name='Patient',
    role='patient',
    is_verified=True
)

# Create psychologist
psychologist = User.objects.create_user(
    email='psychologist.test@example.com',
    password='TestPassword123!',
    first_name='Test',
    last_name='Psychologist',
    role='psychologist',
    is_verified=True
)
```

## Option 3: Use Existing Accounts

If you already have accounts in your system:
1. **Patient Account**: Any account with `role='patient'`
2. **Psychologist Account**: Any account with `role='psychologist'`

## Testing Video Calls

### Prerequisites
1. Both accounts must be created and verified
2. Patient must have:
   - Accepted Privacy Policy
   - Accepted Telehealth Consent
3. An appointment must exist between the patient and psychologist
4. Appointment must be:
   - Type: `telehealth`
   - Status: `upcoming` or `confirmed`
   - Within the join window (30 min before to 4 hours after)

### Test Steps

1. **Create Appointment** (via admin or booking system):
   - Patient: `patient.test@example.com`
   - Psychologist: `psychologist.test@example.com`
   - Type: Telehealth
   - Date/Time: Set to a time you can test

2. **Join as Patient**:
   - Log in: `patient.test@example.com` / `TestPassword123!`
   - Navigate to appointments
   - Click "Join Video Call" on the appointment
   - Should connect successfully

3. **Join as Psychologist**:
   - Log in: `psychologist.test@example.com` / `TestPassword123!`
   - Navigate to schedule/appointments
   - Click "Join Video Call" on the appointment
   - Should connect successfully (no consent checks)

## Quick Test Credentials Template

Save these for easy reference:

```
PATIENT ACCOUNT:
Email: patient.test@example.com
Password: TestPassword123!
Role: patient

PSYCHOLOGIST ACCOUNT:
Email: psychologist.test@example.com
Password: TestPassword123!
Role: psychologist
```

## Troubleshooting

### "Only patients can view Privacy Policy status"
- ✅ **Fixed**: Psychologists no longer need privacy policy check

### "Only patients can view telehealth consent status"
- ✅ **Fixed**: Psychologists no longer need telehealth consent check

### "CORS Error"
- Check backend CORS settings (see `CORS_FIX_BACKEND.md`)

### "No video room found"
- Appointment must exist and be linked to both users
- Check appointment status in database

### "Appointment not found"
- Verify appointment ID is correct
- Check appointment exists in database
- Ensure user has permission to access the appointment

## Notes

- **Security**: These are test accounts. Use strong passwords in production.
- **Cleanup**: Consider deleting test accounts after testing.
- **Data**: Test accounts may create test data (appointments, etc.) that should be cleaned up.

