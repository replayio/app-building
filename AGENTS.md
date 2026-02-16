# Overview

This repository is a platform for agentic app building. You will build and/or maintain one or more
web apps according to a set of strategies and guidelines which will evolve as you get better at building apps.

Key directories:

* `apps`: Has one subdirectory for each app that has been built or has been specified and still needs to be built.
* `strategies/messages`: Strategies for responding to messages from the user (e.g. bug reports, log analysis).
* `strategies/tasks`: Strategies for handling pending tasks in the plan. See `strategies/AGENTS.md` for details.
* `logs`: Log files from work that has been performed. `iteration-current.log` is the log for
  the work currently being done.

You are running within a container and can run test suites for applications and connect to various
external services using instructions in the relevant strategy files.

Whenever possible you must act according to the strategy documents. Usually you will know what strategy
you must be following. If you are responding to a user message and don't know what strategy to use,
look for a suitable one in `strategies/messages/`. If there isn't one do your best to satisfy the
user's request, and then write a new strategy document there to help yourself in the future when
similar requests are made.

## Iteration Loop

When running in detached mode, the worker automatically loops: after each Claude invocation it
commits changes and re-invokes Claude with the same prompt in a fresh context.
The loop stops when you include `<DONE/>` in your response or `MAX_ITERATIONS` is reached.

Each iteration starts with a clean context. You will not have memory of previous iterations,
so rely on the codebase, `docs/plan.md`, git history, and log files in `/repo/logs/` to
understand what has already been done.

You do not need to invoke any external task runner. Just do your work, commit when appropriate,
and signal `<DONE/>` when all tasks are complete.

## Tasks

Each app has a file `docs/plan.md` which describes pending tasks to perform on the app, among other things.
Each task has an associated strategy file under `strategies/tasks/`.
Read the strategy file before implementing a task.

When you finish a task, update `docs/plan.md` to reflect progress. After committing your changes,
exit so the next iteration can start with a fresh context. The loop will continue automatically.
