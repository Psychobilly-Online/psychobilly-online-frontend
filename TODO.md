# Psychobilly Online - Master TODO List

## 🔴 Critical (Must Fix Before Production)

- [x] **Update server `.env` files with CORS configuration** ✅ DONE
  - Location: HostEurope server
  - Files: `psychobilly-online-api/.env` and `psychobilly-online-images/.env`
  - Add: `CORS_ALLOWED_ORIGINS=https://app.psychobilly-online.de`
  - Instructions: See `UPDATE_API_CORS.md`

- [x] **Remove debug console.log statements**
  - Files: `src/hooks/useEvents.ts`, `src/app/events/page.tsx`
  - ✅ Removed development logging

- [x] **Add production date filtering**
  - ✅ Removed hardcoded date filter - now uses user-selected date range from filters

## 🟡 High Priority (MVP Features)

### Phase 1: Events List & Detail View

#### Frontend - Events List Improvements
- [ ] **Event filtering (!)** - HIGH PRIORITY 🔨 IN PROGRESS
  - [x] Country dropdown (uses print_name)
  - [x] Category dropdown (populated from database)
  - [x] Date range picker (basic - using native date inputs)
  - [x] Search by headline/city/bands
  - [x] Clear filters button
  - [x] Results per page selector
  - [x] Sort by / Order by controls (UI only, backend TODO)
  - [x] Display year on event cards
  - [x] Display category on event cards
  - [x] **Fixed backend date filtering** - SQL queries now work correctly
  - [x] **Fixed total count** - Backend now returns accurate total for pagination
  - [x] Single date range picker component (replace dual date inputs)
  - [x] City dropdown (populated after country selection)
    - Need backend: GET /api/v1/cities?country_id={id}
  - [x] **Implement backend sorting** (sort_by, sort_order parameters)
    - [x] Add parameters to EventRepository
    - [x] Map sort values to database columns
    - [x] Update ListEventsAction to pass parameters
  - [x] **Display category names instead of IDs**
    - [x] Fetch categories on page load
    - [x] Pass names to EventCard component
  - Estimated: 4-6 hours (COMPLETED)

- [ ] **Fix special character encoding**
  - Handle `&amp;` and other HTML entities
  - Example: "Rock &amp; Roll" should display as "Rock & Roll"
  - Use `dangerouslySetInnerHTML` or decode function
  - Estimated: 30 minutes

- [ ] **Auto-add protocol to links**
  - If link doesn't start with http:// or https://, add it
  - Prevent broken links
  - Estimated: 15 minutes

- [ ] **Improve pagination**
  - Current: Basic prev/next buttons
  - Add: Page numbers, jump to page, items per page selector
  - Show "Loading..." state during page transitions
  - Estimated: 2-3 hours

- [ ] **Responsive image handling**
  - Hide event images on mobile (< 720px)
  - Use CSS media queries in EventCard.module.css
  - Estimated: 15 minutes

- [ ] **Design considerations**
  - Review spacing, typography, colors
  - Ensure consistency with homepage
  - Mobile UX improvements
  - Estimated: 2-3 hours

#### Frontend - Event Detail Page
- [ ] **Event detail page** (`/events/[id]`)
  - Full event information (all fields)
  - Larger image display (medium or full variant)
  - Formatted text with proper line breaks
  - Venue information (when backend provides it)
  - Edit button (for owners/admins - requires auth)
  - Share functionality
  - Back to list button
  - Estimated: 3-4 hours

### Phase 2: Authentication & User Features

- [ ] **Authentication system**
  - JWT integration with backend
  - Login/Logout components
  - Session management
  - Protected routes (HOC or middleware)
  - Remember me functionality
  - Estimated: 1-2 days

- [ ] **User dashboard**
  - My events (created by user)
  - Edit/Delete own events
  - Profile settings
  - Change password
  - Estimated: 1-2 days

### Phase 3: Content Management

- [ ] **Event creation form**
  - Multi-step form wizard
  - Date picker (start and end date)
  - Venue selection (dropdown or autocomplete)
  - Create new venue inline
  - Bands field (comma-separated or multi-input)
  - Text editor with preview
  - Image upload integration
  - Link field with validation
  - Form validation (client and server)
  - Estimated: 2-3 days

