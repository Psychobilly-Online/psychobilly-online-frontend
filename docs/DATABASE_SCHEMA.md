# Database Schema Reference

> **Source**: psychobilly-online-api/README.md  
> **Last Verified**: February 6, 2026  
> **Always check the API README for the most current information!**

## ⚠️ Critical: Numeric Column Prefixes

The database uses **unconventional naming** with numeric prefixes (e.g., `0_id`, `1_date_start`). This is **legacy** from the 2008 PHP application.

**Why this matters:**

- API may return fields with or without prefixes
- Always check actual API response
- Document your findings in BACKEND_INTEGRATION.md

## Database Overview

### Databases

1. **`db1115397-phpbb`** - phpBB forum (authentication)
2. **`db1115397-production`** - Events, venues, news

### Tables Summary

| Table                   | Database   | Records | Purpose               |
| ----------------------- | ---------- | ------- | --------------------- |
| `phpbb_users`           | phpBB      | ~8,000  | User authentication   |
| `psycho_events`         | Production | ~19,000 | Event listings        |
| `psycho_events_venues`  | Production | ~3,300  | Venue directory       |
| `psycho_events_country` | Production | ~250    | Country lookup        |
| `psycho_events_states`  | Production | ~100    | State/province lookup |
| `psycho_events_cat`     | Production | ~20     | Event categories      |
| `psycho_news`           | Production | Unknown | News articles         |

## psycho_events Table (Main Events Table)

### Full Schema

**Note**: Column names have **numeric prefixes** in the database but API may normalize them.

| DB Column        | API Field     | Type         | Null | Description                              |
| ---------------- | ------------- | ------------ | ---- | ---------------------------------------- |
| `0_id`           | `id`          | INT          | NO   | Primary key, auto-increment              |
| `1_date_start`   | `date_start`  | DATE         | NO   | Event start date (YYYY-MM-DD)            |
| `2_date_end`     | `date_end`    | DATE         | YES  | Event end date (optional, for multi-day) |
| `3_headline`     | `headline`    | VARCHAR(255) | NO   | Event title/headline                     |
| `4_bands`        | `bands`       | TEXT         | YES  | Performing bands (comma-separated)       |
| `5_text`         | `text`        | TEXT         | YES  | Event description                        |
| `6_image`        | ~~LEGACY~~    | VARCHAR(100) | YES  | ❌ OLD image field - DO NOT USE          |
| `7_link`         | `link`        | VARCHAR(255) | YES  | Event website/info link                  |
| `8_country_id`   | `country_id`  | VARCHAR(10)  | YES  | FK to countries (e.g., "102")            |
| `9_state_id`     | `state_id`    | VARCHAR(10)  | YES  | FK to states (e.g., "0" = none)          |
| `10_venue_id`    | `venue_id`    | INT          | YES  | FK to venues table                       |
| `11_contact_id`  | `contact_id`  | INT          | YES  | FK to contacts table                     |
| `12_category_id` | `category_id` | INT          | YES  | FK to categories table                   |
| `13_user_id`     | `user_id`     | INT          | NO   | Creator user (phpBB user_id)             |
| `14_city`        | `city`        | VARCHAR(100) | YES  | City name (denormalized)                 |
| `15_edit_date`   | `edit_date`   | DATETIME     | YES  | Last edit timestamp                      |
| `16_create_date` | `create_date` | DATETIME     | NO   | Creation timestamp                       |
| `17_approved`    | `approved`    | TINYINT(1)   | NO   | 0 = pending, 1 = approved                |
| `18_approved`    | `approved`    | TINYINT(1)   | NO   | Approval status (migration)              |
| `19_image`       | `image`       | VARCHAR(100) | YES  | ✅ CURRENT image field - USE THIS        |

### ⚠️ Image Field Issue

**CRITICAL**: Backend API currently returns `6_image` but should return `19_image`!

**Backend TODO**: Update `/api/v1/events` endpoint to use `19_image` field.

**Frontend Workaround**: Handle both fields until backend is fixed:

```typescript
const imageId = event.image || event['19_image'] || event['6_image'];
```

### Key Constraints

```sql
PRIMARY KEY (`0_id`)
INDEX `idx_date_start` (`1_date_start`)
INDEX `idx_approved` (`18_approved`)
INDEX `idx_user` (`13_user_id`)
FOREIGN KEY (`10_venue_id`) REFERENCES `psycho_events_venues`(`id`)
FOREIGN KEY (`13_user_id`) REFERENCES `phpbb_users`(`user_id`)
```

### Special Values

- `state_id = "0"` - No state/province
- `edit_date = "0000-00-00 00:00:00"` - Never edited (invalid MySQL date)
- `approved = 0` - Pending approval
- `approved = 1` - Approved and visible

