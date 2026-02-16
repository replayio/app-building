# Strategy

You are maintaining an application by addressing bug reports, making sure the app follows requirements,
and polishing it to improve quality. A single round of maintenace is done in the following stages,
with task strategy files in `strategies/tasks/maintain/` (and `strategies/tasks/` for deployment)
for additional instructions. You will continue performing additional rounds of maintenance as needed.

1. fixBugReport.md: Fix the app to resolve any open open bug reports.

2. reviewBugReport.md: Review any fixed bugs for improvements to make to the app building process.

3. checkDirectives.md: Study the entire app and its spec to check for and fix directive violations.

4. polishApp.md: Improve the app's overall quality.

5. deployment.md: Deploy the updated app to production.

Read the tasks in docs/plan.md. There should not already be pending tasks for any
round of maintenance in progress in plan.md. If there is no active round of maintenance,
start a new one by adding pending tasks for each of the above stages, using a
"<strategy-file>: Unpack<StrategyName>: Unpack subtasks" format. Also add a section at
the end of plan.md for notes about the work done during maintenance.

Then commit and exit. The worker loop will continue with `performTasks.md` on the next iteration.
