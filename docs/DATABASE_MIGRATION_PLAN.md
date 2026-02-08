# Database Migration Plan

## Overview

The current database structure has legacy fields and redundant columns that need cleanup. We don't need backward compatibility with old data structures. For safety, we will create new tables, migrate data, then deprecate old tables after verification.

## New Requirements & Decisions

1. **Editable content requires approval**

- Any table with user-editable content (not admin-only) must include an `approved` field.
- If a field is named `active`/`actived`, rename to `approved`.

2. **Flagging**

- Keep `flags` table as the source of truth (no `flagged` boolean needed).
- Add view/materialized summary only if performance becomes a concern.

3. **Bands table (new)**

- Create a new `bands` table with only `id`, `name`, and `name_variations`.
- Additional band metadata goes into a separate table later.

4. **Countries - native name**

- Add `origin_name` to countries (e.g., Germany → Deutschland).
- Use for autocomplete and localized display.

5. **URL naming**

- Standardize on `url` (not `link`) across all tables.

6. **Multiple links**

- Add a flexible `links` structure (JSON array) for social media and multiple URLs.
- Keep a primary `url` field for simple use cases and indexing.

7. **Table prefix**

- Remove `psycho_` prefix in new tables. We’ll use no prefix (or `community_` if a prefix is required later).

8. **Migration approach**

- Do not alter existing tables. Create new tables, migrate data, update code, then drop old tables after validation.

## Priority 1: Image Field Cleanup (CRITICAL)

### Current Problem

- Events table has two image fields: `6_image` (legacy, still valid) and `19_image` (unused)
- We want to preserve legacy images and introduce a clean `image` field for new uploads

### Proposed Solution (New Schema)

We will keep legacy images and add a clean field for new ones:

- `legacy_image` = current `6_image` (existing uploads at /uploads/events/...)
- `image` = new image ID for the modern image service

### Proposed Solution - Option B (Better - Full Cleanup)

```sql
-- Rename columns to proper names (no numeric prefixes)
ALTER TABLE psycho_events
  CHANGE `0_id` `id` INT AUTO_INCREMENT,
  CHANGE `1_date_start` `date_start` DATE,
  CHANGE `2_date_end` `date_end` DATE,
  CHANGE `3_headline` `headline` VARCHAR(255),
  CHANGE `4_bands` `bands` TEXT,
  CHANGE `5_text` `description` TEXT,
  CHANGE `6_image` `legacy_image` VARCHAR(255),
  CHANGE `7_link1` `url` VARCHAR(255),
  CHANGE `8_country_id` `country_id` VARCHAR(10),
  CHANGE `9_state_id` `state_id` VARCHAR(10),
  CHANGE `10_venue_id` `venue_id` INT,
  CHANGE `11_contact_id` `contact_id` INT,
  CHANGE `12_cat_id` `category_id` INT,
  CHANGE `13_user_id` `user_id` INT,
  DROP COLUMN `14_city`,  -- Remove redundant city (use venue.city)
  CHANGE `15_edit_date` `updated_at` TIMESTAMP,
  CHANGE `16_create_date` `created_at` TIMESTAMP,
  DROP COLUMN `17_msdate`,  -- Remove
  CHANGE `18_approved` `approved` BOOLEAN,
  DROP COLUMN `19_image`,
  ADD COLUMN `image` VARCHAR(255) NULL,
  ADD COLUMN `links` JSON NULL;
```

**Estimated Time:** 4-6 hours including testing

## Priority 2: New Schema (All Tables)

### Scope

All tables in the provided dump must be migrated into a clean, consistent schema:

- audit_log
- events
- events_categories
- events_contacts
- countries
- states
- venues
- flags
- home
- images
- news
- news_categories
- news_comments
- **new** bands
- **new** event_bands (junction)

### Key Schema Rules

1. **No numeric prefixes** on columns.
2. **No `psycho_` prefix** on new tables.
3. **Standard field names**: use `url` (not `link`), `approved` (not `active`).
4. **User-editable tables include `approved`.**
5. **Remove redundant city from events** (use venue.city as source of truth).
6. **Links**: keep `url` + add `links` JSON array for multiple URLs.
7. **Images**: use `legacy_image` for old uploads and `image` for new image IDs.

### Bands Model (New)

```sql
CREATE TABLE bands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  name_variations JSON NULL
);

CREATE TABLE event_bands (
  event_id INT NOT NULL,
  band_id INT NOT NULL,
  PRIMARY KEY (event_id, band_id)
);

-- Future: band_meta (separate table for URLs, socials, bios, etc.)
```

### Countries (New Fields)

```sql
ALTER TABLE countries
  ADD COLUMN origin_name VARCHAR(255) NULL AFTER name;
```

## Priority 3: Migration Strategy (New Tables)

### Step 1: Create new tables

- Create new schema in the same database (no prefix)
- Ensure all constraints and indexes are added

### Step 2: Migrate data

- Copy data from old tables into new tables
- Normalize band names into `bands` + `event_bands`
- Populate `links` JSON arrays when multiple URLs are available

### Step 3: Verify

- Record counts match
- Spot-check images, venues, bands, countries

### Step 4: Switch code

- Update backend queries to new schema
- Update API response mappings

### Step 5: Decommission

- Rename old tables to `_legacy_*`
- Keep for 30 days, then drop

## Migration Strategy

### Step 1: Backup

```bash
# On production server
mysqldump psychobilly_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Test on Development

1. Run migrations on local database
2. Update all code references
3. Test all CRUD operations
4. Test API endpoints
5. Test frontend integration

### Step 3: Deploy to Production

1. Schedule maintenance window
2. Backup production database
3. Run migrations
4. Deploy updated code (API + Frontend)
5. Verify all functionality
6. Monitor for errors

### Step 4: Rollback Plan

- Keep database backup for 30 days
- Keep old code in git branch `pre-migration`
- Document rollback steps

## Code Impact

### Files to Update (Backend)

- `src/Domain/Event/Event.php`
- `src/Domain/Event/EventRepository.php`
- `src/Domain/Venue/Venue.php`
- `src/Domain/Venue/VenueRepository.php`
- `src/Application/Actions/Event/*`
- `src/Application/Actions/Venue/*`
- All SQL queries across the codebase

### Files to Update (Frontend)

- Type definitions may need adjustment if field names change in API response
- Minimal impact if we maintain API response structure

## Benefits

1. **Cleaner Code**: No more backticks and numeric prefixes in SQL
2. **Better Maintainability**: Standard column names are self-documenting
3. **Easier Onboarding**: New developers understand schema immediately
4. **Reduced Bugs**: Less confusion about which image field to use
5. **Better Performance**: Remove unused columns, add proper indexes

## Estimated Total Time

- Planning & Documentation: 1 hour ✅ (this document)
- Database Migration Scripts: 2-3 hours
- Code Updates (Backend): 4-6 hours
- Code Updates (Frontend): 1-2 hours
- Testing: 3-4 hours
- Deployment & Verification: 2 hours
- **Total: 13-18 hours (approx 2 days)**

## Next Steps for Tomorrow

1. **Decide on prefix strategy** (no prefix vs `community_`)
2. **Finalize new schema** (all tables)
3. **Create migration SQL scripts**
4. **Write band extraction script**
5. **Test migration on dev database**
6. **Update backend + frontend mappings**

## Notes

- No backward compatibility needed - confirmed by project owner
- Database structure likely dates back to 2008-2010 (hence the weird naming)
- Modern structure will make future development much easier
