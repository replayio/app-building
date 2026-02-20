# Strategy

You are building an application based on the provided AppSpec.md.
If `AppRevisions.md` exists, it describes new functionality and spec changes organized by topic section, and must also be followed.
`AppSpec.md` must NEVER be modified. All spec changes go in `AppRevisions.md`.
You will build the app in the following stages, with job strategy files in `strategies/jobs/build/` for additional instructions.

1. testSpec.md: Create a detailed test specification for the tests the app must pass in order to match the app spec.

2. writeApp.md: Write the app's code according to the two specs.

3. writeScript.md: For each design doc in `strategies/scripts/`, implement the script.

4. writeTests.md: Write the tests according to the two specs.

5. testing.md: Get all tests to pass, debugging and fixing the app / tests as needed.

6. deployment.md: Deploy the app to production.

Add job groups to the queue for each stage:

```
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/build/testSpec.md" --job "Unpack: Write test specification" --trailing
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/build/writeApp.md" --job "Unpack: Write the app" --trailing
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/writeScript.md" --job "Unpack: Implement package scripts" --trailing
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/build/writeTests.md" --job "Unpack: Write Playwright tests" --trailing
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/build/testing.md" --job "Unpack: Get all tests passing" --trailing
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/deployment.md" --job "Unpack: Deploy to production" --trailing
```

The worker will pick up and process each group in order.
