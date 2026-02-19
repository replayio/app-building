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

Add jobs to the queue for each stage using `add-trailing-job`. For example:

```
npx tsx /repo/scripts/add-trailing-job.ts --strategy "strategies/jobs/maintain/fixBugReport.md" --description "Unpack: Fix open bug reports"
npx tsx /repo/scripts/add-trailing-job.ts --strategy "strategies/jobs/maintain/reviewBugReport.md" --description "Unpack: Review fixed bug reports"
npx tsx /repo/scripts/add-trailing-job.ts --strategy "strategies/jobs/maintain/checkDirectives.md" --description "Unpack: Check directive compliance"
npx tsx /repo/scripts/add-trailing-job.ts --strategy "strategies/jobs/maintain/polishApp.md" --description "Unpack: Polish app quality"
npx tsx /repo/scripts/add-trailing-job.ts --strategy "strategies/jobs/deployment.md" --description "Unpack: Deploy to production"
```

Then commit and exit. The worker loop will continue with the first job on the next iteration.
