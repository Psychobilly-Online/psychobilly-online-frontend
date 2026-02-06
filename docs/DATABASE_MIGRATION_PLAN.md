# Database Migration Plan

## Overview
The current database structure has legacy fields and redundant columns that need cleanup. We don't need backward compatibility with old data structures.

## Priority 1: Image Field Cleanup (CRITICAL)

### Current Problem
- Events table has two image fields: `6_image` (legacy, contains dead references) and `19_image` (current, correct references)
- API currently uses `19_image` but the dual fields cause confusion
- Frontend image loading fails when wrong field is used

### Proposed Solution - Option A (Simple)
```sql
-- Step 1: Clear dead references from 6_image
UPDATE psycho_events SET `6_image` = '';

-- Step 2: Copy all valid images from 19_image to 6_image
UPDATE psycho_events SET `6_image` = `19_image` WHERE `19_image` != '';

-- Step 3: Drop the 19_image column
ALTER TABLE psycho_events DROP COLUMN `19_image`;

-- Step 4: Update code to use 6_image going forward
```

**Code Changes:**
- Update `EventRepository.php` to use `6_image`
- Remove all references to `19_image`

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
  DROP COLUMN `6_image`,  -- Remove legacy image field
  CHANGE `7_link1` `link` VARCHAR(255),
  CHANGE `8_country_id` `country_id` VARCHAR(10),
  CHANGE `9_state_id` `state_id` VARCHAR(10),
  CHANGE `10_venue_id` `venue_id` INT,
  CHANGE `11_contact_id` `contact_id` INT,
  CHANGE `12_cat_id` `category_id` INT,
  CHANGE `13_user_id` `user_id` INT,
  DROP COLUMN `14_city`,  -- Remove redundant city (use venue.city)
  CHANGE `15_edit_date` `updated_at` TIMESTAMP,
  CHANGE `16_create_date` `created_at` TIMESTAMP,
  DROP COLUMN `17_msdate`,  -- Remove if unused
  CHANGE `18_approved` `approved` BOOLEAN,
  CHANGE `19_image` `image` VARCHAR(255);
```

**Estimated Time:** 4-6 hours including testing

## Priority 2: Venue Table Cleanup

### Current Structure Issues
- Numeric prefixed columns (e.g., `1_venue`, `2_country_id`)
- Redundant fields that may not be used

### Proposed Migration
```sql
ALTER TABLE psycho_events_venues
  CHANGE `0_id` `id` INT AUTO_INCREMENT,
  CHANGE `1_venue` `name` VARCHAR(255),
  CHANGE `2_country_id` `country_id` VARCHAR(10),
  CHANGE `3_state_id` `state_id` VARCHAR(10),
  CHANGE `4_city` `city` VARCHAR(100),
  CHANGE `5_zip` `zip` VARCHAR(20),
  CHANGE `6_address1` `street` VARCHAR(255),
  DROP COLUMN `7_address2`,  -- If unused
  CHANGE `8_lat` `latitude` DECIMAL(10,8),
  CHANGE `9_long` `longitude` DECIMAL(11,8),
  -- Continue for remaining columns...
```

**Estimated Time:** 2-3 hours

## Priority 3: Other Tables

### Countries, States, Categories
- Similar cleanup: remove numeric prefixes
- Standardize column names
- Add proper indexes

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

1. **Review this plan** - Decide on Option A (quick fix) vs Option B (full cleanup)
2. **Create migration SQL scripts**
3. **Test on development database**
4. **Update code incrementally**
5. **Schedule production deployment**

## Notes
- No backward compatibility needed - confirmed by project owner
- Database structure likely dates back to 2008-2010 (hence the weird naming)
- Modern structure will make future development much easier
