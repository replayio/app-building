# Strategy

You are building an application based on the provided AppSpec.md. Follow these constraints strictly.

## Tech Stack

- **Vite** for build tooling
- **TypeScript** for all source code (strict mode)
- **React 18** for UI (single-page application)
- **shadcn/ui** for components
- **Supabase** for backend (Postgres + PostgREST). Use the Supabase CLI for local development (`supabase init`, `supabase start`). Use `@supabase/supabase-js` for all database access. Define schema via SQL migrations (`supabase migration new`).
- **Netlify Functions** for any backend/serverless functions. Place functions in `netlify/functions/`. Use `netlify dev` for local development.

## Development Process

1. Read `AppSpec.md` to understand what needs to be built.
2. Read `docs/plan.md` (if it exists) to understand current progress.
3. Review the codebase and git history to understand what's already implemented.
4. Pick the next task and implement it.
5. After every significant change, run typecheck and lint, fix any errors, then commit.
6. Update `docs/plan.md` to reflect progress.

## Quality Gates

Before each commit:
- `npx tsc --noEmit` must pass with no errors
- `npx eslint .` must pass with no errors

Do not commit code that fails typecheck or lint.

## Matching the Spec

- Build the app to closely match the prompt in AppSpec.md.
- If images or screenshots were provided in the prompt, use Playwright to launch the running app, navigate to the relevant pages, and take screenshots. Compare your screenshots to the reference images and adjust styling and layout until they match closely.
- Do not write tests. Playwright is only for taking screenshots to compare against the spec.

## Documentation

Maintain `docs/plan.md` with:
- High-level app structure and architecture
- Feature breakdown with status (done / in progress / todo)
- Any blockers or decisions made

## Commits

- Commit after every significant change (new feature, bug fix, refactor).
- Write clear commit messages describing what changed and why.
- Never commit code that fails typecheck or lint.

## Guidelines

- Follow existing code style and conventions in the repo.
- Write clean, working code. No TODOs, placeholder implementations, or mock data. All features must be real and fully functional end-to-end, backed by the database.
- Focus on one task at a time. Do it well rather than rushing through multiple tasks.
- If blocked, document the issue in `docs/plan.md` and move to the next task.

## Completion

When all tasks in the plan are complete, include `<DONE/>` in your response.
If more work remains, describe what was accomplished and what still needs to be done.
