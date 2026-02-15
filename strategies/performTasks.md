# Strategy

This strategy document describes the process and requirements for app development that must always be followed.

ULTRA IMPORTANT: Follow these directions exactly.

1. Look for files in `/repo/logs/` named `iteration-<timestamp>.log` or `worker-<timestamp>.log` describing
   recent changes made. While there are any (ignoring `*-current.log` files which are still being written to),
   follow instructions from `reviewChanges.md` to process them.
2. Read `docs/plan.md` to understand current progress. If this file is missing or has no pending tasks, signal <DONE/> and exit.
3. Pick the next task and announce `IMPLEMENT: <TaskName>`.
4. Read the strategy file for the task (if you haven't already) and implement the task.
5. After every significant change or when the task requires it, run typecheck and lint, fix any errors, then commit.
6. Update `docs/plan.md` to reflect progress.
7. If any changes were committed, you ABSOLUTELY MUST IMMEDIATELY EXIT. You will restart afterwards with a fresh context.

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
- Pending and completed tasks. All tasks are associated with a strategy file for how to implement them,
and a name for referring to them. Task entries must be of the form "StrategyFile: TaskName: Description"

## Commits

- Commit after every significant change (new feature, bug fix, refactor).
- Write clear commit messages describing what changed and why.
- Never commit code that fails typecheck or lint.

## Instructions

Pick an unfinished task and start working on it.

Focus on one task at a time. Do it well rather than rushing through multiple tasks. Make sure to read the strategy file for the task before implementing it.

When you finish a task, mark it completed in the plan. Your work is not finished until all remaining tasks are addressed.

Describe your thoughts in detail when writing code or specs and using tools.
