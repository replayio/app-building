# Strategy

You are building an application based on the provided AppSpec.md.
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
   https://raw.githubusercontent.com/replayio/app-building/refs/heads/main/strategies/deployment.md

## Development Process

ULTRA IMPORTANT: Follow these directions exactly.

1. Read `docs/plan.md` (if it exists) to understand current progress. If there is no plan, create the file with one "Unpack Subtasks" task for each stage.
2. Pick the next task and announce `IMPLEMENT: <TaskName>`.
3. Read the instructions for the associated stage (if you haven't already) and implement the task.
4. After every significant change or when the task requires it, run typecheck and lint, fix any errors, then commit.
5. Update `docs/plan.md` to reflect progress.
6. If any changes were committed, you ABSOLUTELY MUST IMMEDIATELY EXIT. You will restart afterwards with a fresh context.

## Required Environment Variables

```
NETLIFY_ACCOUNT_SLUG
NETLIFY_AUTH_TOKEN
NEON_API_KEY
UPLOADTHING_TOKEN
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
- **File Storage** use UploadThing with the provided token for any file storage.

## Database

The app must support `npm run init-db` which creates a new Neon database and configures the app to connect to it. This should read NEON_API_KEY from the environment. Use this database for all testing, do not set up a local copy of anything or any proxies.

All database accesses must happen in backend Netlify functions. Netlify functions should be focused and operate on specific parts of the database corresponding to the needs of one or more specific frontend components.

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
- Pending and completed tasks. All tasks must be of the form "TaskName: Description"

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
