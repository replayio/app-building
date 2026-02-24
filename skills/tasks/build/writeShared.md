# Skill

You will be writing the code for an app and need to identify and develop reusable library, component etc code that
can be reused by multiple apps.

## Unpack Subtasks

Unpack the task to write shared code by first looking in the apps/ directory and at your instructions for any
information about other apps that can share code with the app you will be building.

If there are no other apps, you are building a standalone app, do not unpack this into other tasks.

If there are other apps, use `add-task` to unpack into the following subtasks, which will either write shared code
that can be used in the app you're working on as well as other apps, or refactors code which is already present in
other apps into shared code.

1. One subtask to write/refactor shared code for app-wide logic: backend, reducers, auth, navigation.
2. One subtask for each page to write/refactor shared code for each component on that page.

## Guidelines

Read the specs for other apps to understand the shared requirements with the app you're working on.
Shared code should have identical or almost identical requirements between the different apps.
If you find a candidate for shared code, look for any implementations in existing apps and refactor
them out into shared files, making sure to remove all of the original implementation.

All shared code goes into apps/shared. Organize different kinds of shared code by high level category
with different subdirectories under apps/shared.

Do not write standalone tests for shared code.
