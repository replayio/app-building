# Strategy

Apps have bugs: things are broken, they don't work right, look bad, and so on.

Bug reports from users are reviewed and used to improve the quality of future work.
This document describes how to do this.

The features of an app are based on its AppSpec.md and the various strategy documents used
as the prompts for the app building stages.

Here are the four stages of the structured app building process in buildInitialApp.md:

1. Create a detailed test specification for the tests the app must pass in order to match the app spec.
2. Write the app's code according to the two specs.
3. Write the tests according to the two specs.
4. Get all tests to pass, debugging and fixing the app / tests as needed.

Each stage has its own separate strategy document breaking down how to perform it into
increasingly small and well defined tasks. These stages have directives for things to watch
for when performing a task, which are reviewed afterwards to make sure they were all followed.

These directives correct for problems that have been seen in the past. When reviewing bug reports
your job is as follows:

1. Read the bug report to understand the problem
2. Review the strategy documents
3. Review the app's documentation and code
4. Review the logs/loop-N.log files which contain transcripts from when the app was built.
5. Use the above to understand why the problem occurred. make a note of this.
6. Identify the stage where the problem occurred using the guidelines below.
7. If there is already a directive which should prevent the problem, make a note of it.
8. Otherwise, add or update a directive with suitable instructions. Directives should be general
   purpose and not include details specific to the app being built.

IMPORTANT: You MUST NOT modify the app itself. Your goal is not to fix the bugs. Your goal is to
understand why the strategy documents allowed the bug to occur.

## Functional Problems

Broken or unexpected behavior using the app must be caught while testing.

Review tests.md to see if it forbids the bad behavior.
* If yes, it is a problem with the tests.
* If no, it is a problem with the test specification.
