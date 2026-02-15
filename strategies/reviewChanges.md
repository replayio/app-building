# Strategy

Changes you make are divided into iterations: during each iteration some significant amount
of work will be done to complete one or more tasks, but you will remain focused on those tasks
and their requirements.

Once you complete a task, working on other tasks pollutes your context and makes you less effective,
so you will exit and start fresh on the next task. Before you start that next task, the results of
the previous task are reviewed for lessons learned that can be applied to improve performance on
similar tasks in the future.

Your strategy here is to review the logs and changes made during a previous iteration, and identify
any revisions that need to be made to those changes or changes that need to be made to the
strategy used for the task.

Follow these instructions exactly.

1. Pick a file `/repo/logs/iteration-<timestamp>.log` or `/repo/logs/worker-<timestamp>.log`.
   Ignore `*-current.log` files which are still being written to.
2. Announce 'REVIEW: <logFile>'
3. Run `npm run read-log /path/to/log` from the root to get the conversation and other key details.
4. Read the code changes made between the start/end revisions in the log file:
   - `git log --oneline <startRev>..<endRev>` to see commits
   - `git diff --stat <startRev>..<endRev>` for an overview of changed files
   - `git diff <startRev>..<endRev> -- <specific-file>` for details on specific changes
5. Read the instructions file for the stage associated with the log's tasks (there should be only one).
   Stage instruction files are at `/repo/strategies/` (the repo root), NOT inside the app directory.
   See buildInitialApp.md for the stages and their instruction files.
6. Look for any problems described in the sections below.
7. If any are found, make changes to the code and/or strategies to correct them.
   You MUST update the relevant stage instruction file if you found any difficulties or directive violations.
8. Move the log file to /repo/logs/reviewed/
   NEVER move a log to reviewed/ without actually completing steps 2-6.
   Batch-moving multiple logs without reviewing each one's git diff is not acceptable.

## Revising Changes

Read all of the directives in the stage instructions, and then carefully review the changes that
were made during the iteration. If there are any places where directives were not followed,
correct those.

## Updating Strategy

Read the log for any place where you had difficulty, e.g. going down the wrong path and having
to correct, or taking a while to figure something out. Identify a suitable strategy you could have
followed to handle the situation better, and update either the directives or tips in the stage
instructions. Directives must be followed, while tips are hints that will help perform tasks more easily.

Pay particular attention to documenting ways in which you used the Replay MCP tools
to debug test failures or other problems.

If a previous iteration produced zero commits, that is a significant finding. Investigate why it
was unproductive and add a strategy tip to prevent the same pattern.

## Tips

- Do NOT try to Read the raw JSON log file — it will exceed the 256KB read limit.
  Always use `npm run read-log` commands.
- When reviewing multiple accumulated logs, review each one individually by checking its git diff.
  Do not skip reviews because "we can see from the plan what was done."
- If a review identifies directive violations, fix them BEFORE moving the log to reviewed/.
  Do not skip fixes because they seem "minor" — unfixed issues compound across iterations.
