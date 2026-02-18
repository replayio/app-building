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
