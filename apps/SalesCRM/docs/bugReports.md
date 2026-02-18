# Bug Reports

## Open

## Unreviewed

## Finished

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
