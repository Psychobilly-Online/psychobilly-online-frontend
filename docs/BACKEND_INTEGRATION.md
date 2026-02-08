# Backend Integration Guide

## Overview

This document maps the **actual backend data structure** to our frontend types and components. Use this as a reference when working with API data.

⚠️ **Important**: The backend uses legacy field names from the original PHP application (2008). Always verify field names before assuming!

## Event Data Structure

### Actual Backend Response

```json
{
  "id": 3585,
  "date_start": "2009-01-03",
  "date_end": "2009-01-03",
  "headline": "King For A Day",
  "bands": "The King For A Day",
  "text": "The KING FOR A DAY plays PUNKROCK, PSYCHOBILLY, SKA",
  "image": "",
  "link": "http://example.com/event",
  "country_id": "102",
  "state_id": "0",
  "venue_id": 1963,
  "contact_id": 9999,
  "category_id": 5,
  "user_id": 1,
  "city": "Köln (Cologne)",
  "edit_date": "0000-00-00 00:00:00",
  "create_date": "2008-12-23 11:07:46",
  "approved": true
}
```

### Frontend Type Mapping

| Backend Field | Frontend Type | Notes                                    |
| ------------- | ------------- | ---------------------------------------- |
| `id`          | `number`      | Event ID                                 |
| `date_start`  | `string`      | ⚠️ NOT `date` - ISO date format          |
| `date_end`    | `string?`     | Optional end date                        |
| `headline`    | `string`      | Event title                              |
| `bands`       | `string?`     | ⚠️ Band names (comma-separated)          |
| `text`        | `string?`     | ⚠️ NOT `description` - Event description |
| `link`        | `string?`     | ⚠️ NOT `event_link` - Single link only   |
| `image`       | `string?`     | Image ID (not URL)                       |
| `city`        | `string?`     | City name                                |
| `venue_id`    | `number?`     | Foreign key to venues table              |
| `country_id`  | `string?`     | ⚠️ ID not name - needs lookup            |
| `state_id`    | `string?`     | ⚠️ ID not name - needs lookup            |
| `category_id` | `number?`     | Event category FK                        |
| `user_id`     | `number?`     | Creator user ID                          |
| `contact_id`  | `number?`     | Contact person ID                        |
| `create_date` | `string?`     | Creation timestamp                       |
| `edit_date`   | `string?`     | Last edit timestamp                      |
| `approved`    | `boolean?`    | Approval status                          |

### Common Mistakes ❌

```typescript
// ❌ WRONG - These fields don't exist in backend
event.date; // Use event.date_start
event.description; // Use event.text
event.event_link; // Use event.link
event.ticket_link; // Doesn't exist
event.venue_name; // Use event.venue_id (requires lookup)
event.country; // Use event.country_id (requires lookup)
event.time; // Doesn't exist (extract from date_start if needed)

// ✅ CORRECT
event.date_start;
event.text;
event.link;
event.venue_id;
event.country_id;
event.bands;
```

## Venue Data Structure

### Backend Response (from venues table)

```json
{
  "id": 1963,
  "name": "Venue Name",
  "street": "Main Street 123",
  "zip": "50667",
  "city": "Cologne",
  "state": "NRW",
  "country": "Germany",
  "website": "https://venue.com",
  "latitude": 50.9375,
  "longitude": 6.9603
}
```

### Current Issue

- Events API returns `venue_id` but NOT `venue_name`
- Frontend needs to either:
  1. Make separate API call to get venue details
  2. Backend includes venue in event response (JOIN query)

**Recommendation**: Update backend to include venue data in event response.

## Country/State Lookups

### Current Issue

- Events have `country_id` (e.g., "102") and `state_id` (e.g., "0")
- No country/state names in event response
- Need lookup tables or API endpoints

### Possible Solutions

1. **Frontend lookup table** (fast, but needs maintenance)

   ```typescript
   const COUNTRIES = {
     '102': 'Germany',
     '103': 'United Kingdom',
     // ...
   };
   ```

2. **Backend endpoint** (dynamic, but extra API call)

   ```
   GET /api/v1/countries
   GET /api/v1/states
   ```

3. **Include in event response** (best, requires backend change)
   ```json
   {
     "country_id": "102",
     "country_name": "Germany",
     "state_id": "0",
     "state_name": "NRW"
   }
   ```

## Image Handling

### Backend Structure

- Images stored separately in `psychobilly-online-images` service
- Events have `image` field with image ID (not URL)
- Image service provides variants: `thumb`, `medium`, `full`

### Frontend Integration

```typescript
// Already implemented in api-client.ts
apiClient.images.getUrl(event.image, 'thumb');
// Returns: https://psychobilly-online.de/images/thumb/12345.jpg
```

### Current Issue

