# 🔐 Django Backend Integration Guide

## 📋 Overview

This guide walks you through testing and using the Psychology Clinic React frontend with your Django backend authentication system.

## ✅ What's Been Updated

### 1. **TypeScript Types** (`src/types/simple-auth.ts`)
- Updated `LoginResponse` to match Django backend format:
```typescript
// Before (nested tokens)
interface LoginResponse {
  user: User;
  tokens: { access: string; refresh: string; };
}

// After (direct tokens - matches Django)
interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}
```

### 2. **Authentication Service** (`src/services/api/auth.ts`)
- Fixed login endpoint to handle Django response format
- Updated token refresh URL: `/auth/refresh/` (was `/api/auth/refresh/`)
- Enhanced error handling for Django error messages
- Updated token storage logic

### 3. **Login Component** (`src/components/auth/Login/Login.tsx`)
- Added specific error handling for Django backend messages:
  - "Invalid credentials" → User-friendly message
  - "Email and password are required" → Field validation message
  - Network errors → Connection error message

### 4. **Test Utilities** (`src/utils/testBackendConnection.ts`)
- Created comprehensive backend testing script
- Tests server health, login endpoint, and token refresh

---

## 🚀 Quick Start Testing

### Step 1: Start Your Django Server
```bash
# In your Django project directory
python manage.py runserver
```

### Step 2: Test Backend Connection
```bash
# In your React project directory
npm run dev
```

Open browser console and run:
```javascript
// Test your Django backend
testBackend()
```

### Step 3: Test Login Flow
1. Go to `http://localhost:5173/login`
2. Try these test scenarios:

#### Valid Login (if you have test user):
```
Email: your-test-user@example.com
Password: your-test-password
```

#### Invalid Login (should show error):
```
Email: invalid@test.com
Password: wrongpassword
```

#### Demo Mode (if backend is not ready):
```
Email: demo@tailoredpsychology.com.au
Password: demo123
```

---

## 🔧 Backend Requirements

### Your Django Backend Must Have:

#### 1. **Login Endpoint**: `POST /api/auth/login/`
**Request:**
```json
{
    "email": "user@example.com",
    "password": "Password123!"
}
```

**Success Response (200):**
```json
{
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "user",
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe",
        "role": "patient",
        "phone_number": "0412345678",
        "date_of_birth": "1990-01-01",
        "age": 33,
        "is_verified": false,
        "created_at": "2024-01-01T00:00:00Z"
    }
}
```

**Error Response (401):**
```json
{
    "error": "Invalid credentials"
}
```

**Error Response (400):**
```json
{
    "error": "Email and password are required"
}
```

#### 2. **Token Refresh Endpoint**: `POST /api/auth/refresh/`
**Request:**
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. **CORS Configuration**
Make sure your Django `settings.py` includes:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True
```

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Login
1. **Action**: Login with valid credentials
2. **Expected**: 
   - Success message appears
   - User redirected to appropriate dashboard
   - Tokens stored in localStorage
   - User data stored in localStorage

### Scenario 2: Invalid Credentials
1. **Action**: Login with wrong email/password
2. **Expected**: 
   - Error message: "Invalid email or password"
   - No redirect
   - No tokens stored

### Scenario 3: Missing Fields
1. **Action**: Submit empty form
2. **Expected**: 
   - Form validation errors
   - No API call made

### Scenario 4: Server Down
1. **Action**: Login when Django server is off
2. **Expected**: 
   - Error message: "Unable to connect to server"
   - Graceful error handling

### Scenario 5: Role-based Redirect
1. **Action**: Login as different user roles
2. **Expected**: 
   - Patient → `/patient/dashboard`
   - Psychologist → `/psychologist/dashboard`
   - Practice Manager → `/manager/dashboard`
   - Admin → `/admin/dashboard`

---

## 🐛 Troubleshooting

### Issue: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Check Django CORS settings in `settings.py`

### Issue: 404 Not Found
```
POST http://127.0.0.1:8000/api/auth/login/ 404
```
**Solution**: Verify Django URL configuration

### Issue: 500 Server Error
```
Internal Server Error
```
**Solution**: Check Django server logs for errors

### Issue: Invalid Response Format
```
Invalid response format: missing tokens
```
**Solution**: Ensure Django returns `access`, `refresh`, and `user` fields

---

## 📊 API Request/Response Examples

### Login Request (Browser Network Tab)
```http
POST http://127.0.0.1:8000/api/auth/login/
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "Password123!"
}
```

### Login Response (Success)
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM1MTgxNDAzLCJpYXQiOjE3MzUxNzc4MDMsImp0aSI6IjEyMzQ1Njc4OTAiLCJ1c2VyX2lkIjoxfQ.abcdefghijklmnopqrstuvwxyz",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTczNTI2NDIwMywiaWF0IjoxNzM1MTc3ODAzLCJqdGkiOiI5ODc2NTQzMjEwIiwidXNlcl9pZCI6MX0.zyxwvutsrqponmlkjihgfedcba",
    "user": {
        "id": 1,
        "email": "test@example.com",
        "username": "testuser",
        "first_name": "Test",
        "last_name": "User",
        "full_name": "Test User",
        "role": "patient",
        "phone_number": "0412345678",
        "date_of_birth": "1990-01-01",
        "age": 33,
        "is_verified": true,
        "created_at": "2024-01-01T00:00:00Z"
    }
}
```

---

## 🎯 Next Steps

1. **Test the integration** using the provided test script
2. **Create test users** in your Django database
3. **Verify role-based redirects** work correctly
4. **Test token refresh** functionality
5. **Add additional error handling** as needed

---

## 🔗 Related Files

- **Types**: `src/types/simple-auth.ts`
- **Auth Service**: `src/services/api/auth.ts`
- **Login Component**: `src/components/auth/Login/Login.tsx`
- **Test Script**: `src/utils/testBackendConnection.ts`
- **Redux Store**: `src/store/slices/authSlice.ts`

---

## 📞 Support

If you encounter issues:

1. **Check Django server logs** for backend errors
2. **Use browser DevTools** to inspect network requests
3. **Run the test script** to verify backend connectivity
4. **Check CORS configuration** if getting network errors
5. **Verify Django URL patterns** match the frontend endpoints

**Your React frontend is now fully configured for Django backend integration!** 🎉✨
