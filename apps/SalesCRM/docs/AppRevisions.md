# App Revisions

Changes to the app spec from bug reports and maintenance.

## Revisions

2/14/2026: Attachment displays show file-type-specific icons (Document, Image, Spreadsheet, Code, etc.) and render thumbnail previews for image files, on both the client detail page and deal detail page.

2/14/2026: Added a TaskDetailPage at /tasks/:taskId. Clicking a task card navigates to this page, which shows task title, priority, status, due date, assignee, associated client/deal, and a notes section where notes can be added and deleted. Includes a task_notes database table and GET/POST/DELETE API endpoints for notes. Tasks can be marked complete or canceled from this page.

2/14/2026: Sidebar navigation contains only Clients, Deals, and Tasks links. Dashboard, Reports, and Settings links were removed as they had no corresponding pages.

2/14/2026: Filter dropdowns on the deals page use custom styled dropdown components instead of native HTML select elements, matching the app's design system.

2/16/2026: Deal detail page attachment upload modal now supports both file upload (with file picker) and link URL modes via a toggle, matching the client detail page attachment modal pattern.

2/16/2026: Pipeline view on the deals page now supports drag-and-drop to move deals between stage columns. Deal cards are draggable and dropping on a different column updates the deal's stage via the API.

2/16/2026: Added Supabase authentication system. New pages: Login (/login) with email/password and Google OAuth, Register (/register) with name/email/password and Google OAuth, AuthCallback (/auth/callback) for OAuth redirects. All app routes are protected by a RequireAuth guard that redirects unauthenticated users to /login. The sidebar displays the authenticated user's name, avatar, and a sign-out button. All 10 Netlify Functions are wrapped with JWT verification middleware. Timeline events and deal history now attribute actions to the authenticated user's name instead of "System".
