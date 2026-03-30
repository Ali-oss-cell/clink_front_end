# User Update & Delete Endpoints Documentation

## Overview

These endpoints allow admins and practice managers to update and delete users. Practice managers should have more update capabilities, especially for psychologist profiles.

---

## 1. Update User Endpoint

### Endpoint: `PUT /api/users/{id}/` or `PATCH /api/users/{id}/`

**Authentication:** Required (Admin or Practice Manager)  
**Content-Type:** `application/json`

### Request Body

All fields are optional (partial update). Only send fields that need to be updated.

#### Basic User Fields (All Roles)

```json
{
  "email": "updated@example.com",
  "full_name": "Updated Name",
  "first_name": "Updated",
  "last_name": "Name",
  "phone_number": "+61400123456",
  "is_verified": true,
  "is_active": true,
  "role": "psychologist"
}
```

#### Psychologist Profile Fields (When role is psychologist)

```json
{
  "ahpra_registration_number": "PSY0001234567",
  "ahpra_expiry_date": "2025-12-31",
  "title": "Dr",
  "qualifications": "PhD Psychology, Master of Clinical Psychology",
  "years_experience": 15,
  "consultation_fee": "200.00",
  "medicare_provider_number": "1234567A",
  "bio": "Updated biography...",
  "is_accepting_new_patients": true,
  "specializations": [1, 2, 3],
  "services_offered": [1, 2]
}
```

### Field Details

| Field | Type | Required | Editable By | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | ❌ No | Admin, Practice Manager | User email |
| `full_name` | string | ❌ No | Admin, Practice Manager | Full name |
| `first_name` | string | ❌ No | Admin, Practice Manager | First name |
| `last_name` | string | ❌ No | Admin, Practice Manager | Last name |
| `phone_number` | string | ❌ No | Admin, Practice Manager | Phone number |
| `role` | string | ❌ No | **Admin only** | User role (admin cannot change to admin) |
| `is_verified` | boolean | ❌ No | Admin, Practice Manager | Verification status |
| `is_active` | boolean | ❌ No | Admin, Practice Manager | Active status |
| `date_of_birth` | date | ❌ No | Admin, Practice Manager | Date of birth |

#### Psychologist-Specific Fields

| Field | Type | Required | Editable By | Description |
|-------|------|----------|-------------|-------------|
| `ahpra_registration_number` | string | ❌ No | Admin, Practice Manager | AHPRA registration |
| `ahpra_expiry_date` | date | ❌ No | Admin, Practice Manager | AHPRA expiry date |
| `title` | string | ❌ No | Admin, Practice Manager | Title (Dr, Mr, Ms, Mrs) |
| `qualifications` | string | ❌ No | Admin, Practice Manager | Qualifications |
| `years_experience` | integer | ❌ No | Admin, Practice Manager | Years of experience |
| `consultation_fee` | decimal | ❌ No | Admin, Practice Manager | Consultation fee |
| `medicare_provider_number` | string | ❌ No | Admin, Practice Manager | Medicare provider number |
| `bio` | string | ❌ No | Admin, Practice Manager | Professional biography |
| `is_accepting_new_patients` | boolean | ❌ No | Admin, Practice Manager | Accepting new patients |
| `specializations` | array | ❌ No | Admin, Practice Manager | Array of specialization IDs |
| `services_offered` | array | ❌ No | Admin, Practice Manager | Array of service IDs |

### Response Format

#### Success (200 OK)

```json
{
  "id": 1,
  "email": "updated@example.com",
  "full_name": "Updated Name",
  "first_name": "Updated",
  "last_name": "Name",
  "role": "psychologist",
  "is_verified": true,
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "last_login": "2024-01-20T14:30:00Z",
  "phone_number": "+61400123456",
  "username": "updated"
}
```

#### Error (400 Bad Request)

```json
{
  "error": "Invalid data",
  "email": ["This email is already in use."],
  "ahpra_registration_number": ["This AHPRA number is already registered."]
}
```

#### Error (403 Forbidden)

```json
{
  "error": "You do not have permission to update this user"
}
```

#### Error (404 Not Found)

```json
{
  "error": "User not found"
}
```

### Permission Rules

1. **Admins:**
   - ✅ Can update all users
   - ✅ Can change roles (except cannot change another user to admin)
   - ✅ Can update all fields including psychologist profile

