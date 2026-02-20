# Strategy Organization

Strategies are divided into two categories:

## `messages/` — Responding to user messages

These strategies are triggered when a user sends a message (e.g. a bug report, a request to
build or maintain an app, or a question about logs). They add job groups to the queue using the
`add-trailing-group` script, then commit and exit so the next worker invocation picks up the group.

- **addBugReport.md**: Record a user-reported bug in `docs/bugReports.md`.
- **analyzeLogs.md**: Search through log files to find specific information.
- **buildInitialApp.md**: Build a new app from an AppSpec. Adds build stage jobs to the queue.
- **maintainApp.md**: Run a maintenance cycle on an existing app. Adds maintain stage jobs to the queue.
- **updateScripts.md**: Write a design doc for a new package script, then add a job to implement it.

## `scripts/` — Design docs for package scripts

Design docs that define the contract for package scripts (`npm run <name>`). Each file covers
the script's purpose, usage, behavior, inputs, outputs, and implementation tips. These are
written by the `messages/updateScripts.md` strategy before the script is implemented.

Design docs are prescriptive — they define how a script should work and are created before
implementation. The implementing agent reads the design doc and follows it.

## `jobs/` — Job strategies

These strategies are referenced by job groups in the queue. Each worker invocation reads the
next group from `jobs.json` and runs all jobs in the group. Strategies that need to "unpack"
into sub-groups use `add-next-group` to insert them at the front of the queue.

### Root — Shared infrastructure

- **reviewChanges.md**: Reviews iteration logs for lessons learned and strategy improvements.
  Automatically prioritized by the worker when unreviewed logs exist.
- **deployment.md**: Deploy the app to production. Used by both build and maintain workflows.
- **writeScript.md**: Implement a package script from its design doc in `strategies/scripts/`.

### `build/` — Build stage jobs

Used when building a new app (see `messages/buildInitialApp.md` for stage ordering):

- **testSpec.md**: Write a detailed test specification from the app spec.
- **writeApp.md**: Write the app's database, backend, and frontend code.
- **writeTests.md**: Write Playwright tests matching the test specification.
- **testing.md**: Run tests and debug/fix failures using Replay.

### `maintain/` — Maintenance stage jobs

Used when maintaining an existing app (see `messages/maintainApp.md` for stage ordering):

- **fixBugReport.md**: Analyze, fix, and test open bug reports.
- **reviewBugReport.md**: Review fixed bugs for process improvements and directive updates.
- **checkDirectives.md**: Systematically check the app against all strategy directives.
- **polishApp.md**: Improve the app's overall quality.