- [ ] **Event editing**
  - Pre-populated form with existing data
  - Permission checks (owner or admin only)
  - Update API integration
  - Show edit history (if available)
  - Estimated: 4-6 hours

- [ ] **Event editing**
  - Pre-populated form with existing data
  - Permission checks (owner or admin only)
  - Update API integration
  - Show edit history (if available)
  - Estimated: 4-6 hours

- [ ] **Venue management**
  - List all venues
  - Add new venue form
  - Edit existing venue
  - Venue detail page (shows all events at venue)
  - Search/filter venues
  - Map integration (optional)
  - Estimated: 2-3 days

- [ ] **Admin dashboard**
  - Event approval queue
  - Approve/Reject events
  - User management
  - Venue management
  - Statistics and analytics
  - Bulk actions
  - Estimated: 3-4 days

## 🟢 Medium Priority (Nice to Have)

### Admin Features
- [ ] **Event approval system**
  - Approve/Reject events
  - Bulk actions
  - Email notifications
  - Estimated: 1 day

- [ ] **User management**
  - User list
  - Role assignment
  - Ban/Unban users
  - Estimated: 1 day

### UX Improvements
- [ ] **Loading states**
  - Skeleton screens for EventCard
  - Better loading animations
  - Progressive enhancement
  - Estimated: 4-6 hours

- [ ] **Error boundaries**
  - Graceful error handling
  - User-friendly error messages
  - Retry mechanisms
  - Estimated: 4 hours

- [ ] **Responsive improvements**
  - Mobile navigation
  - Touch-friendly controls
  - Tablet optimization
  - Estimated: 1 day

### API Enhancements
- [ ] **Optimize event queries**
  - Add indexes on date_start, country_id, approved
  - Implement caching (Redis)
  - Pagination optimization
  - Location: `psychobilly-online-api`

- [ ] **Add search endpoint**
  - Full-text search in headline, text, city
  - Elastic search integration?
  - Location: `psychobilly-online-api`

## 🔵 Low Priority (Future)

### Advanced Features
- [ ] **Map view**
  - Google Maps / Mapbox integration
  - Cluster markers
  - Filter events by region
  - Estimated: 2-3 days

- [ ] **Calendar view**
  - Month/Week/Day views
  - Event calendar component
  - iCal export
  - Estimated: 2-3 days

- [ ] **Social sharing**
  - Share to Facebook, Twitter
  - WhatsApp share
  - Copy link functionality
  - Estimated: 4 hours

- [ ] **Email notifications**
  - Event reminders
  - New events in your area
  - Subscription management
  - Backend: Email service integration
  - Estimated: 2-3 days

- [ ] **User profiles**
  - My events
  - Favorite venues
  - Event history
  - Estimated: 1-2 days

### Performance & Optimization
- [ ] **Image optimization**
  - Lazy loading
  - WebP format support
  - Responsive images
  - CDN integration
  - Estimated: 1 day

- [ ] **Code splitting**
  - Route-based splitting (already done by Next.js)
  - Component lazy loading
  - Bundle size optimization
  - Estimated: 4-6 hours

- [ ] **SEO optimization**
  - Meta tags per page
  - OpenGraph tags
  - Structured data (JSON-LD)
  - Sitemap generation
  - Estimated: 1 day

## 📋 Backend Tasks (Separate Repos)

### psychobilly-online-api

#### Critical Backend Changes
- [ ] **Update `.env` with CORS origins** (server)
  - Add `https://app.psychobilly-online.de`
  - Location: HostEurope server
  - See: UPDATE_API_CORS.md

- [ ] **Fix image field in events endpoint**
  - **IMPORTANT**: Use field `19_image` instead of `6_image` (legacy)
  - Current endpoint returns wrong image field
  - Affects: GET /api/v1/events and GET /api/v1/events/{id}
  - Note: Check API README for field mappings

- [ ] **Extend events table schema**
  - Add `tags` field (TEXT, comma-separated list for keywords)
  - Add `genre` field (VARCHAR(100) or FK to genres table)
  - **Note**: Keep `bands` field separate - don't migrate to tags
  - Migration required for production database
  - Consider: Should genres be a separate lookup table?

- [ ] **Update API to handle new fields**
  - Include `tags` and `genre` in event responses
  - Add filtering by tags and genre
  - Update validation rules for these fields

