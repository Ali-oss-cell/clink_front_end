# Dynamic Service Resolution

## Overview
The booking flow now **dynamically fetches services from the API** instead of using hardcoded mappings. This ensures the frontend always uses the correct service IDs from the backend database.

## Changes Made

### Before (Hardcoded Mapping)
```typescript
const FRONTEND_TO_BACKEND_SERVICE_MAP: Record<string, number> = {
  'individual-therapy': 1,
  'couples-therapy': 2,
  'psychological-assessment': 3,
  'telehealth-video-session': 4,
};
```

**Problems:**
- ❌ Hardcoded IDs could become outdated
- ❌ Required manual updates when services change
- ❌ Could break if backend IDs don't match

### After (Dynamic API Fetch)
```typescript
// Fetch services from API (cached after first call)
const services = await servicesService.getAllServices();

// Match slug to service name
const matchedService = services.find(s => {
  const serviceSlug = s.name.toLowerCase().replace(/\s+/g, '-');
  return serviceSlug === selectedService.toLowerCase();
});

// Use the real ID from backend
setServiceId(matchedService.id);
```

**Benefits:**
- ✅ Always uses correct IDs from backend database
- ✅ Automatically adapts to service changes
- ✅ No manual mapping required
- ✅ API response is cached for performance

## How It Works

### 1. Service Resolution Flow
```
User selects service → Frontend receives slug → Fetch services from API → Match slug to service name → Get real ID
```

### 2. Matching Logic
The system tries multiple matching strategies:

1. **Exact match**: `"individual-therapy"` matches `"individual-therapy"`
2. **Partial match**: `"individual-therapy"` matches `"individual-therapy-session"`
3. **Base match**: `"individual-therapy-session"` matches `"individual-therapy"` (removes `-session` suffix)

### 3. Caching
```typescript
class ServicesService {
  private servicesCache: Service[] | null = null;

  async getAllServices(): Promise<Service[]> {
    // Return cached services if available
    if (this.servicesCache) {
      return this.servicesCache;
    }
    
    // Fetch from API and cache
    const services = await fetchFromAPI();
    this.servicesCache = services;
    return services;
  }
}
```

**Benefits:**
- First call: Fetches from API
- Subsequent calls: Returns cached data instantly
- No repeated API calls

## Updated Files

### 1. `src/pages/patient/DateTimeSelectionPage.tsx`
**Changes:**
- ✅ Removed hardcoded `FRONTEND_TO_BACKEND_SERVICE_MAP`
- ✅ Now calls `servicesService.getAllServices()` to fetch services dynamically
- ✅ Enhanced matching logic with multiple strategies
- ✅ Added detailed logging for debugging

**Code:**
```typescript
// ✅ Fetch services dynamically from API (uses cache after first call)
console.log('[DateTimeSelectionPage] Fetching services from API to resolve slug:', selectedService);
const services = await servicesService.getAllServices();
console.log('[DateTimeSelectionPage] Available services from API:', services.map(s => ({ id: s.id, name: s.name })));

// Try to find service by matching slug to service name
const matchedService = services.find(s => {
  const serviceSlug = s.name.toLowerCase().replace(/\s+/g, '-');
  const selectedSlug = selectedService.toLowerCase();
  
  // Exact match, partial match, or base match
  return serviceSlug === selectedSlug || 
         serviceSlug.includes(selectedSlug) || 
         selectedSlug.includes(serviceSlug);
});
```

### 2. `src/services/api/services.ts`
**Already implemented** (no changes needed):
- ✅ `getAllServices()` - Fetches and caches services
- ✅ `getServiceIdFromSlug()` - Converts slug to ID
- ✅ `getServiceById()` - Gets service by ID
- ✅ `clearCache()` - Clears cache for testing

## API Response Format

### GET `/api/services/`
```json
{
  "results": [
    {
      "id": 1,
      "name": "Telehealth Consultation",
      "description": "Video consultation with psychologist",
      "standard_fee": "180.00",
      "duration_minutes": 60,
      "is_active": true
    },
    {
      "id": 2,
      "name": "Individual Therapy Session",
      "description": "One-on-one therapy session",
      "standard_fee": "180.00",
      "duration_minutes": 60,
      "is_active": true
    }
  ]
}
```

