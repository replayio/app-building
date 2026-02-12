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

The last task done to specify the test entries for a page must require committing and exiting afterwards.

When working on a task for a page or its components, make sure docs/tests.md completely describes the page/component's requirements.

## Directives

- Images of different pages in the app spec might not have consistent styling or navigation elements with each other. Prioritize a consistent navigation / styling over exact adherence to the images.

- Systematically inventory every visible element in each mockup — every column header, filter control, button, icon, badge, and section. Write a test entry for each one. It is easy to gloss over elements that seem minor or to only test the most prominent features.

- Do not substitute easier-to-implement elements for what the mockup shows. If a table has columns that require joins or computed values, test for all those columns — do not replace them with simpler alternatives. If a mockup shows four filter controls, test for all four — not just the two easiest ones.

- For every clickable element, the test entry must specify the exact navigation target or action result. Do not leave navigation destinations ambiguous.

- For any user action that mutates data, write test entries verifying that the change is persisted correctly and that exactly the right side effects occur (e.g. history/timeline entries are created, and only one per action — not duplicates).

- Button and control appearance matters: if a mockup shows specific text, icons, or styling for a button, the test entry should verify that appearance — not just that some button exists.

- Completely test that modal dialogs work properly.

- Attachment functionality should support file uploads unless the mockup specifically indicates something else.

- State-changing actions must have tests that when performed other parts of the app update appropriately. For example:
* If the app has a timeline or history feature, every mutation that the timeline tracks must write a history entry. Ensure this happens atomically to avoid duplicates from re-renders. Think through every field that can change and whether it needs history tracking.
