# Strategy

You are writing a complete, detailed test specification for an app based on an initial app specification.

## Requirements

The test spec must be written in docs/tests.md. This file is organized by page, with one or more test entries for the page.

- The test entries must match the app spec as closely as possible.
- Use behavior driven development to formulate test entries: describe the initial conditions of the app's state, the action the user takes, and the changes to the app that should occur afterwards.
- Test entries must all have titles.
- Test entries must be grouped by page in the app.
- Test entries must indicate the components on that page they are exercising.
- Every interactive element (buttons etc) in the component must be tested. There must be a comment in the JSX next to every interactive element with the titles of the tests that exercise it.
- The test must verify that the interactive element actually works and does what the user expects. For example, clicking a button must do something, and text added to forms must be reflected in the app state afterwards.
- Adding extra necessary features beyond the mockup may be needed for a complete, functional app (e.g. create/delete buttons, navigation, form validation).

## Tasks

Make sure there are toplevel tasks for each page which the app needs. Get these pages from the spec, creating additional pages if needed, or reason about the app's requirements to decide on the pages it needs.

When working on a toplevel task for a page, if the page is complicated break it down into subtasks for the different components of the page.

When working on a task for a page or its components, make sure docs/tests.md completely describes the page/component's requirements.

## Tips
