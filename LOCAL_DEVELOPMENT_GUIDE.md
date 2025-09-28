# 🖥️ Local Development Setup Guide

## **React Frontend + Django Backend on Same PC**

### **📋 Prerequisites**
- Node.js (v18+)
- Python (v3.8+)
- Django backend running on port 8000
- React frontend running on port 5173

---

## **🚀 Quick Start**

### **1. Start Django Backend**
```bash
# In your Django project directory
cd /path/to/your/django/project
python manage.py runserver 127.0.0.1:8000
```

### **2. Start React Frontend**
```bash
# In your React project directory
cd /path/to/your/react/project
npm run dev
```

### **3. Access Applications**
- **React Frontend**: http://localhost:5173
- **Django Backend**: http://127.0.0.1:8000
- **Django Admin**: http://127.0.0.1:8000/admin

---

## **🔧 Configuration**

### **Django CORS Settings**
Add to your Django `settings.py`:

```python
# CORS settings for local development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# Allow all headers for development
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!

# CORS headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

### **Django URLs**
Make sure your Django URLs include:

```python
# urls.py
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/auth/', include('your_auth_app.urls')),
    # ... other URLs
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

---

## **🧪 Testing Endpoints**

### **Registration Endpoint**
```bash
# Test registration
curl -X POST http://127.0.0.1:8000/api/auth/register/patient/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Smith",
    "phone_number": "+61412345678",
    "date_of_birth": "1990-01-15",
    "address_line_1": "123 Collins Street",
    "suburb": "Melbourne",
    "state": "VIC",
    "postcode": "3000",
    "medicare_number": "1234567890"
  }'
```

### **Login Endpoint**
```bash
# Test login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

---

## **🐛 Debugging**

### **Browser Console**
Check browser console for:
- API requests/responses
- CORS errors
- Authentication tokens
- Network errors

### **Django Logs**
Check Django console for:
- Request logs
- CORS errors
- Authentication errors
- Database queries

### **Network Tab**
In browser DevTools:
1. Open Network tab
2. Try registration/login
3. Check request/response details
4. Look for CORS errors

---

## **🔍 Common Issues**

### **CORS Errors**
```
Access to XMLHttpRequest at 'http://127.0.0.1:8000/api/auth/login/' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**: Add CORS settings to Django

### **Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```

**Solution**: Make sure Django server is running on port 8000

### **404 Not Found**
```
POST http://127.0.0.1:8000/api/auth/register/patient/ 404 (Not Found)
```

**Solution**: Check Django URLs configuration

---

## **📱 Testing Flow**

### **1. Registration Test**
1. Go to http://localhost:5173/register
2. Fill out the registration form
3. Submit and check browser console
4. Check Django logs for the request

### **2. Login Test**
1. Go to http://localhost:5173/login
2. Use registered credentials
3. Check for successful login
4. Verify token storage in localStorage

### **3. Dashboard Test**
1. After successful login
2. Should redirect to appropriate dashboard
3. Check user data in Redux store
4. Verify protected routes work

---

## **🛠️ Development Tools**

### **React DevTools**
- Redux DevTools for state management
- React DevTools for component debugging
- Network tab for API calls

### **Django Debug Toolbar**
```python
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ... other apps
    'debug_toolbar',
]

# Add to MIDDLEWARE
MIDDLEWARE = [
    # ... other middleware
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

# Add to urls.py
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
```

---

## **✅ Success Checklist**

- [ ] Django server running on port 8000
- [ ] React dev server running on port 5173
- [ ] CORS configured in Django
- [ ] API endpoints accessible
- [ ] Registration form works
- [ ] Login form works
- [ ] Role-based redirects work
- [ ] No console errors
- [ ] Tokens stored in localStorage

---

## **🚀 Next Steps**

1. Test all authentication flows
2. Implement error handling
3. Add loading states
4. Test with different user roles
5. Deploy to staging environment
