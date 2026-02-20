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

Authentication is optional. The sidebar user area is in the upper left (below app title), showing avatar/name/sign-out when logged in or a "Sign In" button when not logged in. Clicking "Sign In" reveals an inline auth form with email/password fields, a submit button, a "Forgot password?" link, and a toggle to switch between Sign In and Sign Up modes. Backend functions use optional auth middleware that passes user info when available but allows unauthenticated requests. Timeline events and writeup authors fall back to "System" when no user is authenticated. All Netlify Functions are wrapped with JWT verification middleware (optional mode).

Email/password signup requires email confirmation before the user can log in. After signing up, the user receives a confirmation email (via Resend API) with a link to /auth/confirm-email?token=... that confirms the account and logs them in. In test mode (IS_TEST=true), signup auto-confirms and returns a session immediately.

A "Forgot password?" link in the sign-in form navigates to /auth/forgot-password, where the user enters their email to receive a password reset link (via Resend API). The reset link goes to /auth/reset-password?token=... where they enter a new password and confirm it. On success, the password is updated and the user is logged in.

Three auth pages exist: ForgotPasswordPage (/auth/forgot-password), ResetPasswordPage (/auth/reset-password), and ConfirmEmailPage (/auth/confirm-email). The email_tokens database table stores confirmation and reset tokens with expiry and used-at tracking.

## CSV Import and Export

CSV import is available for clients, deals, contacts/individuals, and tasks. Each entity type has a CSV column format specification table listing all supported columns with required/optional indicators and value descriptions, plus a "Download CSV template" button. The import parses CSV with proper quote handling, maps headers to database fields, and reports per-row validation errors. Backend bulk import endpoints validate types, statuses, and required fields.

CSV formats:
- Clients: Name, Type, Status, Tags, Source Type, Source Detail, Campaign, Channel, Date Acquired
- Deals: Name, Client Name, Value, Stage, Owner, Probability, Expected Close Date, Status (client lookup by name)
- Tasks: Title, Description, Due Date, Priority, Client Name, Assignee (client lookup by name)
- Contacts: Name, Title, Email, Phone, Location, Client Name (creates individuals, optionally associates with clients by name)

A shared ImportDialog component is used across all entity types.

## Settings Page

A Settings page exists at /settings with sidebar navigation link. Three sections:
1. **Email Notifications** — notification preference toggles for email alerts on followed clients. Seven toggleable preferences: client updated, deal created, deal stage changed, task created, task completed, contact added, note added. All default to enabled. Only visible when authenticated. Preferences stored in notification_preferences database table, managed via /.netlify/functions/notification-preferences API.
2. **Import & Export** — buttons to import clients, deals, tasks, and contacts from CSV, and export clients, deals, and tasks to CSV.
3. **Webhooks** — CRUD for webhook configurations that send notifications to external services (Zapier, n8n, Discord) on events like new client created, deal stage changed, task completed, etc. Webhook management includes add/edit modal with name, URL, and event checkboxes; enable/disable toggle; and delete with confirmation. Added webhooks database table and CRUD API endpoint.

## Webhook Setup Guides

Webhook modal includes platform-specific setup guides for Zapier, n8n, and custom endpoints. Each guide shows step-by-step instructions for obtaining the webhook URL, a URL format hint, and platform-specific tips (e.g., Zapier needs the first event to detect the schema; n8n has separate test vs production URLs). A toggleable payload format section shows the JSON structure that webhook events will send. The URL input placeholder updates based on the selected platform.

## Team Page and User Management

A Team page (UsersListPage) exists at /users and a User Detail page (UserDetailPage) at /users/:userId. Team page shows a grid of user cards with avatar, name, email, active deals count, and open tasks count. User Detail page shows user info (name, email, join date), summary stats (active deals, open tasks, total deals), and three sections: owned deals list, assigned tasks list, and recent activity feed. A /.netlify/functions/users API endpoint provides GET list with stats and GET detail with deals/tasks/activity. 9 team members are seeded.

Deal owner and task assignee fields in CreateDealModal, AddDealModal, DealDetailHeader, CreateTaskModal, and EditTaskModal show a user selection dropdown (FilterSelect) populated from the users API instead of free-form text input.

## Client Following and Email Notifications

Authenticated users can follow/unfollow clients via a toggle button on the client detail page. Following a client subscribes the user to email notifications (via Resend API) when changes occur on that client. Notification types include: client updated, deal created, deal stage changed, task created, task completed, contact added, and note added. Users can configure which notification types they receive on the Settings page via individual toggles (all enabled by default). The actor who triggered the change does not receive a notification. Notifications are sent asynchronously (fire-and-forget) and do not block API responses.

Two new database tables: `client_followers` (junction table for user-client follow relationships with unique constraint) and `notification_preferences` (per-user toggle preferences with defaults of all true). Two new API endpoints: `/.netlify/functions/client-follow` (GET to check follow status, POST to toggle follow; requires auth) and `/.netlify/functions/notification-preferences` (GET/PUT for preferences; requires auth). Existing API functions for clients, deals, tasks, and contacts trigger follower notifications when creating timeline events.
