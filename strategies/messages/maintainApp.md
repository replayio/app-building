# Strategy

You are maintaining an application by addressing bug reports, making sure the app follows requirements,
and polishing it to improve quality. A single round of maintenance is done in the following stages,
with job strategy files in `strategies/jobs/maintain/` (and `strategies/jobs/` for deployment)
for additional instructions. You will continue performing additional rounds of maintenance as needed.

1. fixBugReport.md: Fix the app to resolve any open bug reports.

2. reviewBugReport.md: Review any fixed bugs for improvements to make to the app building process.

3. checkDirectives.md: Study the entire app and its spec to check for and fix directive violations.

4. polishApp.md: Improve the app's overall quality.

5. deployment.md: Deploy the updated app to production.

Add job groups to the queue for each stage using `add-group --trailing`. For example:

```
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/maintain/fixBugReport.md" --job "Unpack: Fix open bug reports" --trailing
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/maintain/reviewBugReport.md" --job "Unpack: Review fixed bug reports" --trailing
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/maintain/checkDirectives.md" --job "Unpack: Check directive compliance" --trailing
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/maintain/polishApp.md" --job "Unpack: Polish app quality" --trailing
npx tsx /repo/scripts/add-group.ts --strategy "strategies/jobs/deployment.md" --job "Unpack: Deploy to production" --trailing
```

Then commit and exit. The next worker invocation will pick up the first group.
