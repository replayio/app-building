# Strategy

You are building an application based on the provided AppSpec.md. Follow these constraints strictly.

## Required Environment Variables

```
NETLIFY_ACCOUNT_SLUG
NETLIFY_AUTH_TOKEN
NEON_API_KEY
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
2. Read `docs/plan.md` (if it exists) to understand current progress.
3. Review the codebase and git history to understand what's already implemented.
4. Pick the next task and implement it.
5. After every significant change, run typecheck and lint, fix any errors, then commit.
6. Update `docs/plan.md` to reflect progress.

## Deployment

The app must support `npm run deploy` which creates a new netlify site (name doesn't matter) and the Neon database you set up earlier that is backing the supabase calls. This should read NETLIFY_ACCOUNT_SLUG, NETLIFY_AUTH_TOKEN, and NEON_API_KEY from the environment.

Make sure to update all URLs etc to match the deployed resources. Use playwright to load the app and test it after deploying to make sure it works.

## Quality Gates

Before each commit:
- `npx tsc --noEmit` must pass with no errors
- `npx eslint .` must pass with no errors

Do not commit code that fails typecheck or lint.

## Matching the Spec

- Build the app to closely match the prompt in AppSpec.md.
- If images or screenshots were provided in the prompt, use Playwright to launch the running app, navigate to the relevant pages, and take screenshots. Compare your screenshots to the reference images and adjust styling and layout until there are no significant differences.
- Adding extra necessary features beyond the mockup may be needed for a complete, functional app (e.g. create/delete buttons, navigation, form validation).

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
- All JSX rendered on a page must be abstracted into other React components with their own files.
- Focus on one task at a time. Do it well rather than rushing through multiple tasks.
- If blocked, document the issue in `docs/plan.md` and move to the next task.

## Tests

- You will need to write a file docs/tests.md which describes the tests the app needs. Use behavior driven development to formulate these tests: describe the initial conditions of the app's state, the action the user takes, and the changes to the app that should occur afterwards.
- Test entries must all have titles.
- Test entries must be grouped by page in the app.
- Test entries must indicate the components on that page they are exercising.
- Every interactive element (buttons etc) in the component must be tested. There must be a comment in the JSX next to every interactive element with the titles of the tests that exercise it.
- The test must verify that the interactive element actually works and does what the user expects. For example, clicking a button must do something, and text added to forms must be reflected in the app state afterwards.
- If while writing tests you discover parts of the app that haven't been fully implemented, you must finish implementation of the app. The tests must verify that the app is fully implemented and behaving as expected.
- Playwright tests and app components/pages must use data-testid to identify elements on the page.

## Lessons

- As you either succeed or fail to accomplish tasks, add / update files in the lessons folder that describe things that worked or didn't work, or which add more details about implementation strategy. Lessons should be organized in one file per core concept with an appropriate file name.

## Tasks

Make sure the plan includes the following tasks:

- Building the initial app, pages, components, and any backend functionality to match the app spec.
- Take screenshots and fixing discrepancies vs the mockup images. These tasks are not complete until the app closely matches the mockups.
- Write docs/tests.md with test entries that comprehensively test the app and conform exactly to the requirements above.
- Write a playwright test for each entry in tests.md. The entry indicates the test file which covers it. Do not run the playwright tests, but make sure that the test should pass and update the app code if necessary.
- Deploy the app's initial version to a new netlify/neon site and write that info to a file deployment.txt

The tasks might be updated through other processes. If there are remaining incomplete tasks in the plan, you must focus on fixing them.

When you finish a task, mark it completed in the plan. Your work is not finished until all remaining tasks are addressed.