#### Backend Enhancements
- [ ] **Add venue data to events endpoint**
  - Include venue name, address, website in event response
  - Use JOIN query on venue_id
  - Reduces frontend API calls
  - Check: API repo for current query structure

- [ ] **Add country/state name lookups**
  - Include country_name and state_name in event response
  - Use JOIN or lookup tables
  - Frontend displays human-readable names

- [ ] **Implement search endpoint**
  - Full-text search in headline, text, city, bands
  - Support partial matches
  - Consider performance (indexes)

- [ ] **Add database indexes for performance**
  - See database section below

- [ ] **API documentation (OpenAPI/Swagger)**
  - Document all endpoints
  - Include request/response examples
  - Field descriptions and types

### psychobilly-online-images
- [ ] Update `.env` with CORS origins (server)
- [ ] Test image upload from frontend
- [ ] Add image optimization pipeline
- [ ] Implement thumbnail generation variants

## ⚠️ Important Development Guidelines

### Avoid Assumptions - Always Verify!

**CRITICAL**: Do not assume API field names, structures, or behaviors.

**Before implementing any API integration:**
1. ✅ Check the API README in `psychobilly-online-api` repo
2. ✅ Test the actual endpoint with curl or Postman
3. ✅ Log the response in console to see actual structure
4. ✅ Document any discoveries in `docs/BACKEND_INTEGRATION.md`
5. ✅ If making an assumption, clearly communicate it

**Example of what went wrong today:**
- ❌ Assumed field was named `date` → Actually `date_start`
- ❌ Assumed field was named `description` → Actually `text`
- ❌ Assumed field was named `event_link` → Actually `link`
- ❌ Cost us 30+ minutes of debugging

**How to avoid this:**
```bash
# Always test the endpoint first
cd d:/webdev/psychobilly-online-api
cat README.md  # Read the documentation

# Test actual response
curl https://psychobilly-online.de/api/v1/events?limit=1

# Log in frontend during development
console.log('Actual API response:', data);
```

### Database Schema Reference

All database table structures are documented in `docs/DATABASE_SCHEMA.md`.
Refer to this file when:
- Building forms (to know available fields)
- Writing API queries (to know table relationships)
- Understanding data types and constraints

### Field Name Conventions

**Legacy naming** from 2008 PHP application:
- Dates: `date_start`, `date_end`, `create_date`, `edit_date`
- Text: `text` not `description`
- Links: `link` (singular) not `event_link` or `ticket_link`
- IDs: `country_id`, `state_id`, `venue_id` (foreign keys)
- Images: **`19_image`** field (not `6_image` or just `image`) ← Backend needs fix!

**When in doubt**: Check the API README or test the endpoint!

## 🗄️ Database Tasks

### Migrations Needed
- [ ] **Add indexes**
  ```sql
  CREATE INDEX idx_date_start ON events(date_start);
  CREATE INDEX idx_approved ON events(approved);
  CREATE INDEX idx_country ON events(country_id);
  ```

- [ ] **Add tags and genre fields to events table**
  ```sql
  -- Add tags field for comma-separated tags (keywords, style descriptors, etc.)
  ALTER TABLE psycho_events ADD COLUMN tags TEXT NULL COMMENT 'Comma-separated tags';
  
  -- Add genre field
  ALTER TABLE psycho_events ADD COLUMN genre VARCHAR(100) NULL;
  
  -- Alternative: Create proper genres lookup table for better normalization
  -- CREATE TABLE psycho_events_genres (
  --   id INT PRIMARY KEY AUTO_INCREMENT,
  --   name VARCHAR(100) NOT NULL UNIQUE
  -- );
  -- ALTER TABLE psycho_events ADD COLUMN genre_id INT;
  -- ADD FOREIGN KEY (genre_id) REFERENCES psycho_events_genres(id);
  ```
  - **Note**: `bands`, `tags`, and `genre` are three separate fields
  - `bands`: Performing bands/artists (comma-separated)
  - `tags`: Additional keywords/tags (comma-separated)
  - `genre`: Primary music genre

- [ ] **Create lookup tables cache**
  - Cache country names in frontend
  - Cache venue names in frontend
  - Reduce API calls

### Data Cleanup
- [ ] **Archive old events**
  - Move events older than 2 years to archive table
  - Keep database performant
  - Estimated: 4-6 hours