## Example Flow

### Scenario: User selects "Individual Therapy"

1. **Service Selection Page**
   - User clicks service
   - URL: `/appointments/psychologist-selection?service=individual-therapy`

2. **Psychologist Selection Page**
   - Reads `service=individual-therapy` from URL
   - Passes to next page

3. **Date/Time Selection Page**
   - Reads `service=individual-therapy` from URL
   - Calls `servicesService.getAllServices()` (fetches or returns cache)
   - API returns: `[{id: 1, name: "Telehealth Consultation"}, {id: 2, name: "Individual Therapy Session"}]`
   - Matches `"individual-therapy"` to `"Individual Therapy Session"`
   - Resolves to `serviceId: 2`
   - Uses ID 2 for available slots API call

4. **Console Output**
```
[DateTimeSelectionPage] Fetching services from API to resolve slug: individual-therapy
[DateTimeSelectionPage] Available services from API: [
  { id: 1, name: "Telehealth Consultation" },
  { id: 2, name: "Individual Therapy Session" }
]
[DateTimeSelectionPage] Partial match found: "Individual Therapy Session" (ID: 2)
[DateTimeSelectionPage] ✅ Service resolved successfully:
  - Slug: individual-therapy
  - Service ID: 2
  - Service Name: Individual Therapy Session
```

## Error Handling

### Service Not Found
```typescript
if (!matchedService) {
  console.error('[DateTimeSelectionPage] ❌ Service not found for slug:', selectedService);
  console.error('[DateTimeSelectionPage] Available service names:', services.map(s => `"${s.name}"`).join(', '));
  setError(`Service "${selectedService}" not found. Please select a service again.`);
}
```

**User sees:**
- Error message: "Service 'xyz' not found. Please select a service again."
- Button to go back to service selection

### API Error
```typescript
catch (err) {
  console.error('[DateTimeSelectionPage] Error loading service:', err);
  setError('Failed to load service information. Please try selecting a service again.');
}
```

## Testing

### 1. Test Service Resolution
```typescript
// In browser console:
const services = await servicesService.getAllServices();
console.log('Services:', services);

// Test matching:
const testSlug = 'individual-therapy';
const match = services.find(s => 
  s.name.toLowerCase().replace(/\s+/g, '-').includes(testSlug)
);
console.log('Matched service:', match);
```

### 2. Test Cache
```typescript
// First call (fetches from API)
console.time('First call');
await servicesService.getAllServices();
console.timeEnd('First call'); // e.g., 150ms

// Second call (returns cache)
console.time('Second call');
await servicesService.getAllServices();
console.timeEnd('Second call'); // e.g., 0.1ms
```

### 3. Test Error Handling
```typescript
// Clear cache and test with invalid service
servicesService.clearCache();

// Try booking with invalid service slug
// URL: /appointments/date-time?service=invalid-service-xyz
// Should show error: "Service 'invalid-service-xyz' not found"
```

## Benefits Summary

| Aspect | Hardcoded Mapping | Dynamic API Fetch |
|--------|-------------------|-------------------|
| **Maintenance** | ❌ Manual updates required | ✅ Auto-updates |
| **Accuracy** | ❌ Can become outdated | ✅ Always current |
| **Flexibility** | ❌ Fixed services only | ✅ Adapts to any service |
| **Performance** | ✅ Instant lookup | ✅ Cached after first call |
| **Debugging** | ❌ Hard to troubleshoot | ✅ Detailed logging |

## Related Files
- `src/pages/patient/DateTimeSelectionPage.tsx` - Service resolution logic
- `src/services/api/services.ts` - Services API with caching
- `src/pages/patient/ServiceSelectionPage.tsx` - Where users select services
- `src/services/api/appointments.ts` - Uses resolved service ID for available slots

## Summary
✅ No more hardcoded service ID mappings
✅ Always uses real IDs from backend database
✅ Automatically adapts to service changes
✅ Fast performance with caching
✅ Better error handling and debugging

