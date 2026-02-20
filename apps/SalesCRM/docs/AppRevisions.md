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

2/19/2026: Webhook modal now includes platform-specific setup guides for Zapier, n8n, and custom endpoints. Each guide shows step-by-step instructions for obtaining the webhook URL, a URL format hint, and platform-specific tips (e.g., Zapier needs the first event to detect the schema; n8n has separate test vs production URLs). A toggleable payload format section shows the JSON structure that webhook events will send. The URL input placeholder updates based on the selected platform.

2/20/2026: Fixed testSpec directive violations on UsersListPage: added UserCards test section in docs/tests.md with ULP-CRD-01 (card content verification for avatar, name, email, active deals count, open tasks count), moved ULP-HDR-02 (card click navigation) under UserCards section, and updated ULP-HDR-01 Playwright test to verify card content (names, emails, deal/task counts).

2/20/2026: FilterSelect dropdowns with many options now include a searchable search input. When `searchable` is enabled, a search field appears at the top of the dropdown that filters options as you type, auto-focuses when opened, and shows "No matches" when no options match. Applied to client, user, and deal select dropdowns across filter bars, create/edit modals, and detail page headers.

2/20/2026: Fixed testSpec directive violations: CDP-HDR-02 now includes name save persistence verification (edit name, save, confirm persisted after reload) per the directive requiring mutation persistence tests. CDP-QA-04 stage dropdown label corrected from 'Proposal' to 'Proposal Sent' to match the actual application UI labels used in AddDealModal and other components.

2/20/2026: Added DDP-ATT-06 file upload test entry to docs/tests.md and corresponding Playwright test using setInputFiles for the DealDetailPage UploadAttachmentModal. The UploadAttachmentModal already used real file upload via UploadThing (/.netlify/functions/upload), but the existing DDP-ATT-03 test only exercised link URL mode. The new test verifies actual file upload mechanics end-to-end: file selection via setInputFiles, upload via UploadThing, and persistence in the attachments list.

2/20/2026: Fixed writeTests.md directive violations in DealDetailPage tests: (1) DDP-HIS-02 replaced count() inside toPass() with atomic toHaveCount assertion to prevent nested-wait deadlock, and changed target stage to 'negotiation' to avoid parallel test race conditions with DDP-HDR-04/DDP-PIP-02 which toggle discovery/proposal on the same deal. (2) DDP-ATT-04 test title corrected from "Download link is present on attachments" to "Download link downloads the file" to match spec. (3) DDP-WRT-04 added assertions verifying edit mode elements appear (title input, content input, save/cancel buttons) instead of only using waitForTimeout.

2/18/2026: Added Team page (UsersListPage at /users) and User Detail page (UserDetailPage at /users/:userId). Team page shows a grid of user cards with avatar, name, email, active deals count, and open tasks count. User Detail page shows user info (name, email, join date), summary stats (active deals, open tasks, total deals), and three sections: owned deals list, assigned tasks list, and recent activity feed. Added /.netlify/functions/users API endpoint (GET list with stats, GET detail with deals/tasks/activity). Seeded 9 team members. Sidebar now has "Team" nav item. Deal owner and task assignee fields in CreateDealModal, AddDealModal, DealDetailHeader, CreateTaskModal, and EditTaskModal now show a user selection dropdown (FilterSelect) populated from the users API instead of free-form text input.
