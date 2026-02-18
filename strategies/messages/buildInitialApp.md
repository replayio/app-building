# Strategy

You are building an application based on the provided AppSpec.md.
If `AppRevisions.md` exists, it contains subsequent changes to the spec from bug reports and must also be followed.
`AppSpec.md` must NEVER be modified. All spec changes go in `AppRevisions.md`.
You will build the app in the following stages, with task strategy files in `strategies/tasks/build/` for additional instructions.

1. testSpec.md: Create a detailed test specification for the tests the app must pass in order to match the app spec.

2. writeApp.md: Write the app's code according to the two specs.

3. writeTests.md: Write the tests according to the two specs.

4. testing.md: Get all tests to pass, debugging and fixing the app / tests as needed.

5. deployment.md: Deploy the app to production.

Create the docs/plan.md file with one "<strategy-file>: Unpack<StrategyName>: Unpack subtasks" task for each stage.

Then commit and exit. The worker loop will continue with `performTasks.md` on the next iteration.
