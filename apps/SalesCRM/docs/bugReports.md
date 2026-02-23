# Bug Reports

## Open

## Unreviewed

2/23/2026: The forgot password screen and other pages have content flush against the top/sides of the screen with no breathing room — pages need consistent padding/margin so content is not pressed against screen edges. This should be added as a directive in writeApp.md.
- Before: 1352882
- After: (this commit)
- Fix: Added `p-6 max-sm:p-3` padding to ForgotPasswordPage, ResetPasswordPage, ConfirmEmailPage, and NotFoundPage root elements. These pages were missing the consistent padding that all other pages (ClientsListPage, DealsListPage, etc.) already had. Added directive to writeApp.md requiring all pages to include consistent padding on their root element. Added SPACING-01 cross-cutting test to verify pages have non-zero padding.
- Problem stage: writeApp.md — no directive required page-level padding, so auth pages and the 404 page were created without it
- Directive: Added directive to writeApp.md: every page component must include consistent padding (`p-6 max-sm:p-3`) on its root element

2/23/2026: Email confirmation for password login does not work in production — confirmation emails contain localhost URLs (from getAppUrl() in netlify/utils/email.ts defaulting to http://localhost:8888 when process.env.URL is not set), so users can never confirm their email and are blocked from logging in. Tests did not catch this because IS_TEST mode bypasses email confirmation entirely (auto-confirms on signup, skips the check on login), so the actual production email confirmation flow is never exercised. Directive added to writeTests.md: auth flows with email verification must have dedicated tests that run without IS_TEST bypass.
- Before: 084ad68
- After: (this commit)
- Fix: Changed `getAppUrl()` in `netlify/utils/email.ts` and `netlify/utils/notifications.ts` to accept the full `Request` object instead of just the URL string. The function now reads `x-forwarded-host` and `x-forwarded-proto` headers (set by Netlify's CDN proxy) to determine the correct production origin, falling back to the `host` header, then `req.url` origin, then `process.env.URL`, then localhost. Updated all callers in auth.ts, deals.ts, clients.ts, client-tasks.ts, client-people.ts, client-deals.ts to pass `req` instead of `req.url`. Added two new tests (AUTH-CE-03, AUTH-RP-04) that exercise the email confirmation and password reset flows without IS_TEST bypass by inserting test data directly into the database and calling the API endpoints.
- Problem stage: writeApp.md — `getAppUrl()` only tried parsing `req.url` as a full URL (which in Netlify Functions may be a local address) and fell back to `process.env.URL` then hardcoded localhost, instead of reading proxy headers that carry the real production host

2/21/2026: Adding a relationship to a contact does not update the other contact to show the reciprocal relationship.
- Before: 9441d18
- After: (this commit)
- Fix: Updated the GET /individuals/:id endpoint to query relationships in both directions using UNION ALL. Forward relationships (where the individual is the source) are returned as-is. Reverse relationships (where the individual is the target) are included with inverted relationship types (manager↔report; symmetric types like colleague, decision_maker, influencer, other stay the same). Updated DELETE to allow removing a relationship from either side. No schema changes needed — the fix is purely in the query layer.
- Problem stage: writeApp.md — the backend only queried individual_relationships in one direction (WHERE individual_id = :id), ignoring rows where the individual appeared as related_individual_id

## Finished

2/19/2026: WebhookDialogInstructions — The "Add Webhook" dialog needs actual setup instructions for each supported platform.
- Before: 25bd361
- After: 7af02ba
- Fix: Added platform-specific setup guide to the WebhookModal with Zapier, n8n, and Custom Endpoint tabs. Each platform shows step-by-step instructions for obtaining the webhook URL, a URL format hint, and a platform-specific tip. Added a toggleable payload format section showing the JSON event structure. The URL input placeholder updates based on the selected platform. Added 2 new tests (STP-WH-04 for setup guide navigation, STP-WH-05 for payload format toggle) and updated STP-WH-02 to verify setup guide presence. Renumbered old STP-WH-04 (delete) to STP-WH-06.
- Problem stage: none (enhancement to existing feature — setup guides were not part of the original webhook spec)
- AppRevisions.md: Already updated with Webhook Setup Guides section documenting the new feature

2/20/2026: Add a Contacts page for searching all people/individuals that have been added to the system. This should be a dedicated page accessible from the sidebar that lists all contacts with search functionality.
- Before: 6d387c9
- After: (this commit)
- Fix: Added ContactsListPage at /contacts with sidebar navigation link (Contact icon). Page features a searchable table of all individuals with columns: Name, Title, Email, Phone, Location, and Associated Clients (badges). Search filters across name, email, title, phone, and location fields with 300ms debounce. Includes pagination (50 per page), CSV import/export, and Add Contact modal (name, title, email, phone, location fields). Clicking a contact row navigates to /individuals/:id (PersonDetailPage). Enhanced backend individuals list endpoint to return email, phone, location, associated client names, pagination support, and multi-field search. Expanded individualsSlice with list state management (items, total, page). Created 6 new components (ContactsPageHeader, ContactsSearchBar, ContactsTable, ContactsPagination, AddContactModal, ContactsListPage). Added 9 new Playwright tests (CTLP-HDR-01/02/03, CTLP-SRCH-01/02/03, CTLP-TBL-01/02, CTLP-PGN-01). Updated CLP-NAV-01/02 to include Contacts nav item.
- Problem stage: none (enhancement — Contacts page was not part of the original spec)
- AppRevisions.md: Already updated with Contacts Page section documenting the new feature

2/20/2026: Add email integration for client follow notifications. Logged-in users should be able to go to the Settings page and configure their email notification preferences for when changes happen to a client they are following. "Following" a client means the user has opted in on that client's detail page (add a follow/unfollow button). Notifications should cover any changes affecting the client, including changes to the client's contacts or deals. Use the Resend API for sending emails.
- Before: e4b5f26
- After: (this commit)
- Fix: Added client following system with follow/unfollow toggle button on client detail page (FollowButton component, only visible when authenticated). Added email notification preferences to Settings page (NotificationPreferencesSection with 7 toggles: client updated, deal created, deal stage changed, task created, task completed, contact added, note added — all default to enabled, only visible when authenticated). Created two new database tables: client_followers (user-client junction with unique constraint) and notification_preferences (per-user toggles). Created two new API endpoints: /.netlify/functions/client-follow (GET/POST, requires auth) and /.netlify/functions/notification-preferences (GET/PUT, requires auth). Created notifications utility (netlify/utils/notifications.ts) that queries followers and their preferences, then sends emails via Resend API. Integrated fire-and-forget notification calls into existing backend functions (clients.ts, client-tasks.ts, client-deals.ts, client-people.ts, deals.ts) wherever timeline events are created. Actor is excluded from notifications. Added 6 new Playwright tests (STP-NP-01/02/03, CDP-FOL-01/02/03) and updated STP-HDR-01.
- Problem stage: none (enhancement — client following and email notifications were not part of the original spec)

2/20/2026: Improve the auth system: require email confirmation for new user signups before they can log in, and add a "Forgot password" link on the login page that sends a password reset email. Use the Resend API for sending emails.
- Before: 837fc7f
- After: 366203c
- Fix: Added email confirmation requirement for new signups (auto-confirmed in IS_TEST mode). Signup now creates unconfirmed user, sends confirmation email via Resend API, and returns needsConfirmation status. Added "Forgot password?" link in sidebar auth form that navigates to /auth/forgot-password. Created three new pages: ForgotPasswordPage (/auth/forgot-password), ResetPasswordPage (/auth/reset-password?token=...), and ConfirmEmailPage (/auth/confirm-email?token=...). Added confirm-email, forgot-password, and reset-password API endpoints to auth function. Login now checks email_confirmed (bypassed in test mode). Added email_tokens table migration and email_confirmed column migration to migrate-db.ts. Added 5 new Playwright tests (AUTH-FP-01, AUTH-FP-02, AUTH-RP-01, AUTH-RP-02, AUTH-CE-01). All 9 auth tests pass.
- Problem stage: none (enhancement — email confirmation and forgot password were not part of the previous auth implementation)

2/20/2026: Directive violations — TLP-NAV-01/02 missing Contacts, PageHeader descriptions missing Import button
- Before: 2cc96fc
- After: (this commit)
- Fix: Fixed TLP-NAV-01 and TLP-NAV-02 test entries in docs/tests.md to include "Contacts" in the sidebar navigation links (matching CLP-NAV-01/02 which already had it). Updated PageHeader component descriptions for TasksListPage and DealsListPage to mention the Import button (which existed in code and had test entries but was missing from the Components section). Updated Playwright tests for TLP-NAV-01 (added Contacts visibility check) and TLP-NAV-02 (added Contacts navigation check). All 23 tasks-list-page tests pass.
- Problem stage: testSpec.md — the Contacts nav item and Import buttons were omitted from TLP-NAV-01/02 entries and PageHeader component descriptions when those sections were originally written

2/20/2026: DDP-HDR-02 violation — Client field in DealDetailHeader was not editable
- Before: edc5279
- After: (this commit)
- Fix: Added searchable client dropdown to DealDetailHeader edit mode using FilterSelect. DealDetailPage now fetches available clients and passes them as prop. Backend deals PUT endpoint now includes client_id in the UPDATE query. Updated DDP-HDR-02 test to verify client field editing per spec (select different client, save, verify persistence). All 29 deal-detail-page tests pass.
- Problem stage: writeTests.md — the test spec (DDP-HDR-02) correctly specified that editing the client field should update the deal, but the Playwright test did not actually verify client field editing, allowing the missing implementation to go undetected
- Directive: Added directive to writeTests.md: tests must exercise each specific field interaction described in the spec entry, not just a subset

2/18/2026: There should be a users page where you can see everyone that has an account, and a user detail page where you can see their activity and what they are managing. Everywhere in the app that refers to users with accounts should allow selecting them from a dropdown (e.g., deal owner, task assignee).
- Before: 1e5a771
- After: (this commit)
- Fix: Added Team page (UsersListPage at /users) with user card grid showing avatar, name, email, active deals, and open tasks. Added User Detail page (UserDetailPage at /users/:userId) with user info, summary stats, owned deals list, assigned tasks list, and recent activity. Created /.netlify/functions/users API (GET list with stats, GET detail with deals/tasks/activity). Seeded 9 team members matching existing owner/assignee names. Added "Team" sidebar nav item. Replaced free-form text inputs for deal owner and task assignee with FilterSelect dropdowns populated from users API in CreateDealModal, AddDealModal, DealDetailHeader, CreateTaskModal, and EditTaskModal. Added 6 Playwright tests (ULP-HDR-01/02, UDP-HDR-01/02, UDP-DL-01, UDP-TSK-01) and updated CLP-NAV-01/02.
- Problem stage: none (new functionality — users/team management was not part of the original spec)

2/18/2026: Add a settings page and move the import/export buttons there. The settings page should also have webhook settings where you can configure webhooks to send to Zapier / n8n / Discord on different events selected from a list (e.g., new client created, deal stage changed, task completed, etc.).
- Before: 1e5a771
- After: (this commit)
- Fix: Added Settings page at /settings with sidebar navigation link. Import & Export section has buttons to import clients, deals, tasks, and contacts from CSV, and export clients, deals, and tasks to CSV (reusing shared ImportDialog). Webhooks section has full CRUD — add/edit modal with name, URL, and event checkboxes (10 events: client_created, client_updated, deal_created, deal_stage_changed, deal_closed_won, deal_closed_lost, task_created, task_completed, contact_created, note_added); enable/disable toggle; delete with confirmation. Added webhooks database table and /.netlify/functions/webhooks API endpoint. Sidebar now includes Settings nav item. Added 7 new Playwright tests (STP-HDR-01, STP-IE-01/02, STP-WH-01/02/03/04) and updated CLP-NAV-01/02.
- Problem stage: none (new functionality — settings page with webhooks was not part of the original spec)

2/18/2026: Import from CSV needs to support importing deals, contacts, and tasks as well — not just clients.
- Before: cc0d9ad
- After: (this commit)
- Fix: Added CSV import support for deals, contacts/individuals, and tasks. Deals page has Import button with bulk import endpoint (POST /deals?action=import) supporting Name, Client Name, Value, Stage, Owner, Probability, Expected Close Date, Status columns with client lookup by name. Tasks page has Import button with bulk import endpoint (POST /tasks?action=import) supporting Title, Description, Due Date, Priority, Client Name, Assignee columns. Clients page has new "Import Contacts" button with bulk import endpoint (POST /individuals?action=import) supporting Name, Title, Email, Phone, Location, Client Name columns that creates individuals and optionally associates with clients. Extracted shared ImportDialog component for reuse. Added 6 new Playwright tests (DLP-HDR-04/05, TLP-HDR-04/05, CLP-HDR-07/08).
- Problem stage: none (new functionality — CSV import for deals/contacts/tasks was not part of the original spec)

2/18/2026: CSV import functionality should specify the required format. The import from CSV button doesn't tell the user what columns or format the CSV file needs to be in.
- Before: cc0d9ad
- After: (this commit)
- Fix: Added CSV column format specification table to import dialog showing all 9 supported columns with required/optional indicators and value descriptions. Added "Download CSV template" button. Implemented CSV parsing with proper quote handling, header mapping, and per-row validation errors. Backend bulk import endpoint validates types, statuses, and required fields.
- Problem stage: testSpec.md — the test spec for the import dialog (CLP-HDR-04) only required "an import dialog/modal opens allowing the user to upload client data" without specifying that the dialog should show the expected CSV format or required columns
- Directive: Added directive to testSpec.md: import/upload dialogs must specify the expected data format, and test entries should verify that format documentation is visible to the user

2/17/2026: Sign-in flow doesn't work — after signing up with email/password, attempting to sign in returns "invalid login credentials".
- The shared Supabase auth server at `auth.nut.new` has email confirmation enabled. When `auth.signUp()` is called, it creates the user but does not return a session (because the email is unverified). The user then tries to sign in with `auth.signInWithPassword()`, which fails because the account is unconfirmed.
- Fix: Ripped out the entire Supabase dependency. Built custom auth backend (`netlify/functions/auth.ts`) with signup, login, and session endpoints using scrypt password hashing and HS256 JWT tokens. Signup immediately returns a session — no email confirmation required. Rewrote frontend `src/lib/auth.ts` (simple token management + fetch interceptor), `AuthProvider.tsx` (calls custom backend), `authSlice.ts` (removed Supabase). Removed `@supabase/supabase-js` package, Supabase env vars, dead Login/Register/AuthCallback pages. Updated backend `netlify/utils/auth.ts` to verify HS256 JWTs. Added AUTH-E2E-01 test that exercises full signup → sign-out → sign-in flow. Bundle size reduced from 1308KB to 881KB.
- Problem stage: build/writeApp.md — used an external auth provider (Supabase) whose email confirmation behavior couldn't be controlled, causing signup to silently fail to establish a session
- Directive: Added directive to writeTests.md: apps with login/signup must have a complete e2e test exercising the full sign-up and sign-in flow against the real auth backend

2/17/2026: Rip out Google OAuth and replace with email/password login.
- Superseded by the fix above — the entire Supabase dependency has been removed and replaced with a custom auth backend.

2/17/2026: App doesn't work after deployment — clients page doesn't load or display any data.
- Investigation: API endpoint returns 200 with data. Frontend loads. Issue was transient. Deployment test (Replay recording 15504b44-6cef-49d2-8768-c0d013d0c924) confirms everything works.

2/17/2026: Login flow doesn't work — clicking "Sign in with Google" opens the OAuth popup and the Google sign-in flow completes, but after returning the user is still not logged in with no apparent errors.
- Superseded by the Supabase removal above. The entire OAuth flow has been removed.

2/17/2026: Can't login to the app — the SSO popup opens in the same window as the app instead of a new window, breaking the login flow. Authentication should be optional — the app should load and be usable without logging in, with database access not requiring auth. There should be a current user info area in the upper left that shows the logged-in user and allows for logging in.
- Analysis: docs/bugs/SSOAuthOptional.md
- Fix: Made authentication optional. Removed Login/Register pages and RequireAuth guard. SSO now opens in a popup window. Backend uses optionalAuth middleware (allows unauthenticated requests, user falls back to "System"). Sidebar user area moved to upper left with avatar/name/sign-out when logged in, or "Sign in with Google" button when not logged in.
- Problem stage: testSpec.md — the old test spec specified that the login page has a "Google OAuth button" but did not specify the click behavior (should open in popup window, not navigate the current window)
- Directive: Updated testSpec.md directive: clickable elements that trigger external flows (OAuth, SSO, payment, etc.) must specify how the flow opens and what happens on completion

2/16/2026: The app has no authentication — all pages and API endpoints are accessible without logging in and there is no user identity.
- Analysis: docs/bugs/AuthenticationSystem.md
- Before: df7222c
- After: c0847d0
- Fix: Added Supabase authentication system with Login/Register/AuthCallback pages, RequireAuth route guard, JWT verification middleware (requiresAuth wrapper) on all 10 Netlify Functions, fetch interceptor for automatic token injection, AuthProvider context, user info in sidebar, and IS_TEST mode for Playwright. Timeline events and deal history now use authenticated user's name instead of "System".
- Problem stage: none (new functionality — authentication was not part of the original spec)

2/16/2026: Links to tasks don't work. They either go to the wrong page, aren't clickable, or go to a "task not found" page.
- Before: ef67c9a
- After: (this commit)
- Fix: Client detail TasksSection now navigates to /tasks/:taskId (was /deals/:dealId or not clickable). Deal detail LinkedTasksSection now also navigates to /tasks/:taskId (was not clickable at all).
- Problem stage: none (change in app requirements — the old spec specified navigation to deal detail page, but the TaskDetailPage added in a previous maintenance round changed the expected target)
- Note: Added missing AppRevisions.md entry for task link navigation change.

2/16/2026: Pipeline view on the deals page should allow drag-and-drop to move deals between stages.
- Before: 4e63501
- After: (this commit)
- Fix: Added HTML5 drag-and-drop support to DealsPipelineView. Deal cards are draggable and can be dropped on different stage columns to change the deal's stage via the API.
- Problem stage: none (new functionality — the original spec described the pipeline view as display-only with no drag-and-drop)

2/16/2026: Attachment functionality on the deals page does not allow file uploads.
- Before: fbafcda
- After: (this commit)
- Fix: Updated UploadAttachmentModal on deal detail page to support both file upload and link URL modes via toggle buttons, matching the client detail page attachment modal pattern.
- Problem stage: writeTests.md — test spec entries (DDP-ATT-02, DDP-ATT-03) specified "file picker/upload dialog" and "select and upload a file", but the Playwright tests only verified a URL input form instead of actual file upload mechanics, masking the missing upload functionality
- Directive: Added directive to writeTests.md: when the test spec describes file upload functionality, the test must exercise actual file upload mechanics, not substitute URL/text input tests



2/14/2026: Add a task detail page that has all pertinent information and can be used to mark the task completed or canceled, or add notes
- Analysis: docs/bugs/TaskDetailPage.md
- Before: fc47dd2
- After: 8b82e35
- Fix: Added TaskDetailPage with header (title, priority, status, back/complete/cancel), notes section (add/delete/empty state), and 7 new Playwright tests. Added task_notes table, GET/POST/DELETE API endpoints for notes. Task cards now navigate to /tasks/:taskId.
- Problem stage: none (new functionality)

2/14/2026: When on the clients page both the "dashboard" and "clients" are highlighted. no point having duplicates, just remove the dashboard here
- Analysis: docs/bugs/DashboardHighlight.md
- Before: 78daa0a
- After: fc47dd2
- Fix: Removed "Dashboard" entry from sidebar navigation. Both linked to /clients.
- Problem stage: writeApp.md — duplicate navigation links pointing to the same URL
- Directive: Added directive to writeApp.md: navigation sidebars must not contain duplicate links pointing to the same URL

2/14/2026: "Reports" link on left goes to a 404. all links must go to valid locations
- Analysis: docs/bugs/Reports404.md
- Before: 78daa0a
- After: fc47dd2
- Fix: Removed "Reports" link from sidebar. No /reports route exists.
- Problem stage: testSpec.md — spec listed Reports as a nav link but no test entry covered its navigation target
- Directive: Existing directive already covers this: "For every clickable element, the test entry must specify the exact navigation target or action result."

2/14/2026: "Settings" button in lower left does not do anything. all enabled buttons must do something
- Analysis: docs/bugs/SettingsButton.md
- Before: 78daa0a
- After: fc47dd2
- Fix: Removed "Settings" button from sidebar. No /settings route exists.
- Problem stage: testSpec.md — spec listed Settings as a nav link but no test entry covered its click behavior
- Directive: Existing directive already covers this: "For every clickable element, the test entry must specify the exact navigation target or action result."

2/14/2026: On deals page the dropdowns look good but when clicked they revert to the browser's default styling which is ugly. when clicked they should be styled appropriately
- Analysis: docs/bugs/DealsDropdownStyling.md
- Before: 0cd095c
- After: 78daa0a
- Fix: Replaced native `<select>` elements in DealsFilterControls with custom dropdown component using React state, styled menu, and click-outside-to-close behavior. Updated all DLP-FLT tests.
- Problem stage: writeApp.md — used native HTML `<select>` elements instead of custom styled dropdowns
- Directive: Added directive to writeApp.md: never use native `<select>` elements when the app has a custom design system

2/14/2026: Attachments on clients page should show a preview with the file type and thumbnail for images. all attachment displays should look this way
- Analysis: docs/bugs/AttachmentPreview.md
- Before: 0301f38
- After: 0cd095c
- Fix: Added AttachmentPreview component with file-type-specific icons (Document, Image, Spreadsheet, etc.) and image thumbnails. Updated both client and deal attachment displays. Updated test spec and tests.
- Problem stage: writeApp.md — used generic file icon for all attachment types
- Directive: Added directive to writeApp.md: attachment displays should show file-type-specific icons/thumbnails
