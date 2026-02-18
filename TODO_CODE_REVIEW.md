# Code Review Follow-ups - Next Session

## TODO Items from PR Review

### High Priority

1. **JWT Token Validation on Load** (AuthContext.tsx lines 37-47)
   - **Issue**: Stored token is never validated for expiration or integrity after loading from localStorage
   - **Action Required**:
     - Add token expiration check when restoring from localStorage
     - Implement backend endpoint `/auth/validate-token` to verify token validity
     - Clear invalid/expired tokens automatically
   - **Files**: `src/contexts/AuthContext.tsx`, backend API

2. **Avatar URL Validation** (user-utils.ts)
   - **Issue**: Avatar URL constructed by direct concatenation without validation
   - **Action Required**:
     - Add basic format validation for avatar parameter
     - Consider URL encoding for special characters
     - Add error handling for malformed avatar values
   - **Files**: `src/lib/user-utils.ts`

### Medium Priority

3. **Test Coverage for user-utils.ts**
   - **Issue**: New utility file lacks test coverage
   - **Action Required**:
     - Create `src/lib/__tests__/user-utils.test.ts`
     - Test edge cases: null, undefined, empty string, special characters
     - Follow pattern from `date-utils.test.ts`
   - **Files**: `src/lib/__tests__/user-utils.test.ts` (new file)

### Completed ✅

- ✅ Fixed window.open security issue (added noopener,noreferrer)
- ✅ Added avatar image error handling with fallback to default icon
- ✅ Added JSON parsing error handling in AuthContext
- ✅ Added API response validation for user data structure
- ✅ Removed inline sx styles (created .styles.ts files for all components)
- ✅ Fixed forgot password link to use phpBB URL
- ✅ Refactored UserMenu to use MUI Menu component with full keyboard accessibility
- ✅ Added proper ARIA attributes to UserMenu (aria-haspopup, aria-expanded)
- ✅ User data sanitization with decodeHtmlEntities for username/email

## Notes

- All quick fixes have been implemented
- Inline styles removed from all components (UserMenu, LoginModal, EventDetail)
- MUI Menu component provides automatic:
  - Keyboard navigation (arrow keys, Enter, Escape)
  - Focus management
  - ARIA attributes
  - Click-outside handling

## Next Steps

When resuming work:

1. Start with JWT token validation (backend + frontend)
2. Add avatar URL validation
3. Write tests for user-utils.ts
4. Consider implementing notification popout (TODO in TopBar)
