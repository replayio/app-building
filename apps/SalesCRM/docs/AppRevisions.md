# App Revisions

Changes to the app spec from bug reports and maintenance.

## Revisions

2/14/2026: Attachment displays show file-type-specific icons (Document, Image, Spreadsheet, Code, etc.) and render thumbnail previews for image files, on both the client detail page and deal detail page.

2/14/2026: Added a TaskDetailPage at /tasks/:taskId. Clicking a task card navigates to this page, which shows task title, priority, status, due date, assignee, associated client/deal, and a notes section where notes can be added and deleted. Includes a task_notes database table and GET/POST/DELETE API endpoints for notes. Tasks can be marked complete or canceled from this page.

2/14/2026: Sidebar navigation contains only Clients, Deals, and Tasks links. Dashboard, Reports, and Settings links were removed as they had no corresponding pages.

2/14/2026: Filter dropdowns on the deals page use custom styled dropdown components instead of native HTML select elements, matching the app's design system.

2/16/2026: Deal detail page attachment upload modal now supports both file upload (with file picker) and link URL modes via a toggle, matching the client detail page attachment modal pattern.

2/16/2026: Pipeline view on the deals page now supports drag-and-drop to move deals between stage columns. Deal cards are draggable and dropping on a different column updates the deal's stage via the API.

2/16/2026: Task links on client detail page and deal detail page now navigate to /tasks/:taskId (the task detail page) instead of the deal detail page or being non-clickable.

2/16/2026: Added Supabase authentication system. New pages: Login (/login) with email/password and Google OAuth, Register (/register) with name/email/password and Google OAuth, AuthCallback (/auth/callback) for OAuth redirects. All app routes are protected by a RequireAuth guard that redirects unauthenticated users to /login. The sidebar displays the authenticated user's name, avatar, and a sign-out button. All 10 Netlify Functions are wrapped with JWT verification middleware. Timeline events and deal history now attribute actions to the authenticated user's name instead of "System".

2/17/2026: Authentication is now optional. Removed Login and Register pages. Removed RequireAuth route guard — all pages are accessible without authentication. SSO (Google OAuth) now opens in a popup window instead of navigating the current window. The sidebar user area moved to the upper left (below app title), showing avatar/name/sign-out when logged in or a "Sign in with Google" button when not logged in. Backend functions use optional auth middleware that passes user info when available but allows unauthenticated requests. Timeline events and writeup authors fall back to "System" when no user is authenticated.

2/18/2026: CSV import dialog on the clients page now shows a CSV column format specification table listing all supported columns (Name, Type, Status, Tags, Source Type, Source Detail, Campaign, Channel, Date Acquired) with required/optional indicators and value descriptions. Includes a "Download CSV template" button that generates a sample CSV file. The import parses CSV with proper quote handling, maps headers to database fields, and reports per-row validation errors. Backend bulk import endpoint validates types, statuses, and required fields.

2/18/2026: CSV import extended to support deals, contacts/individuals, and tasks in addition to clients. Deals page has Import button with CSV format (Name, Client Name, Value, Stage, Owner, Probability, Expected Close Date, Status) — client lookup by name. Tasks page has Import button with CSV format (Title, Description, Due Date, Priority, Client Name, Assignee) — client lookup by name. Clients page has new "Import Contacts" button with CSV format (Name, Title, Email, Phone, Location, Client Name) — creates individuals and optionally associates them with clients by name. Shared ImportDialog component extracted for reuse across all entity types.

2/18/2026: Added Settings page at /settings with sidebar navigation link. The Settings page has two sections: (1) Import & Export — buttons to import clients, deals, tasks, and contacts from CSV, and export clients, deals, and tasks to CSV. (2) Webhooks — CRUD for webhook configurations that can send notifications to external services (Zapier, n8n, Discord) on events like new client created, deal stage changed, task completed, etc. Webhook management includes add/edit modal with name, URL, and event checkboxes; enable/disable toggle; and delete with confirmation. Added webhooks database table and CRUD API endpoint. Sidebar navigation now includes Clients, Deals, Tasks, and Settings.

2/18/2026: Added Team page (UsersListPage at /users) and User Detail page (UserDetailPage at /users/:userId). Team page shows a grid of user cards with avatar, name, email, active deals count, and open tasks count. User Detail page shows user info (name, email, join date), summary stats (active deals, open tasks, total deals), and three sections: owned deals list, assigned tasks list, and recent activity feed. Added /.netlify/functions/users API endpoint (GET list with stats, GET detail with deals/tasks/activity). Seeded 9 team members. Sidebar now has "Team" nav item. Deal owner and task assignee fields in CreateDealModal, AddDealModal, DealDetailHeader, CreateTaskModal, and EditTaskModal now show a user selection dropdown (FilterSelect) populated from the users API instead of free-form text input.
