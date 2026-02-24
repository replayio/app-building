# Bug Reports

## Open

(none)

## Unreviewed

2/24/2026: All sidebar tests fail because the catch-all SPA redirect in netlify.toml intercepts Vite dev server module requests, preventing React from mounting (SidebarNotRendering)
- Analysis: docs/bugs/SidebarNotRendering.md
- Before fix: 8bbb1fd
- After fix: 1ea3778

## Finished

2/24/2026: Row action menu clicks are intercepted by table cells due to overflow hidden on the table and missing z-index on the action wrapper (RowActionMenu)
- Analysis: docs/bugs/RowActionMenu.md
- Before fix: 8bbb1fd
- After fix: 1ea3778
- Problem stage: writeApp.md (styling/UI bug — CSS overflow and z-index issues)
- Directive update: Added directive to writeApp.md against using overflow hidden on containers with absolutely-positioned children, and requiring explicit z-index on floating UI wrappers.

2/24/2026: Sidebar navigation links are not available on pages other than Clients because only ClientsListPage includes the Sidebar component (SidebarNavigationLinks)
- Analysis: docs/bugs/SidebarNavigationLinks.md
- Before fix: 8bbb1fd
- After fix: 1ea3778
- Problem stage: writeTests.md (test spec correctly implies sidebar on all pages via sequential navigation flow, but test implementation worked around the missing sidebar with page.goto instead of catching the bug)
- Directive update: Added directive to writeTests.md against using page.goto() workarounds when a test spec implies a component should be available on the current page, requiring tests to interact with the component on each page it should appear on.

