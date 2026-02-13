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

1. Pick a file logs/iteration-<timestamp>.log and read it.
2. Announce 'REVIEW: <logFile>'
3. Read the changes made in git based on the start / end revisions in the iteration log.
4. Read the instructions file for the stage associated with the log's tasks (there should be only one).
   See https://raw.githubusercontent.com/[REDACTED]io/app-building/refs/heads/main/strategies/buildInitialApp.md
   for the stages and their instruction links.
5. Look for any problems described in the sections below.
6. If any are found, make changes to the code and/or strategies to correct them.
7. Move the log file to logs/reviewed/iteration-<timestamp>.log

## Revising Changes

Read all of the directives in the stage instructions, and then carefully review the changes that
were made during the iteration. If there are any places where directives were not followed,
correct those.

## Updating Strategy

Read the log for any place where you had difficulty, e.g. going down the wrong path and having
to correct, or taking a while to figure something out. Identify a suitable strategy you could have
followed to handle the situation better, and update either the directives or tips in the stage
instructions.Directives must be followed, while tips are hints that will help perform tasks more easily.

Pay particular attention to documenting ways in which you used the Replay MCP tools
to debug test failures or other problems.
