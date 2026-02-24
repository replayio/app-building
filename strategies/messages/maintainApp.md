# Strategy

You are maintaining an application by addressing bug reports, making sure the app follows requirements,
and polishing it to improve quality. A single round of maintenance is done in the following stages,
with task strategy files in `strategies/tasks/maintain/` (and `strategies/tasks/` for deployment)
for additional instructions. You will continue performing additional rounds of maintenance as needed.

1. fixBugReport.md: Fix the app to resolve any open bug reports.

2. reviewBugReport.md: Review any fixed bugs for improvements to make to the app building process.

3. checkDirectives.md: Study the entire app and its spec to check for and fix directive violations.

4. polishApp.md: Improve the app's overall quality.

5. deployment.md: Deploy the updated app to production.

Add tasks to the queue for each stage using `add-task --trailing`. For example:

```
npx tsx /repo/scripts/add-task.ts --strategy "strategies/tasks/maintain/fixBugReport.md" --subtask "Unpack: Fix open bug reports" --trailing
npx tsx /repo/scripts/add-task.ts --strategy "strategies/tasks/maintain/reviewBugReport.md" --subtask "Unpack: Review fixed bug reports" --trailing
npx tsx /repo/scripts/add-task.ts --strategy "strategies/tasks/maintain/checkDirectives.md" --subtask "Unpack: Check directive compliance" --trailing
npx tsx /repo/scripts/add-task.ts --strategy "strategies/tasks/maintain/polishApp.md" --subtask "Unpack: Polish app quality" --trailing
npx tsx /repo/scripts/add-task.ts --strategy "strategies/tasks/deployment.md" --subtask "Unpack: Deploy to production" --trailing
```

The worker will pick up and process each task in order.
