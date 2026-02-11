# Strategy

You are building an application based on the provided AppSpec.md. Follow these constraints strictly.
You will build the app in the following stages, with links to additional instructions.

1. Create a detailed test specification for the tests the app must pass in order to match the app spec.
   https://raw.githubusercontent.com/replayio/app-building/refs/heads/main/strategies/testSpec.md

2. Write the app's code according to the two specs.
   https://raw.githubusercontent.com/replayio/app-building/refs/heads/main/strategies/writeApp.md

3. Write the tests according to the two specs.
   https://raw.githubusercontent.com/replayio/app-building/refs/heads/main/strategies/writeTests.md

4. Get all tests to pass, debugging and fixing the app / tests as needed.
   https://raw.githubusercontent.com/replayio/app-building/refs/heads/main/strategies/testing.md

5. Deploy the app to production.

## Required Environment Variables

```
NETLIFY_ACCOUNT_SLUG
NETLIFY_AUTH_TOKEN
NEON_API_KEY
RECORD_REPLAY_API_KEY
```

## Tech Stack

- **Vite** for build tooling
- **TypeScript** for all source code (strict mode)
- **React 18** for UI (single-page application)
- **Redux** for client side state management
- **shadcn/ui** for components
- **Neon** for database backend (Postgres).
- **Netlify Functions** for any backend/serverless functions. Place functions in `netlify/functions/`. Use `netlify dev` for local development.

## Database

The app must support `npm run init-db` which creates a new Neon database and configures the app to connect to it. This should read NEON_API_KEY from the environment. Use this database for all testing, do not set up a local copy of anything or any proxies.

All database accesses must happen in backend Netlify functions. Netlify functions should be focused and operate on specific parts of the database corresponding to the needs of one or more specific frontend components.

## Development Process

1. Read `AppSpec.md` to understand what needs to be built.
2. Read `docs/plan.md` (if it exists) to understand current progress. If there is no plan, create the file with one task for each stage.
3. Review the codebase and git history to understand what's already implemented.
4. Pick the next task and implement it.
5. After every significant change, run typecheck and lint, fix any errors, then commit.
6. Update `docs/plan.md` to reflect progress.

## Deployment

The app must support `npm run deploy` which creates a new netlify site (name doesn't matter) and the Neon database you set up earlier that is backing the supabase calls. This should read NETLIFY_ACCOUNT_SLUG, NETLIFY_AUTH_TOKEN, and NEON_API_KEY from the environment.

Make sure to update all URLs etc to match the deployed resources. Use playwright to load the app and test it after deploying to make sure it works.

Write information about the deployment to deployment.txt

## Quality Gates

Before each commit:
- `npx tsc --noEmit` must pass with no errors
- `npx eslint .` must pass with no errors

Do not commit code that fails typecheck or lint.

## Documentation

Maintain `docs/plan.md` with:
- High-level app structure and architecture
- Feature breakdown with status (done / in progress / todo)
- Any blockers or decisions made

## Commits

- Commit after every significant change (new feature, bug fix, refactor).
- Write clear commit messages describing what changed and why.
- Never commit code that fails typecheck or lint.

## Instructions

Pick an unfinished task and start working on it.

Focus on one task at a time. Do it well rather than rushing through multiple tasks. If the task is associated with one of the stages of app development, download and read the additional instructions for that stage from the links above.

When you finish a task, mark it completed in the plan. Your work is not finished until all remaining tasks are addressed.

Describe your thoughts in detail when writing code or specs and using tools.

As you either succeed or fail to accomplish tasks, add / update files in the lessons folder that describe things that worked or didn't work, or which add more details about implementation strategy. Lessons should be organized in one file per core concept with an appropriate file name.
