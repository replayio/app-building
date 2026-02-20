# App Revisions

New functionality and spec changes beyond the original AppSpec.md, organized by topic.

## Attachment Displays

Attachment displays show file-type-specific icons (Document, Image, Spreadsheet, Code, etc.) and render thumbnail previews for image files, on both the client detail page and deal detail page. Upload modals support both file upload (with file picker) and link URL modes via a toggle.

## Task Detail Page

A TaskDetailPage exists at /tasks/:taskId. Clicking a task card navigates to this page, which shows task title, priority, status, due date, assignee, associated client/deal, and a notes section where notes can be added and deleted. Includes a task_notes database table and GET/POST/DELETE API endpoints for notes. Tasks can be marked complete or canceled from this page.

Task links on client detail page and deal detail page navigate to /tasks/:taskId.

## Sidebar Navigation

Sidebar navigation contains Clients, Deals, Tasks, Team, and Settings links. Dashboard, Reports, and other placeholder links were removed as they had no corresponding pages.

## Filter Dropdowns

Filter dropdowns on the deals page and elsewhere use custom styled dropdown components instead of native HTML select elements, matching the app's design system. FilterSelect dropdowns with many options include a searchable search input. When `searchable` is enabled, a search field appears at the top of the dropdown that filters options as you type, auto-focuses when opened, and shows "No matches" when no options match. Applied to client, user, and deal select dropdowns across filter bars, create/edit modals, and detail page headers.

## Pipeline Drag-and-Drop

Pipeline view on the deals page supports drag-and-drop to move deals between stage columns. Deal cards are draggable and dropping on a different column updates the deal's stage via the API.

## Authentication

Authentication is optional. There are no Login or Register pages. SSO (Google OAuth) opens in a popup window. The sidebar user area is in the upper left (below app title), showing avatar/name/sign-out when logged in or a "Sign in with Google" button when not logged in. Backend functions use optional auth middleware that passes user info when available but allows unauthenticated requests. Timeline events and writeup authors fall back to "System" when no user is authenticated. All Netlify Functions are wrapped with JWT verification middleware (optional mode).

## CSV Import and Export

CSV import is available for clients, deals, contacts/individuals, and tasks. Each entity type has a CSV column format specification table listing all supported columns with required/optional indicators and value descriptions, plus a "Download CSV template" button. The import parses CSV with proper quote handling, maps headers to database fields, and reports per-row validation errors. Backend bulk import endpoints validate types, statuses, and required fields.

CSV formats:
- Clients: Name, Type, Status, Tags, Source Type, Source Detail, Campaign, Channel, Date Acquired
- Deals: Name, Client Name, Value, Stage, Owner, Probability, Expected Close Date, Status (client lookup by name)
- Tasks: Title, Description, Due Date, Priority, Client Name, Assignee (client lookup by name)
- Contacts: Name, Title, Email, Phone, Location, Client Name (creates individuals, optionally associates with clients by name)

A shared ImportDialog component is used across all entity types.

## Settings Page

A Settings page exists at /settings with sidebar navigation link. Two sections:
1. **Import & Export** — buttons to import clients, deals, tasks, and contacts from CSV, and export clients, deals, and tasks to CSV.
2. **Webhooks** — CRUD for webhook configurations that send notifications to external services (Zapier, n8n, Discord) on events like new client created, deal stage changed, task completed, etc. Webhook management includes add/edit modal with name, URL, and event checkboxes; enable/disable toggle; and delete with confirmation. Added webhooks database table and CRUD API endpoint.

## Webhook Setup Guides

Webhook modal includes platform-specific setup guides for Zapier, n8n, and custom endpoints. Each guide shows step-by-step instructions for obtaining the webhook URL, a URL format hint, and platform-specific tips (e.g., Zapier needs the first event to detect the schema; n8n has separate test vs production URLs). A toggleable payload format section shows the JSON structure that webhook events will send. The URL input placeholder updates based on the selected platform.

## Team Page and User Management

A Team page (UsersListPage) exists at /users and a User Detail page (UserDetailPage) at /users/:userId. Team page shows a grid of user cards with avatar, name, email, active deals count, and open tasks count. User Detail page shows user info (name, email, join date), summary stats (active deals, open tasks, total deals), and three sections: owned deals list, assigned tasks list, and recent activity feed. A /.netlify/functions/users API endpoint provides GET list with stats and GET detail with deals/tasks/activity. 9 team members are seeded.

Deal owner and task assignee fields in CreateDealModal, AddDealModal, DealDetailHeader, CreateTaskModal, and EditTaskModal show a user selection dropdown (FilterSelect) populated from the users API instead of free-form text input.
