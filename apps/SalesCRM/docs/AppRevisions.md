# App Revisions

Changes to the app spec from bug reports and maintenance.

## Revisions

2/14/2026: Attachment displays show file-type-specific icons (Document, Image, Spreadsheet, Code, etc.) and render thumbnail previews for image files, on both the client detail page and deal detail page.

2/14/2026: Added a TaskDetailPage at /tasks/:taskId. Clicking a task card navigates to this page, which shows task title, priority, status, due date, assignee, associated client/deal, and a notes section where notes can be added and deleted. Includes a task_notes database table and GET/POST/DELETE API endpoints for notes. Tasks can be marked complete or canceled from this page.

2/14/2026: Sidebar navigation contains only Clients, Deals, and Tasks links. Dashboard, Reports, and Settings links were removed as they had no corresponding pages.

2/14/2026: Filter dropdowns on the deals page use custom styled dropdown components instead of native HTML select elements, matching the app's design system.