- [ ] **Validate data integrity**
  - Check for orphaned venue_ids
  - Validate date formats
  - Clean up invalid country_ids
  - Estimated: 1 day

## 📚 Documentation Tasks

- [x] Session summary (this was done)
- [x] Master TODO list (this file)
- [ ] **Backend API documentation**
  - Document all endpoints
  - Request/Response examples
  - Error codes
  - File: `docs/API_REFERENCE.md`

- [ ] **Architecture documentation**
  - System overview diagram
  - Data flow diagrams
  - Technology stack
  - File: `docs/ARCHITECTURE.md`

- [ ] **Backend integration guide**
  - Data structure reference
  - Field name mappings
  - Known quirks/gotchas
  - File: `docs/BACKEND_INTEGRATION.md`

- [ ] **Deployment guide**
  - Frontend deployment (Vercel)
  - Backend deployment (HostEurope)
  - Environment variables
  - DNS configuration
  - File: `docs/DEPLOYMENT.md` (expand existing)

## 🧪 Testing Tasks

- [ ] **Unit tests**
  - Component tests (React Testing Library)
  - Hook tests
  - API client tests
  - Target: 80% coverage

- [ ] **Integration tests**
  - API route tests
  - End-to-end flows
  - Cypress or Playwright

- [ ] **Manual testing checklist**
  - Browser compatibility (Chrome, Firefox, Safari, Edge)
  - Mobile responsiveness (iOS, Android)
  - Performance testing (Lighthouse)

## 🔧 DevOps Tasks

- [ ] **CI/CD Pipeline**
  - GitHub Actions for tests
  - Automated deployment
  - Preview deployments for PRs

- [ ] **Monitoring**
  - Error tracking (Sentry)
  - Analytics (Google Analytics / Plausible)
  - Performance monitoring (Vercel Analytics)

- [ ] **Backup strategy**
  - Database backups
  - Image backups
  - Backup restoration testing

## ⚠️ Important Development Guidelines

### Avoid Assumptions - Always Verify!

**CRITICAL**: Do not assume API field names, structures, or behaviors.

**Before implementing any API integration:**
1. ✅ Check the API README in `psychobilly-online-api` repo
2. ✅ Test the actual endpoint with curl or Postman
3. ✅ Log the response in console to see actual structure
4. ✅ Document any discoveries in `docs/BACKEND_INTEGRATION.md`
5. ✅ If making an assumption, clearly communicate it

**Example of what went wrong today:**
- ❌ Assumed field was named `date` → Actually `date_start`
- ❌ Assumed field was named `description` → Actually `text`
- ❌ Assumed field was named `event_link` → Actually `link`
- ❌ Cost us 30+ minutes of debugging

**How to avoid this:**
```bash
# Always test the endpoint first
cd d:/webdev/psychobilly-online-api
cat README.md  # Read the documentation

# Test actual response
curl https://psychobilly-online.de/api/v1/events?limit=1

# Log in frontend during development
console.log('Actual API response:', data);
```

### Database Schema Reference

All database table structures are documented in `docs/DATABASE_SCHEMA.md`.
Refer to this file when:
- Building forms (to know available fields)
- Writing API queries (to know table relationships)
- Understanding data types and constraints

### Field Name Conventions

**Legacy naming** from 2008 PHP application:
- Dates: `date_start`, `date_end`, `create_date`, `edit_date`
- Text: `text` not `description`
- Links: `link` (singular) not `event_link` or `ticket_link`
- IDs: `country_id`, `state_id`, `venue_id` (foreign keys)
- Images: `19_image` field (not `6_image` or just `image`)

**When in doubt**: Check the API README or test the endpoint!

## 📝 Notes

### Dependencies Between Tasks
- Event detail page requires venue/country lookups
- Event creation requires authentication
- Admin dashboard requires authentication
- Search requires backend endpoint

### Prioritization Strategy
1. Fix critical CORS issue first
2. Complete MVP features (detail page, filtering, auth)
3. Add admin features
4. Optimize and enhance UX
5. Add advanced features

### Time Estimates
- **Critical tasks**: 2-4 hours
- **High priority**: 1-2 weeks
- **Medium priority**: 2-3 weeks
- **Low priority**: 1-2 months
- **Total MVP**: ~3-4 weeks of development

---

**Last Updated**: February 6, 2026  
**Next Review**: After completing Critical tasks
