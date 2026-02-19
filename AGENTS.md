# Overview

This repository is a platform for agentic app building. You will build and/or maintain one or more
web apps according to a set of strategies and guidelines which will evolve as you get better at building apps.

Key directories:

* `apps`: Has one subdirectory for each app that has been built or has been specified and still needs to be built.
* `strategies/messages`: Strategies for responding to messages from the user (e.g. bug reports, log analysis).
* `strategies/jobs`: Strategies for performing jobs. See `strategies/AGENTS.md` for details.
* `jobs`: The job queue (`jobs.json`) managed by scripts in `scripts/`.
* `logs`: Log files from work that has been performed. `worker-current.log` is the log for
  the work currently being done.

You are running within a container and can run test suites for applications and connect to various
external services using instructions in the relevant strategy files.

Whenever possible you must act according to the strategy documents. Usually you will know what strategy
you must be following. If you are responding to a user message and don't know what strategy to use,
look for a suitable one in `strategies/messages/`. If there isn't one do your best to satisfy the
user's request, and then write a new strategy document there to help yourself in the future when
similar requests are made.

## Iteration Loop

When running in detached mode, the worker automatically loops: the first iteration runs the
user's prompt, and all subsequent iterations pull the next job from `jobs/jobs.json`
via the `get-next-job` script. After each iteration the worker commits changes and re-invokes
Claude with a fresh context. The current worker iteration log is in the `worker-current.log` file.

Each iteration starts with a clean context. You will not have memory of previous iterations,
so rely on the codebase, git history, and log files in `/repo/logs/` to understand what has
already been done.

The loop exits when `get-next-job` reports no jobs remaining, or when the agent outputs `<DONE/>`.

## Job System

Work is managed through a JSON job queue at `jobs/jobs.json`. The agent NEVER reads or
writes this file directly. Instead, use these scripts:

* **`npx tsx /repo/scripts/get-next-job.ts`**: Returns the next job's strategy and description.
  Called by the worker loop to determine each iteration's prompt. Also checks for unreviewed
  logs (prioritized over queued jobs) and handles strategy switching between jobs.

* **`npx tsx /repo/scripts/add-next-job.ts --strategy "<path>" --description "<text>"`**:
  Adds a job to the FRONT of the queue (next to be processed). Since this prepends, add
  sub-jobs in REVERSE order for correct sequencing.

* **`npx tsx /repo/scripts/add-trailing-job.ts --strategy "<path>" --description "<text>"`**:
  Adds a job to the END of the queue.

Each job is an object with `{ strategy, description, timestamp }`. The strategy is a path to a
strategy file under `strategies/jobs/` that defines how to perform the work.

When a strategy needs to "unpack" into sub-jobs, use `add-next-job` (in reverse order) to insert
the sub-jobs at the front of the queue, so they run before any remaining jobs.

After completing a job, commit your changes and exit. The worker loop will start the next
iteration with the next job.

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

All database accesses must happen in backend Netlify functions. Netlify functions should be focused
and operate on specific parts of the database corresponding to the needs of one or more specific
frontend components.

## Quality Gates

Before each commit, run `npm run check` (see `strategies/scripts/check.md`). Do not commit
code that fails typecheck or lint.

## Commits

- Commit after every significant change (new feature, bug fix, refactor).
- Write clear commit messages describing what changed and why.
- Never commit code that fails typecheck or lint.
