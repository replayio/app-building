# Bug Reports

## Open

2/14/2026: When on the clients page both the "dashboard" and "clients" are highlighted. no point having duplicates, just remove the dashboard here

2/14/2026: "Reports" link on left goes to a 404. all links must go to valid locations

2/14/2026: "Settings" button in lower left does not do anything. all enabled buttons must do something

2/14/2026: Add a task detail page that has all pertinent information and can be used to mark the task completed or canceled, or add notes

2/14/2026: On deals page the dropdowns look good but when clicked they revert to the browser's default styling which is ugly. when clicked they should be styled appropriately

## Unreviewed

2/14/2026: Attachments on clients page should show a preview with the file type and thumbnail for images. all attachment displays should look this way
- Analysis: docs/bugs/AttachmentPreview.md
- Before: 0301f38
- After: (pending commit)
- Fix: Added AttachmentPreview component with file-type-specific icons (Document, Image, Spreadsheet, etc.) and image thumbnails. Updated both client and deal attachment displays. Updated test spec and tests.
