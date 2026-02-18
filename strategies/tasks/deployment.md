# Strategy

During this stage you will deploy the app to production and test it to make sure it works.

## Unpack Subtasks

Unpack the initial deployment task into the following subtasks:

- SupportDeploy: Add deployment support to the app.
- DoDeploy: Deploy the app to production.
- TestDeploy: Test the app as described above.

## Deployment

The app must support `npm run deploy` which creates or reuses an existing netlify site (name doesn't matter) and the Neon database you set up earlier that is backing the supabase calls. This should read NETLIFY_ACCOUNT_SLUG, NETLIFY_AUTH_TOKEN, and NEON_API_KEY from the environment.

Make sure to update all URLs etc to match the deployed resources.

Write information about the deployment to `deployment.txt`. This file must be updated
after each deployment with the current deployed URL and any other relevant details.
The deployment test reads the deployed URL from this file.

### Database Schema Sync

Before every deployment, you MUST run the `init-db.ts` script against the production
database to ensure the schema is up to date. The script uses `CREATE TABLE IF NOT EXISTS`
for all tables, so re-running it is safe and idempotent — it will create any missing
tables without affecting existing ones.

This is critical because schema changes (e.g. adding new tables like `users`) are only
picked up by the local test database automatically via `seed-db.ts`. The production
database does not run seed scripts, so new tables will be missing unless `init-db.ts`
is re-run.

Run the script with the production `DATABASE_URL`:

```
DATABASE_URL=<production-connection-string> npx tsx scripts/init-db.ts
```

If the script also creates a new Neon project (which it does on first run), skip that
step and only run the schema portion against the existing production database. You may
need to adapt the script or run the `CREATE TABLE IF NOT EXISTS` statements directly
against the production database using the neon serverless driver.

Failure to sync the schema will cause serverless functions that reference new tables to
crash with `relation "..." does not exist` errors at runtime — and these errors will NOT
be caught by the integration test suite (which uses a freshly seeded local database).

## Build Configuration

Production builds must enable source maps, disable minification, and use the React development
bundle so that Replay recordings of the deployed app show readable source code with full
component names and developer warnings. Ensure `vite.config.ts` includes:

```ts
build: {
  sourcemap: true,
  minify: false,
},
define: {
  'process.env.NODE_ENV': '"development"',
},
```

Do not change these settings. Without source maps, unminified code, and the React development
build, Replay recordings will only show mangled variable names, collapsed source lines, and
missing component display names, making runtime debugging impossible.

## Testing

After deploying, you MUST perform a functional test to verify the app actually works in production.
A deployment that serves HTTP 200 is not sufficient — the app must display real data and support updates.
The deployment test lives at `tests/deployment.spec.ts`, separate from the integration tests.
It must be excluded from regular `npm test` runs by adding it to `testIgnore` in
`playwright.config.ts`:

```ts
testIgnore: ['**/deployment.spec.ts'],
```

The deployment test has its own config at `playwright.deployment.config.ts` which uses
`@[REDACTED]io/playwright` to launch the Replay browser and auto-upload recordings.
The Replay browser requires an X display. Start Xvfb before running the test:

```
Xvfb :99 -screen 0 1280x1024x24 &>/dev/null &
DISPLAY=:99 npx playwright test --config playwright.deployment.config.ts
```

### Functional Test Requirements

The functional test must verify:
1. **Data displays**: Navigate to the main page and confirm that real data (e.g. client records) loads and renders visibly.
2. **Data can be updated**: Perform a write operation (e.g. add or edit a record) and confirm the change persists.

If either check fails, the deployment is broken and must be investigated and fixed before marking the task complete.

### Recording with Replay

All functional tests MUST be recorded using the Replay Playwright integration so that
the Replay browser is used to launch and interact with the deployed page, and failures
can be debugged from the recording.

The deployment test is a SINGLE Playwright test at `tests/deployment.spec.ts` that
runs against the deployed production URL (read from `deployment.txt`). It uses a
separate config (`playwright.deployment.config.ts`) that launches the Replay browser
via `@[REDACTED]io/playwright` and auto-uploads recordings. It does not start a dev server
or reuse the integration test config.

#### Analyzing the Recording

After the test runs and the recording is uploaded, use Replay MCP tools to analyze
the recording and verify the app works correctly. If the test fails, use the recording
to diagnose the root cause before attempting a fix.

A deployment is only complete when the Replay recording confirms that the app displays data and
supports updates. Record the Replay recording ID in the deployment notes.

Read these skills to learn how to use these:

https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-playwright/SKILL.md
https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-mcp/SKILL.md

## Tips

- Do NOT use the `[REDACTED]io record <url>` CLI to create recordings of the deployed app. The CLI
  launches the Replay browser directly, but the recording driver requires `libcrypto.so.1.1`
  (OpenSSL 1.1) loaded via `LD_LIBRARY_PATH`, and the CLI doesn't set this up. Use the Playwright
  deployment test config instead (`playwright.deployment.config.ts`), which handles the Replay
  browser setup correctly via `executablePath` and environment variables.