## psycho_events_venues Table

### Schema

| Column       | Type          | Null | Description           |
| ------------ | ------------- | ---- | --------------------- |
| `id`         | INT           | NO   | Primary key           |
| `name`       | VARCHAR(200)  | NO   | Venue name            |
| `street`     | VARCHAR(200)  | YES  | Street address        |
| `zip`        | VARCHAR(20)   | YES  | Postal code           |
| `city`       | VARCHAR(100)  | YES  | City name             |
| `state`      | VARCHAR(100)  | YES  | State/province name   |
| `country`    | VARCHAR(100)  | YES  | Country name          |
| `website`    | VARCHAR(255)  | YES  | Venue website URL     |
| `latitude`   | DECIMAL(10,7) | YES  | GPS coordinate        |
| `longitude`  | DECIMAL(10,7) | YES  | GPS coordinate        |
| `created_at` | DATETIME      | YES  | Creation timestamp    |
| `updated_at` | DATETIME      | YES  | Last update timestamp |

### Notes

- Venue location data is **denormalized** (includes city, state, country)
- Events table stores `venue_id` but also duplicates `city` field
- This creates data inconsistency issues (venue city vs event city)

## psycho_events_country Table

### Schema

| Column     | Type         | Null | Description               |
| ---------- | ------------ | ---- | ------------------------- |
| `id`       | VARCHAR(10)  | NO   | Primary key (e.g., "102") |
| `name`     | VARCHAR(100) | NO   | Country name              |
| `name_en`  | VARCHAR(100) | YES  | English name              |
| `iso_code` | VARCHAR(2)   | YES  | ISO 3166-1 alpha-2 code   |

### Common Country IDs

```
"102" = Germany
"103" = United Kingdom
"104" = United States
"105" = France
(Check API for complete list)
```

## psycho_events_states Table

### Schema

| Column       | Type         | Null | Description         |
| ------------ | ------------ | ---- | ------------------- |
| `id`         | VARCHAR(10)  | NO   | Primary key         |
| `name`       | VARCHAR(100) | NO   | State/province name |
| `country_id` | VARCHAR(10)  | YES  | FK to countries     |

### Notes

- Used for US states, German federal states, etc.
- Many countries don't use states (id = "0")

## psycho_events_cat Table (Categories)

### Schema

| Column        | Type         | Null | Description          |
| ------------- | ------------ | ---- | -------------------- |
| `id`          | INT          | NO   | Primary key          |
| `name`        | VARCHAR(100) | NO   | Category name        |
| `description` | TEXT         | YES  | Category description |

### Common Categories

```
1 = Concert
2 = Festival
3 = Weekender
4 = Club Night
5 = Private Party
(Check API for complete list)
```

## psycho_events_contacts Table

### Schema

| Column    | Type         | Null | Description           |
| --------- | ------------ | ---- | --------------------- |
| `id`      | INT          | NO   | Primary key           |
| `name`    | VARCHAR(200) | NO   | Contact name          |
| `email`   | VARCHAR(100) | YES  | Contact email         |
| `phone`   | VARCHAR(50)  | YES  | Contact phone         |
| `user_id` | INT          | YES  | Associated phpBB user |

## phpbb_users Table (Authentication)

### Relevant Columns

| Column          | Type         | Description                     |
| --------------- | ------------ | ------------------------------- |
| `user_id`       | INT          | Primary key                     |
| `username`      | VARCHAR(255) | Login username                  |
| `user_email`    | VARCHAR(100) | Email address                   |
| `user_password` | VARCHAR(255) | Hashed password (phpBB format)  |
| `group_id`      | INT          | Primary user group              |
| `user_type`     | TINYINT      | User type (0=normal, 3=founder) |

### User Groups

| group_id | Name              | Permissions    |
| -------- | ----------------- | -------------- |
| 1        | Guests            | Read-only      |
| 2        | Registered        | Create events  |
| 4        | Global Moderators | Approve events |
| 5        | Administrators    | Full access    |

## psycho_news Table

### Schema (TBD - Not Yet Documented)

| Column        | Type         | Description           |
| ------------- | ------------ | --------------------- |
| `id`          | INT          | Primary key           |
| `headline`    | VARCHAR(255) | News headline         |
| `text`        | TEXT         | News content          |
| `user_id`     | INT          | Author user_id        |
| `category_id` | INT          | FK to news categories |
| `create_date` | DATETIME     | Publication date      |
| `approved`    | TINYINT(1)   | Approval status       |

## Data Relationships

### Event → Venue

```sql
SELECT e.*, v.name as venue_name
FROM psycho_events e
LEFT JOIN psycho_events_venues v ON e.10_venue_id = v.id
```

### Event → Country

