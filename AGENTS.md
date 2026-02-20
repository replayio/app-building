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

## Worker Execution

Each worker invocation handles exactly one job group. The worker reads the first group
from `jobs/jobs.json`, passes all jobs in the group to Claude as a single prompt, and
checks for a `<DONE>` signal in the output.

- If `<DONE>` is signaled: the group is dequeued and the worker exits successfully.
- If `<DONE>` is NOT signaled: the group remains in the queue for retry on the next
  worker invocation.

Each invocation starts with a clean context. You will not have memory of previous
invocations, so rely on the codebase, git history, and log files in `/repo/logs/` to
understand what has already been done.

When you have completed ALL jobs in your group, output `<DONE>` to signal completion.

## Job System

Work is managed through a JSON job queue at `jobs/jobs.json`. The file contains an object
with a `groups` array. Each group has a `strategy`, an array of `jobs` (description strings),
and a `timestamp`:

```json
{
  "groups": [
    {
      "strategy": "strategies/jobs/maintain/checkDirectives.md",
      "jobs": [
        "CheckTestSpecAuth: Check testSpec.md directive violations in Authentication",
        "CheckComponentsAuth: Check writeApp.md directive violations in Authentication",
        "CheckTestsAuth: Check writeTests.md directive violations in Authentication"
      ],
      "timestamp": "2026-02-20T00:00:00.000Z"
    }
  ]
}
```

The agent NEVER reads or writes `jobs.json` directly. Instead, use:

* **`npx tsx /repo/scripts/add-group.ts --strategy "<path>" --job "desc1" --job "desc2"`**:
  Adds a job group to the FRONT of the queue (next to be processed). Each `--job` flag
  adds one job to the group. Jobs execute in the order listed.
  Add `--trailing` to append to the END of the queue instead.

All jobs in a group share the same strategy. Group related jobs together — for example,
all checks for a single page go in one group. When a strategy needs to "unpack" into
sub-groups, use `add-group` to insert them at the front of the queue.

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
