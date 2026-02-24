# Fix: Reciprocal relationship directive violations

## Violation

1. **Missing delete relationship UI and tests**: The backend (`netlify/functions/individuals.ts`)
   supported reciprocal deletion of relationships, but there was no UI delete button in
   `RelationshipsSection.tsx` and no test entries in `docs/tests.md` for deleting relationships.

2. **Missing reciprocal verification in creation test**: The Playwright test for "New relationship
   entry can be created successfully" in `person-detail.spec.ts` only verified the new entry
   appeared on the current person's page, but did not verify the reciprocal entry was created
   on the related person's page.

## Directive

From `testSpec.md`: "If the app has symmetrical or reciprocal relationships (e.g., contact
relationships, mutual links between entities), creating/updating/deleting one side must
automatically update the other side. Test entries must verify both sides of the relationship
are in sync."

## Impact

- Relationship deletion was impossible from the UI despite backend support.
- Reciprocal relationship creation was untested — a regression breaking it would go undetected.

## Fix

1. **docs/tests.md**: Added two new test entries:
   - "Relationship entry can be deleted" with reciprocal deletion verification
   - "Delete relationship can be cancelled"

2. **RelationshipsSection.tsx**: Added delete button (trash icon) on each relationship entry
   and a confirmation dialog that triggers the existing backend DELETE endpoint with reciprocal
   removal.

3. **person-detail.spec.ts**:
   - Updated "New relationship entry can be created successfully" to navigate to the related
     person's page and verify the reciprocal entry exists.
   - Added "Relationship entry can be deleted" test that deletes a relationship and verifies
     the reciprocal entry is also removed from the related person's page.
   - Added "Delete relationship can be cancelled" test.
