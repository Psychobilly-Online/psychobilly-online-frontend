# Psychobilly Online - Master TODO List

## 🔴 Critical (Must Fix Before Production)

- [x] **Update server `.env` files with CORS configuration** ✅ DONE
  - Location: HostEurope server
  - Files: `psychobilly-online-api/.env` and `psychobilly-online-images/.env`
  - Add: `CORS_ALLOWED_ORIGINS=https://app.psychobilly-online.de`
  - Instructions: See `UPDATE_API_CORS.md`

- [x] **Remove debug console.log statements** ✅ DONE
  - Files: `src/hooks/useEvents.ts`, `src/app/events/page.tsx`

- [x] **Add production date filtering** ✅ DONE
  - Now shows upcoming events by default (from today)

- [x] **Image Field Handling** ✅ RESOLVED
  - **Decision**: Keep `legacy_image` for old events, use new `image` field for new events
  - **Status**: Already implemented in API
  - **Priority**: Not critical, no migration needed

## 🟡 High Priority (Current Sprint)

### Frontend Features

#### Recently Completed ✅

- [x] **Top Navigation Bar** - COMPLETED ✅
  - [x] Create TopBar component with hamburger menu, centered search, notification/account icons
  - [x] Integrate TopBar into layout (sticky, 45px height)
  - [x] Connect search to events filter
  - [x] Remove search field from EventFilters, display "x events found" instead
  - [x] Implement SearchContext for shared filter state
  - [x] Fix sticky filter border-radius detection
  - [x] Standardize spacing to 3px scale
  - [x] Consolidate colors and create CSS variables
  - [x] Create reusable IconButton component (3 sizes, 3 variants)
  - [x] Replace Material-UI IconButton with custom IconButton
  - [x] Clean up legacy CSS files (deleted 1,830 lines)
  - [x] Migrate to CSS modules (ClientLayout, Startpage)
  - [x] Fix responsive layout issues
  - [x] Add comprehensive test coverage
  - [x] Fix mobile chip wrapping
  - [x] Fix search term preservation when changing filters
  - [x] Fix race condition in SearchContext

- [x] **Search Chips Feature** - COMPLETED ✅
  - [x] Display search terms as removable chips
  - [x] Implement chip removal (x button)
  - [x] AND logic for multiple terms
  - [x] Persist chips when switching filters
  - [x] Test coverage
  - [x] Scroll to top on search/filter changes

- [x] **Event filtering system** - COMPLETED ✅
  - [x] Country dropdown (ordered by event count)
  - [x] City dropdown (from venue table)
  - [x] Category dropdown
  - [x] Date range filters
  - [x] Search functionality
  - [x] Backend sorting
  - [x] Clear filters with count badge

- [x] **Event display improvements** - COMPLETED ✅
  - [x] Display year and category name
  - [x] Show venue location
  - [x] Decode HTML entities
  - [x] Auto-add https:// to links
  - [x] Multi-day date display
  - [x] Auto-collapse filters on scroll

- [x] **Infinite scroll** - COMPLETED ✅
  - [x] Intersection Observer implementation
  - [x] Event deduplication
  - [x] Race condition handling
  - [x] Timezone-safe date parsing

#### Next Frontend Tasks

- [x] **Loading state in EventFilters** - COMPLETED ✅
  - [x] Add loading prop to EventFilters component
  - [x] Display spinner icon and "Loading events..." text
  - [x] Show spinner during search refinement (not just initial load)
  - [x] Test loading state display
  - Completed: February 17, 2026

- [x] **Genre Filtering System** - COMPLETED ✅
  - [x] Add genre filtering to API (with active filter and counts)
  - [x] Add genre filtering to frontend (with disabled states)
  - [x] Pre-select Psychobilly & Rockabilly as defaults
  - [x] Smart user interaction tracking (sessionStorage)
  - [x] Create EventFiltersGenres component
  - Completed: February 17, 2026

- [x] **Filter UX Improvements** - COMPLETED ✅
  - [x] Make all filter headlines clickable to toggle sections
  - [x] Add accessibility attributes (role, tabIndex, keyboard handlers)
  - [x] Replace blocking alert() with toast feedback
  - [x] Add country flags to event cards
  - Completed: February 17, 2026

- [x] **Code Quality & Security** - COMPLETED ✅
  - [x] Fix timezone parsing with parseDate utility
  - [x] Fix XSS vulnerability in EventMap
  - [x] Remove duplicate code (hooks, functions, CSS)
  - [x] Improve error handling (Promise.allSettled)
  - [x] Remove unused dependencies (react-leaflet)
  - [x] Prevent infinite loops in genre defaults
  - [x] Consistent USA detection logic
  - Completed: February 17, 2026

