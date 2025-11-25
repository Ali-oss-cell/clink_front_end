# CORS Fix for Backend

## Problem
The frontend at `https://tailoredpsychology.com.au` cannot connect to the API at `https://api.tailoredpsychology.com.au` because CORS is blocking the requests.

## Solution

### Step 1: Edit Django settings.py

Add or update the CORS configuration:

```python
CORS_ALLOWED_ORIGINS = [
    "https://tailoredpsychology.com.au",
]

# Also ensure these are set:
CORS_ALLOW_CREDENTIALS = True
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

### Step 2: Restart Services

```bash
sudo systemctl restart gunicorn
sudo systemctl reload nginx
```

### Step 3: Verify

After restarting, try joining a video call again. The error should be resolved.

## Quick Test

You can test if CORS is working by running this in your browser console on `https://tailoredpsychology.com.au`:

```javascript
fetch('https://api.tailoredpsychology.com.au/api/appointments/video-token/13/', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://tailoredpsychology.com.au',
    'Access-Control-Request-Method': 'GET'
  }
}).then(r => {
  console.log('CORS Status:', r.status);
  console.log('CORS Headers:', r.headers.get('access-control-allow-origin'));
});
```

If you see `access-control-allow-origin: https://tailoredpsychology.com.au`, CORS is configured correctly.