2. **Practice Managers:**
   - ✅ Can update all users (except admins)
   - ❌ Cannot change roles
   - ✅ Can update all fields including psychologist profile
   - ✅ Can update verification and active status

3. **Psychologists:**
   - ❌ Cannot update other users (only their own profile via different endpoint)

4. **Patients:**
   - ❌ Cannot update other users

### Example Requests

#### Update Basic User Info

```bash
PUT /api/users/1/
{
  "full_name": "John Smith",
  "phone_number": "+61400123456",
  "is_verified": true
}
```

#### Update Psychologist Profile

```bash
PUT /api/users/2/
{
  "qualifications": "PhD Psychology, Master of Clinical Psychology",
  "years_experience": 16,
  "consultation_fee": "210.00",
  "is_accepting_new_patients": false
}
```

#### Update Role and Status (Admin Only)

```bash
PUT /api/users/3/
{
  "role": "practice_manager",
  "is_active": false
}
```

---

## 2. Delete User Endpoint

### Endpoint: `DELETE /api/users/{id}/`

**Authentication:** Required (Admin only)  
**Content-Type:** `application/json`

### Request

No request body required. Only the user ID in the URL.

### Response Format

#### Success (204 No Content)

No response body. Status code 204 indicates successful deletion.

#### Error (403 Forbidden)

```json
{
  "error": "Only administrators can delete users"
}
```

#### Error (404 Not Found)

```json
{
  "error": "User not found"
}
```

#### Error (400 Bad Request)

```json
{
  "error": "Cannot delete user. User has active appointments or other dependencies."
}
```

### Permission Rules

1. **Admins:**
   - ✅ Can delete any user (with safety checks)

2. **Practice Managers:**
   - ❌ Cannot delete users (read-only for deletion)

3. **Others:**
   - ❌ Cannot delete users

### Safety Checks

Before deleting a user, check:
- ❌ User has active appointments (scheduled or upcoming)
- ❌ User has unpaid invoices
- ❌ User is the only admin in the system
- ❌ User has other critical dependencies

If any of these exist, return 400 error with explanation.

### Example Request

```bash
DELETE /api/users/1/
```

---

## 3. Get Single User Endpoint (For Edit Form)

### Endpoint: `GET /api/users/{id}/`

**Authentication:** Required (Admin or Practice Manager)

### Response Format

```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Smith",
  "first_name": "John",
  "last_name": "Smith",
  "role": "psychologist",
  "is_verified": true,
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "last_login": "2024-01-20T14:30:00Z",
  "phone_number": "+61400123456",
  "username": "john.smith",
  "date_of_birth": "1990-05-15",
  
  // If user is a psychologist, include profile data:
  "psychologist_profile": {
    "ahpra_registration_number": "PSY0001234567",
    "ahpra_expiry_date": "2025-12-31",
    "title": "Dr",
    "qualifications": "PhD Psychology",
    "years_experience": 15,
    "consultation_fee": "200.00",
    "medicare_provider_number": "1234567A",
    "bio": "Professional biography...",
    "is_accepting_new_patients": true,
    "specializations": [1, 2],
    "services_offered": [1, 2]
  }
}
```

---

## 4. Frontend Integration

### Update User

```typescript
// Update basic user info
await adminService.updateUser(userId, {
  full_name: "Updated Name",
  phone_number: "+61400123456",
  is_verified: true
});

// Update psychologist profile
await adminService.updateUser(userId, {
  qualifications: "PhD Psychology",
  years_experience: 16,
  consultation_fee: "210.00"
});
```

### Delete User

```typescript
await adminService.deleteUser(userId);
```

---

## 5. Summary

### Update Endpoint (`PUT /api/users/{id}/`)

- ✅ Supports partial updates (PATCH-like behavior)
- ✅ Admins can update everything (except making other admins)
- ✅ Practice Managers can update all fields except role
- ✅ Supports psychologist profile updates
- ✅ Returns updated user object

### Delete Endpoint (`DELETE /api/users/{id}/`)

- ✅ Admin only
- ✅ Safety checks before deletion
- ✅ Returns 204 on success
- ✅ Returns error if dependencies exist

### Get Single User (`GET /api/users/{id}/`)

- ✅ Returns user with all fields
- ✅ Includes psychologist profile if applicable
- ✅ Used to populate edit form

---

**Last Updated:** 2024-01-15  
**Status:** ✅ Ready for Implementation