- [x] **CSS Modules Migration** - COMPLETED ✅
  - [x] Remove all .styles.ts files
  - [x] Migrate all components to .module.css
  - [x] Replace all inline styles (sx props) with CSS classes
  - [x] Replace hardcoded values with CSS variables
  - [x] Style MUI components with :global() selectors
  - [x] Remove ThemeProvider overhead
  - Completed: February 18, 2026

- [x] **Event Detail Page** - COMPLETED ✅
  - [x] Individual event page with full details
  - [x] Shareable URLs (/events/[id])
  - [x] Full event information (all fields)
  - [x] Image display with alignment
  - [x] Formatted text with line breaks (white-space: pre-line)
  - [x] Venue information display
  - [x] Multi-day date display with formatLongDate()
  - [x] Share functionality
  - [x] Breadcrumb navigation
  - [x] Comprehensive test coverage (29 tests)
  - Completed: February 18, 2026

- [x] **Backend/API Enhancements** - COMPLETED ✅
  - [x] Image field handling (legacy_image + new image field)
  - [x] Venue data included in event responses (JOIN query)
  - [x] Country/state name lookups working
  - [x] Tags and genre fields implemented
  - [x] Genre filtering with counts
  - Completed: February 15-17, 2026

- [x] **TypeScript Errors** - COMPLETED ✅
  - [x] Fixed EventDetail.test.tsx type mismatches
  - [x] Changed test mocks from arrays to comma-separated strings
  - Completed: February 18, 2026

- [x] **Authentication System** - COMPLETED ✅
  - [x] JWT integration with backend
  - [x] Login/Logout components (LoginModal)
  - [x] Session management (AuthContext)
  - [x] User menu with profile/logout
  - Completed: February 2026

- [x] **Authorization & Route Protection** - COMPLETED ✅
  - [x] Role-based authorization system (roles.ts)
  - [x] useAuthorization hook with role helpers
  - [x] Dedicated login page with redirect support
  - [x] Next.js middleware for server-side route protection
  - [x] httpOnly cookie for JWT storage
  - [x] Login/logout API routes
  - [x] Admin routes protected (requires admin role)
  - [x] User dashboard routes protected (requires authentication)
  - Completed: February 28, 2026

#### Next Frontend Tasks

- [ ] **Navigation Menu**
  - [ ] Create hamburger menu component
  - [ ] Add navigation links (Home, Events, About, Admin (if admin), Dashboard (if logged in))
  - [ ] Connect to hamburger button in TopBar
  - [ ] Mobile-first design
  - [ ] Smooth animations
  - Estimated: 2-3 hours

- [ ] **Homepage & About Page UX Improvements**
  - [ ] Show TopBar when user is logged in
  - [ ] Adjust design to match admin overview/login page patterns
  - [ ] Use consistent Section components
  - [ ] Apply design system (spacing, colors, typography)
  - [ ] Ensure responsive layout
  - Estimated: 2-3 hours

- [ ] **User Dashboard** (Phase 4)
  - [ ] Create `/dashboard` page
  - [ ] Welcome message with username
  - [ ] Role-based navigation cards (admin sees admin links)
  - [ ] Quick stats (my events, account info)
  - [ ] Create placeholder pages (profile, settings, my-events)
  - Estimated: 3 hours

## 🟢 Medium Priority (Next Sprint)

### Admin Band Management (Local-Only Features)

> **Security Note**: All admin features are gitignored and run locally only.
> Backend API changes are committed and deployed to production with admin permission checks.

- [x] **JWT Token Refresh** - COMPLETED ✅
  - [x] Activity tracking (mouse, keyboard, click, scroll)
  - [x] Auto-refresh when <15 min remain and user active
  - [x] Fixed infinite refresh loop bug
  - Completed: February 18, 2026

- [x] **Admin Overview Page** - COMPLETED ✅
  - [x] Feature card grid with 6 admin tools
  - [x] Breadcrumb navigation
  - [x] Route: `/admin/bands`
  - Completed: February 18, 2026

- [x] **Edit Bands Feature** - COMPLETED ✅
  - [x] Search bands (debounced)
  - [x] Edit band name
  - [x] Manage name variations (Chip-based UI)
  - [x] Edit genres with Autocomplete
  - [x] Click-to-toggle primary genre (★ indicator)
  - [x] Backend: UpdateBandAction with admin check
  - [x] Backend: updateBandGenres() and getBandGenres()
  - [x] BFF route: PUT `/api/admin/bands/[id]`
  - Completed: February 18, 2026
  - Genre editing added: February 22, 2026

