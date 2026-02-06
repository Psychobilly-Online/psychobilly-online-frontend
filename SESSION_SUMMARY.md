# Session Summary - February 6, 2026

## What We Achieved

### 1. **Development Environment Setup**
- ✅ Fixed Node.js PATH issue in PowerShell
  - Node.js v24.13.0 installed but not accessible
  - Added `C:\Program Files\nodejs` to PATH
  - Now can build locally before pushing to Vercel

### 2. **Frontend Deployment Architecture**
- ✅ Deployed Next.js 15 frontend to Vercel
  - **URL**: https://app.psychobilly-online.de
  - **Free SSL** for subdomain (no cost!)
  - Automatic deployments on git push to main branch
  - Environment variables configured (API, Images, Legacy URLs)

### 3. **CORS Configuration**
- ✅ Configured backend CORS via environment variables
  - Updated both API and Image service `.env.example`
  - Added `https://app.psychobilly-online.de` to allowed origins
  - Proper separation of concerns (not hardcoded)
  - **TODO**: Update `.env` files on HostEurope server

### 4. **Events Page Implementation**
- ✅ Built complete events listing with BFF architecture
  - Created TypeScript types matching backend structure
  - Implemented API client with error handling
  - Built Next.js API routes as BFF layer
  - Created custom `useEvents` hook for data fetching
  - Developed reusable `EventCard` component
  - Implemented pagination