```sql
SELECT e.*, c.name as country_name
FROM psycho_events e
LEFT JOIN psycho_events_country c ON e.8_country_id = c.id
```

### Event → User

```sql
SELECT e.*, u.username
FROM psycho_events e
LEFT JOIN phpbb_users u ON e.13_user_id = u.user_id
```

### Event → Category

```sql
SELECT e.*, cat.name as category_name
FROM psycho_events e
LEFT JOIN psycho_events_cat cat ON e.12_category_id = cat.id
```

## Data Quality Issues

### Known Problems

1. **Duplicate Cities**: Event `city` field vs Venue `city` - can be inconsistent
2. **Invalid Dates**: `0000-00-00` dates in edit_date field
3. **Empty Strings**: Many optional fields have `""` instead of `NULL`
4. **Legacy Image Field**: `6_image` still exists but is obsolete
5. **Numeric Prefixes**: Column names with numbers complicate queries
6. **State ID "0"**: Used instead of NULL for "no state"

### Validation Rules

**Before inserting events:**

- `date_start` is required and must be valid date
- `headline` is required and max 255 chars
- `venue_id` must exist in venues table (or NULL)
- `country_id` should exist in countries table (or NULL)
- `user_id` must be valid phpBB user
- `approved` defaults to 0 (pending) unless user is admin/mod

## Database Queries Examples

### Get All Approved Events

```sql
SELECT * FROM psycho_events
WHERE 18_approved = 1
ORDER BY 1_date_start DESC
LIMIT 10;
```

### Get Events with Venue Names

```sql
SELECT
  e.0_id as id,
  e.1_date_start as date_start,
  e.3_headline as headline,
  e.14_city as city,
  v.name as venue_name
FROM psycho_events e
LEFT JOIN psycho_events_venues v ON e.10_venue_id = v.id
WHERE e.18_approved = 1
ORDER BY e.1_date_start DESC;
```

### Get Future Events Only

```sql
SELECT * FROM psycho_events
WHERE 18_approved = 1
  AND 1_date_start >= CURDATE()
ORDER BY 1_date_start ASC;
```

### Count Events by Country

```sql
SELECT
  c.name as country,
  COUNT(*) as event_count
FROM psycho_events e
LEFT JOIN psycho_events_country c ON e.8_country_id = c.id
WHERE e.18_approved = 1
GROUP BY c.name
ORDER BY event_count DESC;
```

## Performance Considerations

### Recommended Indexes

```sql
-- Events table
CREATE INDEX idx_date_start ON psycho_events(1_date_start);
CREATE INDEX idx_approved ON psycho_events(18_approved);
CREATE INDEX idx_country ON psycho_events(8_country_id);
CREATE INDEX idx_venue ON psycho_events(10_venue_id);
CREATE INDEX idx_user ON psycho_events(13_user_id);
CREATE INDEX idx_date_approved ON psycho_events(1_date_start, 18_approved);

-- Venues table
CREATE INDEX idx_city ON psycho_events_venues(city);
CREATE INDEX idx_country ON psycho_events_venues(country);
```

### Query Optimization Tips

1. Always filter by `18_approved = 1` first (most selective)
2. Use date range queries with BETWEEN for better index usage
3. Avoid LIKE queries on large text fields (use full-text search)
4. Join with venue table only when venue info is needed
5. Cache country/state lookups in frontend (rarely change)

## Migration Notes

### From Old Schema to New

If migrating from the old structure:

1. Image field: `6_image` → `19_image`
2. Approval field: `17_approved` → `18_approved`
3. Add indexes for performance
4. Clean up `0000-00-00` dates
5. Convert empty strings to NULL where appropriate

## Frontend Integration Tips

### Building Forms

Use this schema to know:

- Required fields: `headline`, `date_start`, `user_id`
- Optional fields: Everything else
- Max lengths: Check VARCHAR sizes
- Foreign keys: Need dropdown selectors for venue_id, country_id, category_id

### Displaying Data

- **Always check for nulls** before displaying
- **Validate dates** before parsing (watch for `0000-00-00`)
- **Lookup foreign keys** (venue_id → venue_name, country_id → country_name)
- **Handle empty strings** (`""` should be treated as null)
- **Use correct image field** (`19_image` not `6_image`)

## References

- **API Documentation**: `d:/webdev/psychobilly-online-api/README.md`
- **Backend Integration**: `docs/BACKEND_INTEGRATION.md`
- **API Repo**: https://github.com/christianmautz/psychobilly-online-api

---

**⚠️ IMPORTANT**: This is a snapshot from February 6, 2026. Always verify against the actual API README and test endpoints before making assumptions!

**Last Updated**: February 6, 2026  
**Next Review**: When schema changes are made