- [x] **Orphaned Bands Feature** - COMPLETED ✅
  - [x] List bands with no events (NOT EXISTS query)
  - [x] Paginated display (50 per page)
  - [x] Show genres and variations
  - [x] Backend: ListOrphanedBandsAction
  - [x] BFF route: GET `/api/admin/bands/orphaned`
  - Completed: February 18, 2026

- [x] **Admin CSS Consistency & Code Quality** - COMPLETED ✅
  - [x] Created shared components (LoadingSpinner, ErrorMessage, Pagination, SearchInput, Section)
  - [x] Created useDebounce custom hook
  - [x] Refactored all admin components to use shared components
  - [x] Removed ~150 lines of duplicated code/CSS
  - [x] Standardized loading states, error handling, pagination
  - [x] Fixed useCallback memory leak causing increasing render times
  - [x] Consistent component patterns across all admin pages
  - Completed: February 22, 2026

- [x] **Delete Band Functionality** - COMPLETED ✅
  - [x] Add delete button to OrphanedBands page
  - [x] Confirmation dialog with band details
  - [x] Backend: DeleteBandAction with admin check
  - [x] BFF route: DELETE `/api/admin/bands/[id]`
  - [x] Transaction to cleanup related tables:
    - `event_bands`
    - `band_genres`
    - `band_details`
    - `band_admins` (if exists)
    - `social_media_links` (if exists)
    - `streaming_links` (if exists)
  - Completed: February 22, 2026

- [ ] **Split Band Functionality** (Frontend Complete ✅ - Backend Pending)
  - [x] Frontend: Split preview dialog with separator selection
  - [x] Frontend: Real-time preview of split result
  - [x] Frontend: Confirm dialog before executing
  - [x] Frontend: Support for common separators (&, and, +, /, ,)
  - [x] Frontend: Custom separator input
  - [x] Frontend: BandSplit component integrated into BandOverview
  - [ ] Backend: POST `/api/bands/split` BFF route
  - [ ] Backend: SplitBandAction with transaction
  - [ ] Backend: Create new band entries for each split part
  - [ ] Backend: Update references in multiple tables:
    - `event_bands` (assign events to all new bands)
    - `band_genres` (copy genres to all new bands)
    - `band_admins` (if exists)
    - `social_media_links` (if exists)
    - `streaming_links` (if exists)
  - [ ] Backend: Delete original band after split
  - [ ] Backend: Handle edge cases (3+ bands, special characters)
  - Frontend completed: February 23, 2026
  - Backend estimated: 1 day

- [x] **Enhanced Genre Assignment** - COMPLETED ✅
  - [x] Add/edit genres inline (via EditBands dialog)
  - [x] Remove genres from band (deselect existing)
  - [x] Filter by genre (dropdown with "All", "No genres", specific genres)
  - [x] Better pagination (page numbers, first/last buttons)
  - [x] Direct page access (jump to page with input field)
  - [x] Auto-refresh genre counts after assignment
  - [x] Genre filter works with multi-search
  - Completed: February 22, 2026

- [x] **Band Overview & Code Refactoring** - COMPLETED ✅
  - [x] Created useBandList hook for shared data loading logic
  - [x] Created unified BandOverview component with search, pagination, and filters
  - [x] Refactored BandList to use shared hook (eliminated ~100 lines of duplicate code)
  - [x] Added quick filters (All Bands / Orphaned / No Genres)
  - [x] Integrated genre dropdown filter
  - [x] Multi-term search support (semicolon-separated)
  - [x] Click band to open edit dialog
  - [x] Route: `/admin/bands/overview`
  - [x] Updated admin overview page with new card
  - Completed: February 23, 2026

- [ ] **View Events Enhancement** (Deferred until Event Admin is complete)
  - [ ] Change from band name search to exact band ID filter
  - [ ] Add date filter to show all events (not just upcoming)
  - [ ] Navigate to events page with pre-filled filters
  - [ ] Estimated: 30 minutes
  - **Note**: Makes more sense after event administration is implemented

- [ ] **Manage Genres Feature**
  - [ ] List all genres (paginated)
  - [ ] Add new genre
  - [ ] Edit genre name
  - [ ] Delete genre (with confirmation + usage check)
  - [ ] Manage subgenres
  - [ ] Estimated: 1 day

### Phase 3: Content Management

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
  - Venue selection
  - Create new venue inline
  - Bands field
  - Text editor with preview
  - Image upload integration
  - Link field with validation
  - Form validation
  - Estimated: 2-3 days

