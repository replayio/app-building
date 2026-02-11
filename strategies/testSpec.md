# Strategy

You are writing a complete, detailed test specification for an app based on an initial app specification.

## Requirements

The test spec must be written in docs/tests.md. This file is organized by page, with one or more test entries for the page.

- The test entries must match the app spec as closely as possible.
- If there are image URLs in the app spec, download them and follow them carefully. IMPORTANT: If you're unable to view the images directly, download them and read them from disk.
- Use behavior driven development to formulate test entries: describe the initial conditions of the app's state, the action the user takes, and the changes to the app that should occur afterwards.
- Test entries must all have titles.
- Test entries must be grouped by page in the app.
- Test entries must indicate the components on that page they are exercising.
- Every interactive element (buttons etc) in the component must be tested. There must be a comment in the JSX next to every interactive element with the titles of the tests that exercise it.
- The test must verify that the interactive element actually works and does what the user expects. For example, clicking a button must do something, and text added to forms must be reflected in the app state afterwards.
- Adding extra necessary features beyond the app spec may be needed for a complete, functional app (e.g. create/delete buttons, navigation, form validation).

## Tasks

Make sure there are toplevel tasks for each page which the app needs. Get these pages from the spec, creating additional pages if needed, or reason about the app's requirements to decide on the pages it needs.

When working on a toplevel task for a page, if the page is complicated break it down into subtasks for the different components of the page.

When working on a task for a page or its components, make sure docs/tests.md completely describes the page/component's requirements.

## Tips

- Images of different pages in the app spec might not have consistent styling or navigation elements with each other. Prioritize a consistent navigation / styling over exact adherence to the images.

- Systematically inventory every visible element in each mockup — every column header, filter control, button, icon, badge, and section. Write a test entry for each one. It is easy to gloss over elements that seem minor or to only test the most prominent features.

- For every clickable element, the test entry must specify the exact navigation target or action result. Do not leave navigation destinations ambiguous — otherwise the implementation may link to a generic list page instead of a specific detail view.

- For any user action that mutates data, write test entries verifying that the change is persisted correctly and that exactly the right side effects occur (e.g. history/timeline entries are created, and only one per action — not duplicates).

- Button and control appearance matters: if a mockup shows specific text, icons, or styling for a button, the test entry should verify that appearance — not just that some button exists.

- Clarify interaction models for features like file attachments: does "add" mean file upload, URL input, or both? The mockup usually shows the answer — the test spec must be explicit about it.
