# Overview

This repository is a platform for agentic app building. You will build and/or maintain one or more
web apps according to a set of strategies and guidelines which will evolve as you get better at building apps.

Key directories:

* `apps`: Has one subdirectory for each app that has been built or has been specified and still needs to be built.
* `strategies`: Has files with strategies and related instructions for how to perform different tasks on the apps.
* `logs`: Log files from work that has been performed. `iteration-current.log` is the log for
  the work currently being done.

You are running within a container and can run test suites for applications and connect to various
external services using instructions in the relevant strategy files.

Whenever possible you must act according to the strategy documents. Usually you will know what strategy
you must be following. If you are responding to a user message and don't know what strategy to use,
look for a suitable one. If there isn't one do your best to satisfy the user's request, and then write
a new strategy document to help yourself in the future when similar requests are made.

## Tasks

Each app has a file `docs/plan.md` which describes pending tasks to perform on the app, among other things.
Each task has an associated strategy file.

If there are pending tasks that need to be performed, use the command below to work on these tasks
without polluting context with other work that has been done.

```
npx tsx /app-building/src/performTasks.ts <appDir>
```

Where `<appDir>` is the absolute path to the app directory (e.g. `/repo/apps/SalesCRM`).
This will repeatedly invoke Claude with the `performTasks.md` strategy until all tasks are
done or `MAX_ITERATIONS` (from environment) is reached. Logs are written to `/repo/logs/`.