- [ ] **Event editing**
  - Pre-populated form
  - Permission checks (owner/admin only)
  - Update API integration
  - Show edit history
  - Estimated: 4-6 hours

- [ ] **Venue management**
  - List all venues
  - Add new venue form
  - Edit existing venue
  - Venue detail page
  - Search/filter venues
  - Estimated: 2-3 days

- [ ] **Admin dashboard**
  - Event approval queue
  - Approve/Reject events
  - User management
  - Venue management
  - Statistics and analytics
  - Bulk actions
  - Estimated: 3-4 days

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

## 📋 Backend Tasks (psychobilly-online-api & psychobilly-online-images)

> **Note**: These tasks are tracked separately in their respective repositories.
> Listed here for reference and coordination with frontend work.

### Data Cleanup & Migrations

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

- [ ] **Backend API documentation**
  - Document all endpoints
  - Request/Response examples
  - Error codes
  - File: `docs/API_REFERENCE.md`
  - Estimated: 1 day

- [ ] **Architecture documentation**
  - System overview diagram
  - Data flow diagrams
  - Technology stack
  - File: `docs/ARCHITECTURE.md`
  - Estimated: 4-6 hours

- [ ] **Backend integration guide**
  - Data structure reference
  - Field name mappings
  - Known quirks/gotchas
  - File: `docs/BACKEND_INTEGRATION.md`
  - Estimated: 2-3 hours

- [ ] **Deployment guide**
  - Frontend deployment (Vercel)
  - Backend deployment (HostEurope)
  - Environment variables
  - DNS configuration
  - File: `docs/DEPLOYMENT.md` (expand existing)
  - Estimated: 2-3 hours

## 🧪 Testing Tasks

- [ ] **Unit tests**
  - Component tests (React Testing Library)
  - Hook tests
  - API client tests
  - Target: 80% coverage
  - Estimated: 2-3 days

- [ ] **Integration tests**
  - API route tests
  - End-to-end flows
  - Cypress or Playwright
  - Estimated: 2-3 days

- [ ] **Manual testing checklist**
  - Browser compatibility (Chrome, Firefox, Safari, Edge)
  - Mobile responsiveness (iOS, Android)
  - Performance testing (Lighthouse)
  - Estimated: 1 day

## 🔧 DevOps Tasks

- [ ] **CI/CD Pipeline**
  - GitHub Actions for tests
  - Automated deployment
  - Preview deployments for PRs
  - Estimated: 1-2 days

- [ ] **Monitoring**
  - Error tracking (Sentry)
  - Analytics (Google Analytics / Plausible)
  - Performance monitoring (Vercel Analytics)
  - Estimated: 4-6 hours

- [ ] **Backup strategy**
  - Database backups
  - Image backups
  - Backup restoration testing
  - Estimated: 1 day

## ⚠️ Development Guidelines

### Always Verify API Field Names!

**CRITICAL**: Do not assume API field names, structures, or behaviors.

**Before implementing any API integration:**

1. ✅ Check the API README in `psychobilly-online-api` repo
2. ✅ Test the actual endpoint with curl or Postman
3. ✅ Log the response in console to see actual structure
4. ✅ Document any discoveries in `docs/BACKEND_INTEGRATION.md`

**Legacy field naming conventions:**

- Dates: `date_start`, `date_end`, `create_date`, `edit_date`
- Text: `text` not `description`
- Links: `link` (singular) not `event_link` or `ticket_link`
- IDs: `country_id`, `state_id`, `venue_id` (foreign keys)

### Database Schema Reference

All database table structures are documented in `docs/DATABASE_SCHEMA.md`.

## 📝 Notes

### Dependencies Between Tasks

- Event detail page requires venue/country lookups
- Event creation requires authentication
- Admin dashboard requires authentication
- Search requires backend endpoint (or use existing search parameter)

### Prioritization Strategy

1. ✅ Complete Top Navigation Bar (DONE)
2. 🔧 Backend/API/Database improvements (CURRENT)
3. 🎯 Event Detail Page
4. 🔐 Authentication system
5. ✏️ Content management (create/edit events)
6. 👑 Admin features
7. 🚀 Optimization and enhancements

### Time Estimates

- **Backend/Database changes**: 1-2 days
- **Event detail page**: 4-6 hours
- **Authentication**: 1-2 days
- **Content management**: 3-4 days
- **Total MVP**: ~2-3 weeks

---

**Last Updated**: February 23, 2026  
**Next Sprint**: Band Overview deployment + Split Band functionality
