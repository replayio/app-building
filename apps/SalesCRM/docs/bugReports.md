# Bug Reports

## Open

(none)

## Unreviewed

2/24/2026: All sidebar tests fail because the catch-all SPA redirect in netlify.toml intercepts Vite dev server module requests, preventing React from mounting (SidebarNotRendering)
- Analysis: docs/bugs/SidebarNotRendering.md
- Before fix: 8bbb1fd
- After fix: 1ea3778

2/24/2026: Sidebar navigation links are not available on pages other than Clients because only ClientsListPage includes the Sidebar component (SidebarNavigationLinks)
- Analysis: docs/bugs/SidebarNavigationLinks.md
- Before fix: 8bbb1fd
- After fix: 1ea3778

## Finished

2/24/2026: Row action menu clicks are intercepted by table cells due to overflow hidden on the table and missing z-index on the action wrapper (RowActionMenu)
- Analysis: docs/bugs/RowActionMenu.md
- Before fix: 8bbb1fd
- After fix: 1ea3778
- Problem stage: writeApp.md (styling/UI bug — CSS overflow and z-index issues)
- Directive update: Added directive to writeApp.md against using overflow hidden on containers with absolutely-positioned children, and requiring explicit z-index on floating UI wrappers.

