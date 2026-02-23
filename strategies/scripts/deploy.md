# deploy

## Purpose

Creates and/or syncs the production Neon database and creates and/or updates the Netlify site.
This is the single command for deploying the app to production. All project information
(database URL, Netlify site ID, etc.) is persisted in `.env` so subsequent runs reuse existing
resources.

## Usage

- `package.json` entry: `"deploy": "tsx scripts/deploy.ts"`
- No command-line arguments.
- Example: `npm run deploy`

## Behavior

### Database setup (first run)

1. Check `.env` for an existing `NEON_PROJECT_ID`. If not present:
   a. Create a new Neon project via the Neon API.
   b. Write `NEON_PROJECT_ID` and `DATABASE_URL` to `.env`.

### Database schema sync (every run)

2. Call `initSchema(productionDatabaseUrl)` to create any missing tables.
3. Run migrations (`migrate-db` logic) against the production database to handle `ALTER TABLE`
   changes that `initSchema` cannot detect.

### Netlify site setup (first run)

4. Check `.env` for an existing `NETLIFY_SITE_ID`. If not present:
   a. Create a new Netlify site via `netlify sites:create`.
   b. Write `NETLIFY_SITE_ID` to `.env`.

### Build and deploy (every run)

5. Build the app (`vite build`).
6. Deploy to Netlify (`netlify deploy --prod`).
7. Write the deployed URL, `site_id`, `neon_project_id`, and `database_url` to `deployment.txt`.

## Populating `.env` for Redeployments

`.env` is gitignored and will not exist in a fresh environment. If the app has been
deployed before, you MUST populate `.env` before running the script so it reuses the
existing Netlify site and Neon database instead of creating new ones.

Read `deployment.txt` (committed to git) to get all previously stored deployment
values (`site_id`, `neon_project_id`, `database_url`). Write them to `.env`:

```
NETLIFY_SITE_ID=<site_id from deployment.txt>
NEON_PROJECT_ID=<neon_project_id from deployment.txt>
DATABASE_URL=<database_url from deployment.txt>
```

If `.env` is missing these values the script will create **new** resources, which means
a new URL and an empty database. Always check `deployment.txt` first.

## Inputs

- **Environment variables**:
  - `NEON_API_KEY` (required): For Neon project/database management.
  - `NETLIFY_AUTH_TOKEN` (required): For Netlify CLI authentication.
  - `NETLIFY_ACCOUNT_SLUG` (required): For Netlify site creation.
- **Files**:
  - `.env`: Read for existing project info (`NEON_PROJECT_ID`, `DATABASE_URL`,
    `NETLIFY_SITE_ID`). Written to on first run.
  - `deployment.txt`: Contains `site_id`, `neon_project_id`, and `database_url` from the
    last deployment (committed to git). Use this to populate `.env` when deploying in a
    fresh environment.

## Outputs

- **`.env`**: Updated with `NEON_PROJECT_ID`, `DATABASE_URL`, `NETLIFY_SITE_ID` if created.
- **`deployment.txt`**: Updated with the current deployed URL, `site_id`, `neon_project_id`,
  and `database_url`.
- **Side effects**:
  - Creates Neon project (first run only).
  - Syncs production database schema (every run).
  - Creates Netlify site (first run only).
  - Deploys built app to Netlify (every run).
- **Exit codes**:
  - 0: Deployment succeeded.
  - Non-zero: A step failed (error printed to stderr).

## Implementation Tips

- Reuse `initSchema` from `scripts/schema.ts` for schema sync.
- Reuse migration logic from `scripts/migrate-db.ts`.
- Use the Neon REST API (`https://console.neon.tech/api/v2/...`) with `NEON_API_KEY` for
  project creation.
- Use `netlify sites:create --account-slug $NETLIFY_ACCOUNT_SLUG` for site creation.
- Use `netlify deploy --prod --dir dist --functions ./netlify/functions` for deployment.
- Read/write `.env` using `fs` — parse as key=value lines, append new entries, don't
  clobber existing values.
- Production builds must use `sourcemap: true`, `minify: false`, and the React development
  bundle (see `vite.config.ts` settings) so Replay recordings show readable source.
