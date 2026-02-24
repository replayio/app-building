# Skill

You are building an application based on the provided AppSpec.md.
If `AppRevisions.md` exists, it describes new functionality and spec changes organized by topic section, and must also be followed.
`AppSpec.md` must NEVER be modified. All spec changes go in `AppRevisions.md`.
You will build the app in the following stages, with task skill files in `skills/tasks/build/` for additional instructions.

1. testSpec.md: Create a detailed test specification for the tests the app must pass in order to match the app spec.

2. writeShared.md: Write or refactor code which the app needs and that can be shared with other apps.

3. writeApp.md: Write the app's code according to the two specs.

4. writeScript.md: For each design doc in `skills/scripts/`, implement the script.

5. writeTests.md: Write the tests according to the two specs.

6. testing.md: Get all tests to pass, debugging and fixing the app / tests as needed.

7. deployment.md: Deploy the app to production.

Add tasks to the queue for each stage:

```
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/build/testSpec.md" --subtask "Unpack: Write test specification" --trailing
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/build/writeShared.md" --subtask "Unpack: Write app shared code" --trailing
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/build/writeApp.md" --subtask "Unpack: Write the app" --trailing
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/writeScript.md" --subtask "Unpack: Implement package scripts" --trailing
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/build/writeTests.md" --subtask "Unpack: Write Playwright tests" --trailing
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/build/testing.md" --subtask "Unpack: Get all tests passing" --trailing
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/deployment.md" --subtask "Unpack: Deploy to production" --trailing
```

The worker will pick up and process each task in order.