### 5. **UX Pattern Consistency**
- ✅ Matched homepage design pattern
  - Header image (`#header` with background)
  - BigBox container styling (`.bigBox`, `.bigBoxContent`)
  - Responsive layout (flexboxgrid)
  - Dark theme consistency (#333 backgrounds, #d32f2f accents)

### 6. **CSS Architecture**
- ✅ Migrated from inline styled-jsx to CSS Modules
  - Created `EventCard.module.css`
  - Created `page.module.css` (then removed for bigBox pattern)
  - Proper CSS separation for reusability
  - Scoped styles prevent conflicts

### 7. **Error Handling & Validation**
- ✅ Fixed multiple runtime issues
  - Date parsing validation (prevent `Invalid time value` error)
  - Async params for Next.js 15+ compatibility
  - TypeScript type corrections (HeadersInit → Record<string, string>)
  - Graceful failure (return null instead of crashing)

## What We Learned

### Backend Data Structure Discovery
**Critical**: The backend API uses different field names than initially assumed:

```typescript
// ACTUAL Backend Structure:
{
  id: number;
  date_start: string;        // NOT "date"
  date_end?: string;
  headline: string;
  bands?: string;            // Band names
  text?: string;             // NOT "description"
  link?: string;             // NOT "event_link" or "ticket_link"
  city?: string;
  venue_id?: number;
  country_id?: string;       // NOT "country"
  state_id?: string;
  image?: string;
  category_id?: number;
  user_id?: number;
  contact_id?: number;
  create_date?: string;
  edit_date?: string;
  approved?: boolean;
}
```

**Key Differences**:
- `date_start` vs `date` (we had wrong field name)
- `text` vs `description`
- `link` vs `event_link`/`ticket_link` (only one link field)
- `bands` field exists (list of performing bands)
- No `venue_name`, `time`, `country`, or `state` fields directly
- IDs instead of names for country/state (requires lookup tables)

### Development Workflow Insights

1. **Always build locally before pushing**
   - Catch TypeScript errors early
   - Faster feedback loop than waiting for Vercel
   - Run `npm run build` before committing

2. **Log API responses during development**
   - Added `console.log` to see actual data structure
   - Revealed field name mismatches immediately
   - Remove debug logs before production

3. **Validate assumptions about backend data**
   - Don't assume field names match your expectations
   - Check actual API response structure first
   - Document discovered structure for team

4. **Development vs Production filtering**
   - Temporarily disabled date filtering to show past events
   - Database has 17+ years of historical data
   - Need proper date filtering for production

### Technical Patterns Established

1. **BFF (Backend for Frontend) Architecture**
   ```
   Browser → Next.js API Route → Backend API
            (/api/events)      (psychobilly-online.de/api/v1/events)
   ```
   - Environment variables for backend URLs
   - Error handling at BFF layer
   - Type-safe responses to frontend

2. **Reusable Component Pattern**
   ```
   Component.tsx + Component.module.css
   ```
   - CSS Modules for scoped styling
   - Props interface for type safety
   - Defensive programming (null checks)

3. **Custom Hooks Pattern**
   ```typescript
   useEvents(filters) → { events, loading, error, pagination, refetch }
   ```
   - Encapsulate data fetching logic
   - Reusable across components
   - Consistent state management

## Cross-Project TODO Management

### Problem
We have work spanning multiple repositories:
- `psychobilly-online-v2` (Frontend - Next.js)
- `psychobilly-online-api` (Backend - PHP/Slim)
- `psychobilly-online-images` (Image Service - PHP)
- Server configuration (HostEurope)

### Solution: Centralized TODO Tracking

Created this structure:

```
psychobilly-online-v2/
├── TODO.md                    ← Master cross-project todos
├── SESSION_SUMMARY.md         ← Session learnings (this file)
├── DEPLOYMENT_CHECKLIST.md    ← Deployment steps
└── docs/
    ├── BACKEND_INTEGRATION.md ← Backend data structures
    ├── API_REFERENCE.md       ← API endpoints documentation
    └── ARCHITECTURE.md        ← System architecture overview
```

See `TODO.md` for the complete task list.

## Next Session Priorities

### High Priority (Before Production)
1. Update server `.env` files with CORS configuration
2. Add date filtering back (show only future events)
3. Test complete flow on production URL
4. Add venue name lookup (join venue_id → venue table)
5. Add country name lookup (country_id → countries table)

### Medium Priority (MVP Features)
1. Event detail page (`/events/[id]`)
2. Event filtering (country, date range, search)
3. User authentication (JWT integration)
4. Event creation/editing forms
5. Admin dashboard

### Low Priority (Nice to Have)
1. Event image upload integration
2. Map view with venue locations
3. Calendar view of events
4. Social sharing functionality
5. Email notifications

## Important Notes

### Database Considerations
- **17+ years of historical data** (2008-2026)
- Most events are in the past
- Need smart filtering for relevant events
- Consider archiving old events for performance

### Field Name Conventions
The backend uses **legacy field names** from the old PHP application:
- `date_start` / `date_end` (not `date`)
- `text` (not `description`)
- `link` (singular, not multiple link types)
- IDs for relationships (not embedded names)

**Action**: When building new features, always check the actual backend response first!

### CSS Architecture Decision
- **Homepage**: Uses global CSS (`/public/styles/style.css`)
- **Events Page**: Uses CSS Modules (`EventCard.module.css`)
- **Consistency**: Events page now uses global `.bigBox` pattern from homepage
- **Future**: May need to decide on one approach for entire app

### Known Issues to Address
1. No venue names displayed (need join query or lookup)
2. No country names displayed (need lookup table)
3. All events showing (need date filter for production)
4. No event images showing (need image ID → URL mapping)
5. Debug console logs still active (remove before production)

## Commands Reference

### Local Development
```bash
# Add Node.js to PATH (Windows PowerShell)
$env:Path += ";C:\Program Files\nodejs"

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start
```

### Git Workflow
```bash
# Check status
git status

# Add all changes
git add -A

# Commit with message
git commit -m "description"

# Push to GitHub (triggers Vercel deployment)
git push

# View deployment at: https://app.psychobilly-online.de
```

### Debugging
```bash
# Check Next.js errors
npm run build

# View browser console for runtime errors
# Check Network tab for API calls

# Test API directly
curl https://psychobilly-online.de/api/v1/events?limit=1
```

## Lessons for Future Development

1. **Check the backend first** - Don't assume field names, check actual API response
2. **Build locally always** - Catch errors before pushing to Vercel
3. **Log during development** - Console.log API responses to understand structure
4. **Match existing UX** - Use established patterns (header, bigBox) for consistency
5. **CSS Modules for components** - But respect global patterns for layouts
6. **Defensive coding** - Validate dates, check for undefined, fail gracefully
7. **Document discoveries** - Write down actual data structures found
8. **Environment variables** - Never hardcode URLs or secrets

## Resources

- **Frontend**: https://app.psychobilly-online.de
- **API Docs**: https://psychobilly-online.de/api/v1/
- **Vercel Dashboard**: https://vercel.com/christianmautzs-projects
- **GitHub Repo**: https://github.com/christianmautz/psychobilly-online-frontend
- **Legacy Site**: https://www.psychobilly-online.de

---

**Session Duration**: ~3 hours  
**Files Created**: 15+  
**Files Modified**: 20+  
**Commits**: Multiple (deployment, CORS, events page, CSS modules, bug fixes)  
**Deploy Status**: ✅ Production-ready (with minor todos)
