# Bug Reports

## Open

(none)

## Unreviewed

2/14/2026: Add a task detail page that has all pertinent information and can be used to mark the task completed or canceled, or add notes
- Analysis: docs/bugs/TaskDetailPage.md
- Before: fc47dd2
- After: 460f4c1
- Fix: Added TaskDetailPage with header (title, priority, status, back/complete/cancel), notes section (add/delete/empty state), and 7 new Playwright tests. Added task_notes table, GET/POST/DELETE API endpoints for notes. Task cards now navigate to /tasks/:taskId.


2/14/2026: When on the clients page both the "dashboard" and "clients" are highlighted. no point having duplicates, just remove the dashboard here
- Analysis: docs/bugs/DashboardHighlight.md
- Before: 78daa0a
- After: fc47dd2
- Fix: Removed "Dashboard" entry from sidebar navigation. Both linked to /clients.

2/14/2026: "Reports" link on left goes to a 404. all links must go to valid locations
- Analysis: docs/bugs/Reports404.md
- Before: 78daa0a
- After: fc47dd2
- Fix: Removed "Reports" link from sidebar. No /reports route exists.

2/14/2026: "Settings" button in lower left does not do anything. all enabled buttons must do something
- Analysis: docs/bugs/SettingsButton.md
- Before: 78daa0a
- After: fc47dd2
- Fix: Removed "Settings" button from sidebar. No /settings route exists.

2/14/2026: On deals page the dropdowns look good but when clicked they revert to the browser's default styling which is ugly. when clicked they should be styled appropriately
- Analysis: docs/bugs/DealsDropdownStyling.md
- Before: 0cd095c
- After: 78daa0a
- Fix: Replaced native `<select>` elements in DealsFilterControls with custom dropdown component using React state, styled menu, and click-outside-to-close behavior. Updated all DLP-FLT tests.

2/14/2026: Attachments on clients page should show a preview with the file type and thumbnail for images. all attachment displays should look this way
- Analysis: docs/bugs/AttachmentPreview.md
- Before: 0301f38
- After: 0cd095c
- Fix: Added AttachmentPreview component with file-type-specific icons (Document, Image, Spreadsheet, etc.) and image thumbnails. Updated both client and deal attachment displays. Updated test spec and tests.
