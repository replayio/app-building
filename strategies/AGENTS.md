# Strategy Organization

Strategies are divided into two categories:

## `messages/` — Responding to user messages

These strategies are triggered when a user sends a message (e.g. a bug report, a request to
build or maintain an app, or a question about logs).

- **addBugReport.md**: Record a user-reported bug in `docs/bugReports.md`.
- **analyzeLogs.md**: Search through log files to find specific information.
- **buildInitialApp.md**: Build a new app from an AppSpec. Sets up the plan with build stage tasks.
- **maintainApp.md**: Run a maintenance cycle on an existing app. Sets up the plan with maintain stage tasks.
- **updateScripts.md**: Write a design doc for a new package script, then set up a plan task to implement it.

## `scripts/` — Design docs for package scripts

Design docs that define the contract for package scripts (`npm run <name>`). Each file covers
the script's purpose, usage, behavior, inputs, outputs, and implementation tips. These are
written by the `messages/updateScripts.md` strategy before the script is implemented.

Design docs are prescriptive — they define how a script should work and are created before
implementation. The implementing agent reads the design doc and follows it.

## `tasks/` — Handling pending tasks in the plan

These strategies are executed by the worker loop. The first iteration runs the user's prompt
(a message strategy), and all subsequent iterations run `performTasks.md` which processes
entries in `docs/plan.md`. They are organized into subdirectories:

### Root — Shared infrastructure

- **performTasks.md**: The main task loop, run automatically by the worker on iterations 2+.
  Reads `docs/plan.md`, picks the next pending task, reads its strategy file, and implements it.
- **reviewChanges.md**: Reviews iteration logs for lessons learned and strategy improvements.
- **deployment.md**: Deploy the app to production. Used by both build and maintain workflows.
- **writeScript.md**: Implement a package script from its design doc in `strategies/scripts/`.

### `build/` — Build stage tasks

Used when building a new app (see `messages/buildInitialApp.md` for stage ordering):

- **testSpec.md**: Write a detailed test specification from the app spec.
- **writeApp.md**: Write the app's database, backend, and frontend code.
- **writeTests.md**: Write Playwright tests matching the test specification.
- **testing.md**: Run tests and debug/fix failures using Replay.

### `maintain/` — Maintenance stage tasks

Used when maintaining an existing app (see `messages/maintainApp.md` for stage ordering):

- **fixBugReport.md**: Analyze, fix, and test open bug reports.
- **reviewBugReport.md**: Review fixed bugs for process improvements and directive updates.
- **checkDirectives.md**: Systematically check the app against all strategy directives.
- **polishApp.md**: Improve the app's overall quality.
