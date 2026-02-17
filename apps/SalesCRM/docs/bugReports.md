# Bug Reports

## Open

(none)

## Unreviewed

(none)

## Finished

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
