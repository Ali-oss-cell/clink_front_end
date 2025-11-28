# 🔍 Debugging Booking Flow Loop

## What to Check

### 1. **Browser Console Logs**

Open browser DevTools (F12) → Console tab and look for:

```
[ServiceSelectionPage] Component mounted/updated
[ServiceSelectionPage] serviceFromUrl: ...
[ServiceSelectionPage] selectedService state: ...
[PsychologistSelectionPage] Component mounted/updated
[PsychologistSelectionPage] selectedService from URL: ...
```

**What to look for:**
- Are these logs repeating rapidly? (indicates loop)
- What values are shown for `selectedService`?
- Are there any navigation logs appearing repeatedly?

### 2. **Network Tab**

Open DevTools → Network tab and check:

- Are there repeated requests to `/appointments/book-appointment` or `/appointments/psychologist-selection`?
- What's the status code? (200, 301, 302, etc.)
- Are there any failed requests?

### 3. **URL Changes**

Watch the browser address bar:

- Does the URL keep changing between:
  - `/appointments/book-appointment`
  - `/appointments/psychologist-selection?service=...`
- How fast is it changing? (every second = loop)

### 4. **Check URL Parameters**

When on `/appointments/psychologist-selection`:

- Does the URL have `?service=...` parameter?
- What is the service value? (e.g., `?service=individual-therapy`)
- Does the service parameter disappear and reappear?

### 5. **Browser History**

- Open DevTools → Application tab → History
- Check if there are many duplicate entries
- Try clearing browser history and cookies for the site

### 6. **React DevTools**

If you have React DevTools installed:

- Check component re-renders
- Look for components mounting/unmounting repeatedly
- Check state changes in ServiceSelectionPage and PsychologistSelectionPage

## Common Causes

### Cause 1: URL Parameter Not Preserved
**Symptom:** Service param disappears when navigating
**Check:** Console logs showing `selectedService: null` repeatedly

### Cause 2: useEffect Dependency Loop
**Symptom:** Component keeps re-rendering
**Check:** Look for useEffect logs repeating

### Cause 3: Browser History Issue
**Symptom:** Browser keeps going back/forward
**Fix:** Clear browser history, try incognito mode

### Cause 4: ProtectedRoute Redirect
**Symptom:** Redirects happening from ProtectedRoute component
**Check:** Check ProtectedRoute logs in console

## Quick Fixes to Try

### Fix 1: Clear Browser Cache
```bash
# In browser:
Ctrl+Shift+Delete (Windows/Linux)
Cmd+Shift+Delete (Mac)
# Clear cache and cookies
```

### Fix 2: Hard Refresh
```
Ctrl+F5 (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Fix 3: Try Incognito/Private Mode
- Open in private/incognito window
- This eliminates cache/cookie issues

### Fix 4: Check Browser Console for Errors
- Look for red error messages
- Check for JavaScript errors
- Look for React errors

## What Information to Provide

If the loop persists, please provide:

1. **Console Logs** (copy all `[ServiceSelectionPage]` and `[PsychologistSelectionPage]` logs)
2. **Network Tab Screenshot** (showing repeated requests)
3. **URL Sequence** (what URLs you see in the address bar)
4. **Steps to Reproduce**:
   - Start from which page?
   - What button/link do you click?
   - What happens next?

## Manual Test Steps

1. **Start Fresh:**
   - Go to `/appointments/book-appointment`
   - Check console: Should see `[ServiceSelectionPage] Component mounted`

2. **Select Service:**
   - Click on a service card
   - Check console: Should see `selectedService state: individual-therapy` (or similar)

3. **Click Continue:**
   - Click "Continue to Psychologist Selection"
   - Check console: Should see `[ServiceSelectionPage] Navigating to: /appointments/psychologist-selection?service=...`
   - Check URL: Should change to `/appointments/psychologist-selection?service=...`

4. **On Psychologist Page:**
   - Check console: Should see `[PsychologistSelectionPage] selectedService from URL: individual-therapy`
   - Should NOT see error state (no "Service Selection Required" message)

5. **Click Back:**
   - Click "Back to Service Selection"
   - Check console: Should see `[PsychologistSelectionPage] handleBack called`
   - URL should change to `/appointments/book-appointment` (no service param)
   - Service selection should be cleared

## Expected Behavior

✅ **Correct Flow:**
1. Service page loads → no service selected
2. User selects service → state updates
3. User clicks Continue → navigates to psychologist page with `?service=...`
4. Psychologist page loads → reads service from URL, shows psychologists
5. User clicks Back → navigates to service page, service selection cleared

❌ **Loop Behavior:**
- Pages keep switching automatically
- URL keeps changing without user action
- Console logs repeating rapidly
- Network requests repeating

## Next Steps

After checking the above, share:
1. Console logs (especially the debug logs)
2. What you see in the browser
3. Any error messages

This will help identify the exact cause of the loop.

