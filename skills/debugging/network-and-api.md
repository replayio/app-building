# Debugging Network and API Issues with Replay

When tests fail due to wrong data, missing records, or API errors, Replay lets you inspect
the exact network requests and responses that occurred during the test run.

## Tool Sequence

1. **`NetworkRequest`** — List all network requests or filter by URL pattern. Check:
   - Did the expected API call happen?
   - What status code was returned?
   - What was the response body?
   - Were there unexpected duplicate requests?

2. **`ConsoleMessages`** — Check for logged errors from failed fetch calls.

3. **`Logpoint`** — Place logpoints on API handler code (Netlify functions) or frontend
   fetch calls to inspect request/response data at runtime. Useful for seeing:
   - What parameters were sent to the API
   - What the database query returned
   - How the response was transformed before reaching the UI

4. **`SearchSources`** — Check hit counts on API handler lines. If a handler was called
   0 times, the request never reached it (routing issue). If called more times than expected,
   something is triggering duplicate requests.

5. **`ReadSource`** — Read the actual source code of API handlers to verify the logic.

## Data-Flow Tracing with Logpoint + SearchSources

When the UI renders but displays wrong values (wrong names, incorrect counts, stale data),
use this sequence to trace data from API response through state management to component props:

1. **`SearchSources`** — Search for the API handler or fetch call. Check hit counts to
   confirm the code executed.
2. **`Logpoint`** — Place logpoints on the API response handler to see the exact data
   returned. Then place logpoints on state update dispatches and component render functions
   to trace how the data flowed through the app.
3. **`NetworkRequest`** — Verify the raw API response matches what the logpoints showed.
   Discrepancies indicate a transformation bug between fetch and state update.

This is especially useful for seed data mismatches where tests expect specific values
(e.g., assignee names) that don't exist in the database.

*Example*: `worker-…04-27-52.log` — "Action menu Edit opens task edit dialog" failed because
tests expected fictional assignee names. SearchSources → Logpoint → NetworkRequest traced
the mismatch from API response through to component rendering.

## Common Root Causes (from observed failures)

### Missing database columns (schema migration)
`CREATE TABLE IF NOT EXISTS` doesn't modify existing tables. When new columns are added to
the schema definition, existing ephemeral branches don't get them.

**Diagnosis with Replay**: NetworkRequest shows API returning 500. ConsoleMessages or test
output shows `NeonDbError: column "X" does not exist`.

**Fix**: Add `ALTER TABLE ADD COLUMN IF NOT EXISTS` migration statements.

*Example*: `worker-2026-02-21T04-05-00-483Z.log` — "column owner_id does not exist". Fixed
by adding a `runMigrations` function with ALTER TABLE statements.

### Missing environment variables on deployment
Netlify functions return errors because DATABASE_URL or other env vars aren't configured
on the Netlify site.

**Diagnosis with Replay**: NetworkRequest shows function endpoints returning 500 or error
JSON. ConsoleMessages shows connection/auth errors.

**Fix**: Set env vars via `netlify env:set` or the Netlify dashboard.

*Example*: `worker-2026-02-21T03-42-03-835Z.log` — Deployment test failed because Netlify
functions lacked DATABASE_URL.

### Database authentication errors
A stale or rotated database password causes all API calls to fail with authentication errors.

**Diagnosis with Replay**: NetworkRequest shows all data-fetching endpoints returning errors.

**Fix**: Update the database connection string with the current password.

### Import dialog closing before results display
A component calls `onImported()` (which closes a dialog) before the import results are
available to display. The dialog unmounts, losing the results.

**Diagnosis with Replay**: NetworkRequest shows the import API call succeeding. SearchSources
shows the results rendering code has 0 hits (component unmounted before it could render).

**Fix**: Delay calling `onImported()` until after results are displayed, or keep the dialog
open until the user dismisses it.

*Example*: `worker-2026-02-21T09-35-37-625Z.log` — Import dialog test. Replay showed the
API succeeded but `onImported()` closed the dialog before results rendered.

### Database CHECK constraint violation
A form sends a value that violates a database CHECK constraint (e.g., status `'active'` when
the column only allows `'open'`, `'won'`, `'lost'`). The API returns 500 but the error
message may not clearly indicate which value is invalid.

**Diagnosis with Replay**: NetworkRequest shows the POST/PUT returning 500. Logpoint on the
handler reveals the exact constraint error (e.g., `new row violates check constraint`).
ReadSource on the handler confirms which values are sent.

**Fix**: Update the form/component to send only values that match the database enum.

*Example*: `worker-2026-02-21T17-31-25-892Z.log` — CreateDealModal sent `'on_track'` as
status but DB only accepted `'open'`/`'won'`/`'lost'`. 10 Replay tools used to trace.

### Stale dev server with deleted Neon branch
When `reuseExistingServer` in Playwright config reuses a dev server whose `DATABASE_URL`
points to a deleted ephemeral Neon branch, all API calls fail with auth or connection errors.

**Diagnosis with Replay**: NetworkRequest shows no API calls or all returning errors.
LocalStorage + GetStack traces the auth token lifecycle to find where it breaks. The
recording shows the frontend working but all data requests failing.

**Fix**: Kill the stale dev server and let Playwright start a fresh one with the correct
`DATABASE_URL`. Set `reuseExistingServer: false` or add cleanup logic.

*Example*: `worker-2026-02-18T19-13-46-356Z.log` — 8 Replay tools traced from "no API
calls" → "auth token removed" → "JWT ok but DB query fails on deleted branch".
