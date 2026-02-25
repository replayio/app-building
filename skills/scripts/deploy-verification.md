# deploy-verification

## Purpose

Verifies that a deployed app is fully operational after `npm run deploy` completes. Deployment
alone does not guarantee the app works — the database connection must be configured on Netlify
and API endpoints must be reachable.

## Post-Deploy Verification Steps

Run these steps in order after a successful `npm run deploy`:

### 1. Set DATABASE_URL on Netlify

The deploy script sets up the database and deploys the app, but does NOT automatically configure
the `DATABASE_URL` environment variable on the Netlify site. Without it, all backend functions
will return 500 errors.

Set it using the Netlify REST API (see `skills/scripts/netlify-env.md`):

```bash
curl -s -X POST "https://api.netlify.com/api/v1/accounts/${NETLIFY_ACCOUNT_SLUG}/env?site_id=${NETLIFY_SITE_ID}" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"key":"DATABASE_URL","values":[{"value":"'"$DATABASE_URL"'","context":"all"}]}]'
```

### 2. Verify API endpoints return 200

Test at least one backend endpoint to confirm the database connection works:

```bash
curl -s -o /dev/null -w "%{http_code}" https://<site-url>/.netlify/functions/<function-name>
```

If this returns 500, the `DATABASE_URL` is likely not set or is incorrect. Do not proceed to
deployment tests until API endpoints respond successfully.

### 3. Run deployment tests

Only run deployment tests after confirming API endpoints are healthy. Deployment tests that
hit broken endpoints will produce misleading failures.

## Common Failures

- **500 from API endpoints**: `DATABASE_URL` not set on Netlify. Set it per step 1.
- **"No project id found" from Netlify CLI**: Use the REST API instead of `npx netlify env:set`.
  See `skills/scripts/netlify-env.md`.
- **Deployment tests fail on empty data**: If tests expect seeded data but the production database
  is empty, seed the production database or adjust tests to handle empty states.