- Many events have `image: ""` (empty string)
- EventCard checks `if (event.image)` but empty string is truthy
- Fix: Check `if (event.image && event.image !== '')`

## Date Handling

### Backend Format

- Always ISO date strings: `"YYYY-MM-DD"`
- `date_start`: Event start date (required)
- `date_end`: Event end date (optional, for multi-day events)
- `create_date`, `edit_date`: Timestamps in format `"YYYY-MM-DD HH:MM:SS"`

### Frontend Parsing

```typescript
// ✅ CORRECT - Validate before parsing
const parseDate = (dateString: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const eventDate = parseDate(event.date_start);
if (!eventDate) {
  console.warn(`Invalid date for event ${event.id}`);
  return null; // Don't render card
}
```

### Special Cases

- `"0000-00-00"` - Invalid date in MySQL (check for this!)
- `"0000-00-00 00:00:00"` - Invalid timestamp
- Empty string `""` - Also invalid

## API Endpoints Reference

### Events

```
GET  /api/v1/events
GET  /api/v1/events/{id}
POST /api/v1/events
PUT  /api/v1/events/{id}
DELETE /api/v1/events/{id}
```

### Query Parameters

| Parameter  | Type   | Description                                         |
| ---------- | ------ | --------------------------------------------------- |
| `page`     | number | Page number (default: 1)                            |
| `limit`    | number | Items per page (default: 10)                        |
| `status`   | string | Filter by status: `approved`, `pending`, `rejected` |
| `country`  | string | Filter by country ID                                |
| `dateFrom` | string | Filter events from date (ISO format)                |
| `dateTo`   | string | Filter events to date (ISO format)                  |

### Response Format

```typescript
{
  "data": Event[],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "pages": number
  }
}
```

## BFF (Backend for Frontend) Pattern

### Why BFF?

1. **Environment variables** - Backend URL not exposed to browser
2. **Error handling** - Centralized error processing
3. **Request transformation** - Adapt backend to frontend needs
4. **Security** - Add authentication headers

### Implementation

```
Browser → Next.js API Route → Backend API
         (/api/events)      (psychobilly-online.de/api/v1/events)
```

**Files**:

- `src/app/api/events/route.ts` - BFF route
- `src/lib/api-client.ts` - Backend API client
- `src/hooks/useEvents.ts` - React hook (calls BFF)

### Flow

1. Component calls `useEvents()` hook
2. Hook fetches from `/api/events` (BFF)
3. BFF calls `apiClient.events.list()` (backend)
4. Backend returns data to BFF
5. BFF returns data to hook
6. Hook updates component state

## Error Handling

### Backend Error Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Frontend Error Handling

```typescript
try {
  const data = await apiClient.events.list();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.status);
    // Handle specific error codes
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Authentication Flow (TODO)

### Current Status

- Backend supports JWT authentication
- Frontend not yet integrated
- Forum uses separate phpBB session

### Planned Implementation

```typescript
// Login
const { token } = await apiClient.auth.login(email, password);
localStorage.setItem('token', token);

// Use token in requests
headers: {
  'Authorization': `Bearer ${token}`
}

// Logout
localStorage.removeItem('token');
```

## Known Issues & Workarounds

### 1. Missing Venue Names

**Issue**: Events have `venue_id` but no `venue_name`

**Workaround**: Display city instead

```typescript
{event.city && (
  <div>📍 {event.city}</div>
)}
```

**Proper Fix**: Update backend to include venue data

### 2. Country/State IDs

**Issue**: Only IDs, no human-readable names

**Workaround**: Don't display until lookup implemented

```typescript
// Skip country display for now
```

**Proper Fix**: Add lookup endpoint or include in response

### 3. Empty Image Strings

**Issue**: `image: ""` passes truthy check

**Fix**: Check for empty string

```typescript
{event.image && event.image !== '' && (
  <img src={apiClient.images.getUrl(event.image, 'thumb')} />
)}
```

### 4. Invalid Dates

**Issue**: MySQL `0000-00-00` dates

**Fix**: Validate before parsing (already implemented)

```typescript
const date = new Date(dateString);
if (isNaN(date.getTime())) return null;
```

## Migration Checklist

When integrating new backend endpoints:

- [ ] Check actual API response (don't assume!)
- [ ] Document field names in this guide
- [ ] Update TypeScript types in `src/types/index.ts`
- [ ] Update API client in `src/lib/api-client.ts`
- [ ] Add error handling
- [ ] Test with real data
- [ ] Document any quirks or gotchas

## Contact

For backend changes or questions about data structure:

- Check backend repository: `psychobilly-online-api`
- Review database schema
- Test endpoints with Postman/curl

---

**Last Updated**: February 6, 2026  
**Next Review**: When adding new API integrations
