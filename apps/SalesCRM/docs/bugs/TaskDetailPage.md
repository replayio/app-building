# Bug: Add Task Detail Page

## Report
Add a task detail page that has all pertinent information and can be used to mark the task completed or canceled, or add notes.

## Analysis
- No TaskDetailPage existed; clicking a task card navigated to the associated deal or client page
- No task_notes table existed for note management
- No API endpoint for fetching a single task with notes

## Fix
- Created `task_notes` table in init-db.ts
- Added GET `/tasks/:taskId` endpoint returning task + notes
- Added POST `/tasks/:taskId/notes` and DELETE `/tasks/:taskId/notes/:noteId` endpoints
- Created `TaskDetailHeader` component (title, priority badge, status, due date, assignee, client/deal links, back/complete/cancel buttons)
- Created `TaskNotesSection` component (note input, note list with delete, empty state)
- Created `TaskDetailPage` page with ConfirmDialog for complete/cancel actions
- Added `/tasks/:taskId` route to App.tsx
- Updated TasksListPage to navigate to `/tasks/:taskId` on card click
- Added 7 Playwright tests (TDP-HDR-01 through TDP-HDR-04, TDP-NTS-01 through TDP-NTS-03)
